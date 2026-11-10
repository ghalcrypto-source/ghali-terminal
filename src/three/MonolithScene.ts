import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FinishId, CameraPreset } from '../types/contrarian';
import {
  FINISH_THEMES,
  createVernierDialTexture,
  createContactShadowTexture,
  createBrushedMetalRoughnessTexture,
} from './materials';

export interface PartInfo {
  name: string;
  category: string;
  description: string;
  metric: string;
}

export class MonolithScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private clock = new THREE.Clock();
  private frameId: number = 0;
  private isSoftwareGl: boolean = false;
  private isDisposed: boolean = false;

  // Lighting
  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private rimLight!: THREE.DirectionalLight;

  // Procedural 8-Part Model Group & Components
  private rootGroup!: THREE.Group;
  private basePedestal!: THREE.Group;
  private dialDiscMesh!: THREE.Mesh;
  private outerGimbalGroup!: THREE.Group;
  private gearEscapementGroup!: THREE.Group;
  private innerGimbalGroup!: THREE.Group;
  private monolithCoreGroup!: THREE.Group;
  private laserNeedleGroup!: THREE.Group;
  private contactShadowMesh!: THREE.Mesh;
  private satellitesMesh!: THREE.InstancedMesh;
  private satelliteCount = 20;

  // Materials References for theme switching
  private primaryMetalMaterial!: THREE.MeshStandardMaterial;
  private secondaryMetalMaterial!: THREE.MeshStandardMaterial;
  private coreCrystalMaterial!: THREE.MeshPhysicalMaterial;
  private dialMaterial!: THREE.MeshStandardMaterial;
  private glowMaterial!: THREE.MeshBasicMaterial;
  private gearMaterial!: THREE.MeshStandardMaterial;

  // Textures
  private dialTexture!: THREE.CanvasTexture;
  private contactTexture!: THREE.CanvasTexture;
  private roughnessTexture!: THREE.CanvasTexture;

  // Animation & Kinematics State
  public explodedValue = 0; // 0.0 to 1.0
  private currentExploded = 0;
  public autoRotate = true;
  public rotationSpeed = 1.0;
  public currentTheme: FinishId = 'obsidian-gold';

  // Camera Target Interpolation
  private targetCameraPos = new THREE.Vector3(5.5, 3.8, 5.5);
  private targetLookAt = new THREE.Vector3(0, 1.8, 0);
  private currentLookAt = new THREE.Vector3(0, 1.8, 0);

  // Scratch objects for zero-GC render loop
  private _vec3A = new THREE.Vector3();
  private _mat4A = new THREE.Matrix4();
  private _colorA = new THREE.Color();
  private _raycaster = new THREE.Raycaster();
  private _pointer = new THREE.Vector2(-999, -999);

  // Interactive callbacks
  public onPartHover?: (part: PartInfo | null) => void;
  public onPartSelect?: (part: PartInfo) => void;

  private interactiveMeshes: { mesh: THREE.Object3D; info: PartInfo }[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    const initialTheme = FINISH_THEMES[this.currentTheme];
    this.scene.background = new THREE.Color(initialTheme.bgHorizonColor);
    this.scene.fog = new THREE.FogExp2(initialTheme.bgHorizonColor, 0.038);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      100
    );
    this.camera.position.copy(this.targetCameraPos);

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep slightly above horizon plane
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 16.0;
    this.controls.target.copy(this.targetLookAt);

    // 5. Studio Environment Map (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Balanced 3-Point Lighting Rig
    this.setupLighting();

    // 7. Textures & Materials
    this.setupTextures();

    // 8. Assemble 8-Part Procedural Model
    this.assembleProceduralModel();

    // 9. Event Listeners
    window.addEventListener('resize', this.onResize);
    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('click', this.onClick);

    // 10. Start Loop
    this.animate();
  }

  private setupLighting() {
    const theme = FINISH_THEMES[this.currentTheme];

    // Warm Key Light with tight shadow frustum
    this.keyLight = new THREE.DirectionalLight(theme.keyLightColor, 2.4);
    this.keyLight.position.set(6, 9, 5);
    this.keyLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      this.keyLight.shadow.mapSize.width = 2048;
      this.keyLight.shadow.mapSize.height = 2048;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
      const d = 4.2;
      this.keyLight.shadow.camera.left = -d;
      this.keyLight.shadow.camera.right = d;
      this.keyLight.shadow.camera.top = d;
      this.keyLight.shadow.camera.bottom = -d;
      this.keyLight.shadow.camera.near = 1;
      this.keyLight.shadow.camera.far = 25;
    }
    this.scene.add(this.keyLight);

    // Cool Hemisphere Fill Light
    this.hemiLight = new THREE.HemisphereLight(0x93c5fd, theme.ambientLightColor, 1.2);
    this.scene.add(this.hemiLight);

    // Rim/Kicker Light
    this.rimLight = new THREE.DirectionalLight(theme.accentGlowColor, 1.6);
    this.rimLight.position.set(-6, 4, -5);
    this.scene.add(this.rimLight);
  }

  private setupTextures() {
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const theme = FINISH_THEMES[this.currentTheme];
    const accentHex = '#' + theme.accentGlowColor.toString(16).padStart(6, '0');

    this.dialTexture = createVernierDialTexture(accentHex);
    this.dialTexture.anisotropy = maxAnisotropy;

    this.contactTexture = createContactShadowTexture();
    this.roughnessTexture = createBrushedMetalRoughnessTexture();

    // Setup materials
    this.primaryMetalMaterial = new THREE.MeshStandardMaterial({
      color: theme.primaryMetalColor,
      metalness: theme.metalnessPrimary,
      roughness: theme.roughnessPrimary,
      roughnessMap: this.roughnessTexture,
      envMapIntensity: 1.2,
    });

    this.secondaryMetalMaterial = new THREE.MeshStandardMaterial({
      color: theme.secondaryMetalColor,
      metalness: theme.metalnessSecondary,
      roughness: theme.roughnessSecondary,
      envMapIntensity: 1.4,
    });

    this.gearMaterial = new THREE.MeshStandardMaterial({
      color: theme.primaryMetalColor,
      metalness: 0.95,
      roughness: 0.16,
      envMapIntensity: 1.5,
    });

    this.coreCrystalMaterial = new THREE.MeshPhysicalMaterial({
      color: theme.coreCrystalColor,
      metalness: 0.12,
      roughness: 0.04,
      transmission: this.isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: this.isSoftwareGl ? 0.85 : 0.96,
      ior: 1.85,
      thickness: 1.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.0,
    });

    this.dialMaterial = new THREE.MeshStandardMaterial({
      map: this.dialTexture,
      roughness: 0.25,
      metalness: 0.7,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: theme.accentGlowColor,
      wireframe: true,
    });
  }

  /**
   * Assembles the 8-Part Procedural Model with mathematically coordinated parts
   * and grounded pivot at (0, 0, 0) flush with the contact shadow.
   */
  private assembleProceduralModel() {
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // ==========================================
    // PART 1: Soft Contact Shadow Plane (Ground)
    // ==========================================
    const shadowGeo = new THREE.PlaneGeometry(7.5, 7.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.contactTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    this.contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadowMesh.rotation.x = -Math.PI / 2;
    this.contactShadowMesh.position.y = 0.002; // Offset >= 0.02 to avoid coplanar z-fighting
    this.rootGroup.add(this.contactShadowMesh);

    // ==========================================
    // PART 2: Base Resonator & Stepped Pedestal
    // ==========================================
    this.basePedestal = new THREE.Group();
    this.basePedestal.position.y = 0;

    // Stepped plinth: primary base ring
    const plinthGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.18, 64);
    const plinthMesh = new THREE.Mesh(plinthGeo, this.secondaryMetalMaterial);
    plinthMesh.position.y = 0.09;
    plinthMesh.castShadow = !this.isSoftwareGl;
    plinthMesh.receiveShadow = !this.isSoftwareGl;
    this.basePedestal.add(plinthMesh);

    // Milled sub-ring
    const subRingGeo = new THREE.CylinderGeometry(2.1, 2.2, 0.12, 64);
    const subRingMesh = new THREE.Mesh(subRingGeo, this.primaryMetalMaterial);
    subRingMesh.position.y = 0.22;
    subRingMesh.castShadow = !this.isSoftwareGl;
    this.basePedestal.add(subRingMesh);

    // PART 2.1: Dial Face Disc with Procedural Calibration Markings
    const dialDiscGeo = new THREE.CylinderGeometry(1.98, 1.98, 0.02, 64);
    this.dialDiscMesh = new THREE.Mesh(dialDiscGeo, this.dialMaterial);
    this.dialDiscMesh.position.y = 0.29;
    this.dialDiscMesh.receiveShadow = !this.isSoftwareGl;
    this.basePedestal.add(this.dialDiscMesh);

    // Dial outer bevel rim
    const rimGeo = new THREE.TorusGeometry(2.0, 0.04, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeo, this.primaryMetalMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.3;
    this.basePedestal.add(rimMesh);

    this.rootGroup.add(this.basePedestal);
    this.registerInteractive(plinthMesh, {
      name: 'Resonator Plinth',
      category: 'Foundation / Damping Pedestal',
      description: 'Stabilizes institutional sentiment telemetry against high-frequency micro-volatility.',
      metric: 'Damping Factor: 0.984 • Grounded',
    });

    // ==========================================
    // PART 3: Primary Outer Gimbal Ring (Titanium)
    // ==========================================
    this.outerGimbalGroup = new THREE.Group();
    this.outerGimbalGroup.position.y = 1.9;

    // Milled toroidal ring with bevels
    const outerTorusGeo = new THREE.TorusGeometry(1.65, 0.075, 24, 64);
    const outerTorusMesh = new THREE.Mesh(outerTorusGeo, this.primaryMetalMaterial);
    outerTorusMesh.castShadow = !this.isSoftwareGl;
    this.outerGimbalGroup.add(outerTorusMesh);

    // Gimbal Trunnions / Mount Pivots (North & South poles)
    const pivotGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 24);
    const pivotN = new THREE.Mesh(pivotGeo, this.secondaryMetalMaterial);
    pivotN.position.y = 1.65;
    const pivotS = new THREE.Mesh(pivotGeo, this.secondaryMetalMaterial);
    pivotS.position.y = -1.65;
    this.outerGimbalGroup.add(pivotN, pivotS);

    this.rootGroup.add(this.outerGimbalGroup);
    this.registerInteractive(outerTorusMesh, {
      name: 'Primary Gimbal Horizon',
      category: 'Macro Orientation Ring',
      description: 'Rotates along the global asset allocation axis, capturing shifts between risk-on and risk-off.',
      metric: 'Azimuth Inclination: 23.4° • Calibrated',
    });

    // ==========================================
    // PART 4: Counter-Rotating Escapement Gear Ring
    // ==========================================
    this.gearEscapementGroup = new THREE.Group();
    this.gearEscapementGroup.position.y = 1.9;

    // Gear hub ring
    const gearRingGeo = new THREE.TorusGeometry(1.4, 0.05, 16, 64);
    const gearRingMesh = new THREE.Mesh(gearRingGeo, this.gearMaterial);
    this.gearEscapementGroup.add(gearRingMesh);

    // 24 Milled Escapement Teeth along circumference
    const toothCount = 24;
    const toothGeo = new THREE.BoxGeometry(0.06, 0.16, 0.04);
    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeo, this.gearMaterial);
      tooth.position.set(Math.cos(angle) * 1.4, Math.sin(angle) * 1.4, 0);
      tooth.rotation.z = angle + Math.PI / 2;
      this.gearEscapementGroup.add(tooth);
    }

    this.rootGroup.add(this.gearEscapementGroup);
    this.registerInteractive(gearRingMesh, {
      name: 'Reflexive Escapement Gear',
      category: 'Liquidity Unwind Governor',
      description: 'Controls the release rate of accumulated herd tension; prevents abrupt systemic halts.',
      metric: '24 Precision Teeth • Ratio 1:4.1',
    });

    // ==========================================
    // PART 5: Inner Gyroscopic Armature (Blued Steel)
    // ==========================================
    this.innerGimbalGroup = new THREE.Group();
    this.innerGimbalGroup.position.y = 1.9;

    const innerTorusGeo = new THREE.TorusGeometry(1.15, 0.055, 20, 48);
    const innerTorusMesh = new THREE.Mesh(innerTorusGeo, this.secondaryMetalMaterial);
    innerTorusMesh.rotation.x = Math.PI / 2;
    innerTorusMesh.castShadow = !this.isSoftwareGl;
    this.innerGimbalGroup.add(innerTorusMesh);

    this.rootGroup.add(this.innerGimbalGroup);
    this.registerInteractive(innerTorusMesh, {
      name: 'Orthogonal Gyroscopic Armature',
      category: 'Skew & Kurtosis Balancer',
      description: 'Tilts in response to put/call skew disequilibrium and gamma exposure asymmetry.',
      metric: 'Gamma Sensitivity: +0.42 • Active',
    });

    // ==========================================
    // PART 6: Central Levitating Monolith Core (Crystal)
    // ==========================================
    this.monolithCoreGroup = new THREE.Group();
    this.monolithCoreGroup.position.y = 1.9;

    // Octahedral crystalline prism
    const crystalGeo = new THREE.OctahedronGeometry(0.68, 0);
    const crystalMesh = new THREE.Mesh(crystalGeo, this.coreCrystalMaterial);
    crystalMesh.castShadow = !this.isSoftwareGl;
    this.monolithCoreGroup.add(crystalMesh);

    // Glowing internal wireframe armature
    const wireGeo = new THREE.OctahedronGeometry(0.7, 0);
    const wireMesh = new THREE.Mesh(wireGeo, this.glowMaterial);
    this.monolithCoreGroup.add(wireMesh);

    // Sub-core levitating micro-cube
    const microGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const microMesh = new THREE.Mesh(microGeo, this.primaryMetalMaterial);
    this.monolithCoreGroup.add(microMesh);

    this.rootGroup.add(this.monolithCoreGroup);
    this.registerInteractive(crystalMesh, {
      name: 'Contrarian Monolith Core',
      category: 'Central Asymmetry Resonator',
      description: 'Pulsates with unpriced tail risk. Shifts hue as consensus crowds into terminal complacency.',
      metric: 'Crowd Dislocation Index: 88.4 / 100',
    });

    // ==========================================
    // PART 7: Precision Caliper Vernier Needle & Laser
    // ==========================================
    this.laserNeedleGroup = new THREE.Group();
    this.laserNeedleGroup.position.y = 0.35;

    // Caliper bar
    const needleGeo = new THREE.CylinderGeometry(0.015, 0.02, 1.85, 16);
    const needleMesh = new THREE.Mesh(needleGeo, this.primaryMetalMaterial);
    needleMesh.rotation.z = Math.PI / 2;
    needleMesh.position.x = 0.92;
    this.laserNeedleGroup.add(needleMesh);

    // Needle pointer tip
    const coneGeo = new THREE.ConeGeometry(0.05, 0.15, 16);
    const coneMesh = new THREE.Mesh(coneGeo, this.secondaryMetalMaterial);
    coneMesh.rotation.z = -Math.PI / 2;
    coneMesh.position.x = 1.88;
    this.laserNeedleGroup.add(coneMesh);

    // Vertical collimated optic laser beam connecting pedestal to core
    const beamGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.6, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: FINISH_THEMES[this.currentTheme].accentGlowColor,
      transparent: true,
      opacity: 0.75,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 0.8;
    this.laserNeedleGroup.add(beamMesh);

    this.rootGroup.add(this.laserNeedleGroup);
    this.registerInteractive(needleMesh, {
      name: 'Vernier Divergence Needle',
      category: 'Asymmetry Inscription Caliper',
      description: 'Indexes real-time spread between public narrative and actual institutional capital flow.',
      metric: 'Dislocation Angle: 47.8° • High Divergence',
    });

    // ==========================================
    // PART 8: Instanced Orbital Consensus Satellites
    // ==========================================
    const satelliteGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const satelliteMat = new THREE.MeshStandardMaterial({
      color: FINISH_THEMES[this.currentTheme].primaryMetalColor,
      metalness: 0.9,
      roughness: 0.15,
      envMapIntensity: 1.5,
    });
    this.satellitesMesh = new THREE.InstancedMesh(satelliteGeo, satelliteMat, this.satelliteCount);
    this.satellitesMesh.frustumCulled = false;

    for (let i = 0; i < this.satelliteCount; i++) {
      const angle = (i / this.satelliteCount) * Math.PI * 2;
      const radius = 2.15 + (i % 3) * 0.25;
      const y = 1.6 + ((i % 5) - 2) * 0.18;
      this._mat4A.makeTranslation(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      this.satellitesMesh.setMatrixAt(i, this._mat4A);
    }
    this.satellitesMesh.instanceMatrix.needsUpdate = true;
    this.rootGroup.add(this.satellitesMesh);
  }

  private registerInteractive(mesh: THREE.Object3D, info: PartInfo) {
    this.interactiveMeshes.push({ mesh, info });
  }

  /**
   * Applies finish theme (PBR colors, roughness, lighting, horizon fog)
   */
  public setTheme(themeId: FinishId) {
    this.currentTheme = themeId;
    const theme = FINISH_THEMES[themeId];

    this.scene.background = new THREE.Color(theme.bgHorizonColor);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.setHex(theme.bgHorizonColor);
    }

    this.primaryMetalMaterial.color.setHex(theme.primaryMetalColor);
    this.primaryMetalMaterial.metalness = theme.metalnessPrimary;
    this.primaryMetalMaterial.roughness = theme.roughnessPrimary;

    this.secondaryMetalMaterial.color.setHex(theme.secondaryMetalColor);
    this.secondaryMetalMaterial.metalness = theme.metalnessSecondary;
    this.secondaryMetalMaterial.roughness = theme.roughnessSecondary;

    this.gearMaterial.color.setHex(theme.primaryMetalColor);

    this.coreCrystalMaterial.color.setHex(theme.coreCrystalColor);

    this.glowMaterial.color.setHex(theme.accentGlowColor);

    this.keyLight.color.setHex(theme.keyLightColor);
    this.hemiLight.groundColor.setHex(theme.ambientLightColor);
    this.rimLight.color.setHex(theme.accentGlowColor);

    // Update dial canvas
    const accentHex = '#' + theme.accentGlowColor.toString(16).padStart(6, '0');
    this.dialTexture.dispose();
    this.dialTexture = createVernierDialTexture(accentHex);
    this.dialTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.dialMaterial.map = this.dialTexture;
    this.dialMaterial.needsUpdate = true;
  }

  /**
   * Smooth camera preset transition
   */
  public setCameraPreset(preset: CameraPreset) {
    switch (preset) {
      case 'macro':
        this.targetCameraPos.set(5.5, 3.8, 5.5);
        this.targetLookAt.set(0, 1.8, 0);
        break;
      case 'core':
        this.targetCameraPos.set(2.4, 2.2, 2.4);
        this.targetLookAt.set(0, 1.9, 0);
        break;
      case 'escapement':
        this.targetCameraPos.set(0, 2.5, 3.2);
        this.targetLookAt.set(0, 1.9, 0);
        break;
      case 'radar':
        this.targetCameraPos.set(3.2, 4.6, 2.8);
        this.targetLookAt.set(0, 0.5, 0);
        break;
      case 'topdown':
        this.targetCameraPos.set(0.01, 7.5, 0.01);
        this.targetLookAt.set(0, 1.2, 0);
        break;
    }
  }

  // Pointer interactions
  private onPointerMove = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this._pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._pointer, this.camera);
    const meshes = this.interactiveMeshes.map((item) => item.mesh);
    const intersects = this._raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const found = this.interactiveMeshes.find((item) => item.mesh === hit || item.mesh.children.includes(hit));
      if (found && this.onPartHover) {
        this.onPartHover(found.info);
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    if (this.onPartHover) {
      this.onPartHover(null);
      document.body.style.cursor = 'default';
    }
  };

  private onClick = () => {
    this._raycaster.setFromCamera(this._pointer, this.camera);
    const meshes = this.interactiveMeshes.map((item) => item.mesh);
    const intersects = this._raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const found = this.interactiveMeshes.find((item) => item.mesh === hit || item.mesh.children.includes(hit));
      if (found && this.onPartSelect) {
        this.onPartSelect(found.info);
      }
    }
  };

  private onResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Continuous animation loop with Software WebGL Guard (afterDraw)
   */
  private animate = () => {
    if (this.isDisposed) return;

    const tick = () => {
      if (this.isDisposed) return;
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      // 1. Exponential Damping for Exploded View
      this.currentExploded = THREE.MathUtils.damp(this.currentExploded, this.explodedValue, 6, dt);

      // 2. Exponential Damping for Camera Transitions
      this.camera.position.lerp(this.targetCameraPos, 1 - Math.exp(-4 * dt));
      this.currentLookAt.lerp(this.targetLookAt, 1 - Math.exp(-4 * dt));
      this.controls.target.copy(this.currentLookAt);
      this.controls.update();

      // 3. Procedural Mechanical Rotations
      if (this.autoRotate) {
        const speed = this.rotationSpeed;
        // Outer Gimbal rotates steadily
        this.outerGimbalGroup.rotation.y += 0.35 * speed * dt;
        // Escapement Gear counter-rotates with rhythmic micro-stepping
        this.gearEscapementGroup.rotation.z -= 0.65 * speed * dt;
        // Inner Gimbal wobbles on X and tilts
        this.innerGimbalGroup.rotation.x = Math.sin(elapsed * 0.8 * speed) * 0.45;
        this.innerGimbalGroup.rotation.z += 0.5 * speed * dt;
        // Monolith Core levitates and rotates on dual axes
        this.monolithCoreGroup.rotation.y += 0.8 * speed * dt;
        this.monolithCoreGroup.rotation.x = Math.cos(elapsed * 1.2 * speed) * 0.15;
        // Laser needle sweeps around dial face
        this.laserNeedleGroup.rotation.y = Math.sin(elapsed * 0.5 * speed) * 1.2;
      }

      // 4. Kinematics of Exploded View
      const ex = this.currentExploded;
      // Pedestal shifts down
      this.basePedestal.position.y = -0.6 * ex;
      // Outer Gimbal expands up and scales
      this.outerGimbalGroup.position.y = 1.9 + 0.8 * ex;
      const outerScale = 1.0 + 0.22 * ex;
      this.outerGimbalGroup.scale.set(outerScale, outerScale, outerScale);

      // Escapement Gear ring elevates higher
      this.gearEscapementGroup.position.y = 1.9 + 1.65 * ex;

      // Inner Gimbal elevates
      this.innerGimbalGroup.position.y = 1.9 + 2.5 * ex;

      // Monolith Core elevates to apex
      this.monolithCoreGroup.position.y = 1.9 + 3.4 * ex;

      // Laser needle separates
      this.laserNeedleGroup.position.y = 0.35 + 0.3 * ex;

      // Instanced satellites expand orbital radius
      const baseRadiusMul = 1.0 + 0.7 * ex;
      for (let i = 0; i < this.satelliteCount; i++) {
        const baseAngle = (i / this.satelliteCount) * Math.PI * 2;
        const currentAngle = baseAngle + elapsed * (0.3 + (i % 3) * 0.1);
        const radius = (2.15 + (i % 3) * 0.25) * baseRadiusMul;
        const y = (1.6 + ((i % 5) - 2) * 0.18) * (1 + 0.5 * ex) + Math.sin(elapsed * 2 + i) * 0.08;
        this._mat4A.makeTranslation(Math.cos(currentAngle) * radius, y, Math.sin(currentAngle) * radius);
        this.satellitesMesh.setMatrixAt(i, this._mat4A);
      }
      this.satellitesMesh.instanceMatrix.needsUpdate = true;

      // 5. Render Scene
      this.renderer.render(this.scene, this.camera);

      // 6. Schedule next frame (Software WebGL Guard)
      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  };

  /**
   * Software WebGL fence sync pacing
   */
  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('click', this.onClick);

    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}

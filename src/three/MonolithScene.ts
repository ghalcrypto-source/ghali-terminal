import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FinishId, CameraPreset } from '../types/contrarian';
import {
  FINISH_THEMES,
  createVernierDialTexture,
  createContactShadowTexture,
  createBrushedMetalRoughnessTexture,
  createBitcoinCoreTexture,
  createAltcoinFaceTexture,
  createAltcoinBadgeSpriteTexture,
} from './materials';

export interface PartInfo {
  name: string;
  category: string;
  description: string;
  metric: string;
}

export interface Altcoin5mMetric {
  change5m: number;
  price?: number;
}

interface AltcoinOrbiter {
  group: THREE.Group;
  symbol: string;
  name: string;
  color: string;
  radius: number;
  baseAngle: number;
  speed: number;
  yOffset: number;
  tiltX: number;
  tiltZ: number;
  change5m: number;
  price: number;
  faceMat: THREE.MeshStandardMaterial;
  faceTex: THREE.CanvasTexture;
  rimMat: THREE.MeshStandardMaterial;
  badgeSprite: THREE.Sprite;
  badgeMat: THREE.SpriteMaterial;
  badgeTex: THREE.CanvasTexture;
  partInfo: PartInfo;
}

const ORBITING_ALTCOINS = [
  { symbol: 'ETH', name: 'Ethereum', color: '#627eea', radius: 2.35, speed: 0.42, yOffset: 0.12, tiltX: 0.14, tiltZ: 0.08, default5m: 0.42 },
  { symbol: 'SOL', name: 'Solana', color: '#14f195', radius: 2.48, speed: 0.52, yOffset: -0.18, tiltX: -0.12, tiltZ: 0.15, default5m: 0.85 },
  { symbol: 'BNB', name: 'BNB Chain', color: '#f3ba2f', radius: 2.62, speed: 0.36, yOffset: 0.24, tiltX: 0.18, tiltZ: -0.1, default5m: -0.24 },
  { symbol: 'XRP', name: 'Ripple', color: '#38bdf8', radius: 2.38, speed: 0.46, yOffset: -0.05, tiltX: -0.08, tiltZ: -0.14, default5m: -0.51 },
  { symbol: 'DOGE', name: 'Dogecoin', color: '#fbbf24', radius: 2.75, speed: 0.38, yOffset: 0.08, tiltX: 0.1, tiltZ: 0.12, default5m: 0.67 },
  { symbol: 'SUI', name: 'Sui', color: '#22d3ee', radius: 2.55, speed: 0.56, yOffset: -0.22, tiltX: -0.16, tiltZ: 0.06, default5m: 1.14 },
  { symbol: 'ADA', name: 'Cardano', color: '#3b82f6', radius: 2.86, speed: 0.32, yOffset: 0.18, tiltX: 0.12, tiltZ: -0.16, default5m: -0.38 },
  { symbol: 'AVAX', name: 'Avalanche', color: '#ef4444', radius: 2.42, speed: 0.48, yOffset: 0.30, tiltX: -0.14, tiltZ: 0.1, default5m: -0.62 },
  { symbol: 'LINK', name: 'Chainlink', color: '#60a5fa', radius: 2.70, speed: 0.40, yOffset: -0.26, tiltX: 0.09, tiltZ: 0.14, default5m: 0.31 },
  { symbol: 'TAO', name: 'Bittensor', color: '#a855f7', radius: 2.92, speed: 0.34, yOffset: 0.02, tiltX: -0.1, tiltZ: -0.12, default5m: 0.94 },
];

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
  private btcCoreLight!: THREE.PointLight;

  // Procedural Multi-Part Model Group & Components
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
  private satelliteCount = 24;
  private altcoinOrbiters: AltcoinOrbiter[] = [];
  private orbitTracksGroup!: THREE.Group;

  // Materials References for theme switching
  private primaryMetalMaterial!: THREE.MeshStandardMaterial;
  private secondaryMetalMaterial!: THREE.MeshStandardMaterial;
  private coreCrystalMaterial!: THREE.MeshPhysicalMaterial;
  private btcGoldMaterial!: THREE.MeshStandardMaterial;
  private btcFaceMaterial!: THREE.MeshStandardMaterial;
  private dialMaterial!: THREE.MeshStandardMaterial;
  private glowMaterial!: THREE.MeshBasicMaterial;
  private gearMaterial!: THREE.MeshStandardMaterial;

  // Textures
  private dialTexture!: THREE.CanvasTexture;
  private contactTexture!: THREE.CanvasTexture;
  private roughnessTexture!: THREE.CanvasTexture;
  private btcFaceTexture!: THREE.CanvasTexture;
  private altcoinTextures: THREE.CanvasTexture[] = [];

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
  private btcPartInfo!: PartInfo;

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
    this.btcFaceTexture = createBitcoinCoreTexture(accentHex);
    this.btcFaceTexture.anisotropy = maxAnisotropy;

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

    this.btcGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.96,
      roughness: 0.16,
      emissive: 0x78350f,
      emissiveIntensity: 0.25,
      envMapIntensity: 1.7,
    });

    this.btcFaceMaterial = new THREE.MeshStandardMaterial({
      map: this.btcFaceTexture,
      metalness: 0.72,
      roughness: 0.22,
      emissive: 0xf59e0b,
      emissiveMap: this.btcFaceTexture,
      emissiveIntensity: 0.35,
      envMapIntensity: 1.4,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
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
      transparent: true,
      opacity: 0.45,
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
    // PART 6: Central Bitcoin Sovereign Core (Inside Gimbal Rings)
    // ==========================================
    this.monolithCoreGroup = new THREE.Group();
    this.monolithCoreGroup.position.y = 1.9;

    // 6.1 Primary 24k Gold Coin Body (upright facing Z axis)
    const btcDiscGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.12, 64);
    const btcDiscMesh = new THREE.Mesh(btcDiscGeo, this.btcGoldMaterial);
    btcDiscMesh.rotation.x = Math.PI / 2;
    btcDiscMesh.castShadow = !this.isSoftwareGl;
    this.monolithCoreGroup.add(btcDiscMesh);

    // 6.2 Front & Back Engraved Bitcoin ₿ Medallion Faceplates
    const btcFaceGeo = new THREE.CircleGeometry(0.58, 64);
    const btcFrontFace = new THREE.Mesh(btcFaceGeo, this.btcFaceMaterial);
    btcFrontFace.position.z = 0.062;
    const btcBackFace = new THREE.Mesh(btcFaceGeo, this.btcFaceMaterial);
    btcBackFace.rotation.y = Math.PI;
    btcBackFace.position.z = -0.062;
    this.monolithCoreGroup.add(btcFrontFace, btcBackFace);

    // 6.3 Milled Outer Coin Bezel & Front/Back Inner Rim Torus
    const btcOuterRimGeo = new THREE.TorusGeometry(0.62, 0.042, 20, 64);
    const btcOuterRim = new THREE.Mesh(btcOuterRimGeo, this.btcGoldMaterial);
    this.monolithCoreGroup.add(btcOuterRim);

    const btcInnerRimGeo = new THREE.TorusGeometry(0.51, 0.016, 12, 48);
    const btcInnerRimFront = new THREE.Mesh(btcInnerRimGeo, this.primaryMetalMaterial);
    btcInnerRimFront.position.z = 0.056;
    const btcInnerRimBack = new THREE.Mesh(btcInnerRimGeo, this.primaryMetalMaterial);
    btcInnerRimBack.position.z = -0.056;
    this.monolithCoreGroup.add(btcInnerRimFront, btcInnerRimBack);

    // 6.4 24 Knurled Perimeter Coin Teeth
    const btcToothGeo = new THREE.BoxGeometry(0.032, 0.075, 0.13);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const tooth = new THREE.Mesh(btcToothGeo, this.btcGoldMaterial);
      tooth.position.set(Math.cos(a) * 0.63, Math.sin(a) * 0.63, 0);
      tooth.rotation.z = a + Math.PI / 2;
      this.monolithCoreGroup.add(tooth);
    }

    // 6.5 Golden Sovereignty Halo Ring + Subtle Wireframe Energy Cage
    const btcHaloGeo = new THREE.TorusGeometry(0.79, 0.014, 12, 64);
    const btcHaloMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.72,
    });
    const btcHaloMesh = new THREE.Mesh(btcHaloGeo, btcHaloMat);
    this.monolithCoreGroup.add(btcHaloMesh);

    const wireGeo = new THREE.OctahedronGeometry(0.88, 0);
    const wireMesh = new THREE.Mesh(wireGeo, this.glowMaterial);
    this.monolithCoreGroup.add(wireMesh);

    // Warm Golden PointLight illuminating surrounding gimbal rings
    this.btcCoreLight = new THREE.PointLight(0xf59e0b, 2.2, 5.5);
    this.btcCoreLight.position.set(0, 0, 0.4);
    this.monolithCoreGroup.add(this.btcCoreLight);

    this.rootGroup.add(this.monolithCoreGroup);
    this.btcPartInfo = {
      name: 'Bitcoin (BTC) Sovereign Core',
      category: 'Pusat Gravitasi Likuiditas Kripto',
      description: 'Aset induk di tengah lingkaran gimbal; seluruh rotasi modal Altcoin bergerak mengorbit dominansi Bitcoin.',
      metric: 'BTC Dominance Anchor • Supply Cap 21M',
    };
    this.registerInteractive(this.monolithCoreGroup, this.btcPartInfo);

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
    // PART 8: Orbiting 3D Altcoins + Circular Orbital Tracks
    // ==========================================
    this.orbitTracksGroup = new THREE.Group();
    this.orbitTracksGroup.position.y = 1.9;

    const trackRadii = [2.38, 2.65, 2.90];
    trackRadii.forEach((r, idx) => {
      const trackGeo = new THREE.TorusGeometry(r, 0.008, 10, 96);
      const trackMat = new THREE.MeshBasicMaterial({
        color: FINISH_THEMES[this.currentTheme].accentGlowColor,
        transparent: true,
        opacity: idx === 0 ? 0.42 : 0.25,
      });
      const trackMesh = new THREE.Mesh(trackGeo, trackMat);
      trackMesh.rotation.x = Math.PI / 2 + (idx - 1) * 0.11;
      trackMesh.rotation.y = (idx - 1) * 0.08;
      this.orbitTracksGroup.add(trackMesh);
    });
    this.rootGroup.add(this.orbitTracksGroup);

    // Build 10 Distinct 3D Altcoin Medallions orbiting the circle around Bitcoin
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const altBodyGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 32);
    const altRimGeo = new THREE.TorusGeometry(0.255, 0.022, 12, 32);
    const altFaceGeo = new THREE.CircleGeometry(0.235, 32);

    this.altcoinOrbiters = ORBITING_ALTCOINS.map((cfg, i) => {
      const group = new THREE.Group();
      const baseAngle = (i / ORBITING_ALTCOINS.length) * Math.PI * 2;
      const initial5m = cfg.default5m;
      const statusHex = initial5m > 0 ? 0x10b981 : initial5m < 0 ? 0xef4444 : new THREE.Color(cfg.color).getHex();

      const altTex = createAltcoinFaceTexture(cfg.symbol, cfg.name, cfg.color, initial5m);
      altTex.anisotropy = maxAnisotropy;
      this.altcoinTextures.push(altTex);

      const coinBodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.22,
        envMapIntensity: 1.5,
      });

      const coinRimMat = new THREE.MeshStandardMaterial({
        color: statusHex,
        metalness: 0.85,
        roughness: 0.18,
        emissive: statusHex,
        emissiveIntensity: 0.65,
        envMapIntensity: 1.6,
      });

      const coinFaceMat = new THREE.MeshStandardMaterial({
        map: altTex,
        metalness: 0.35,
        roughness: 0.28,
        emissive: 0xffffff,
        emissiveMap: altTex,
        emissiveIntensity: 0.42,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });

      const bodyMesh = new THREE.Mesh(altBodyGeo, coinBodyMat);
      bodyMesh.rotation.x = Math.PI / 2;
      bodyMesh.castShadow = !this.isSoftwareGl;

      const rimMesh = new THREE.Mesh(altRimGeo, coinRimMat);

      const frontFace = new THREE.Mesh(altFaceGeo, coinFaceMat);
      frontFace.position.z = 0.03;

      const backFace = new THREE.Mesh(altFaceGeo, coinFaceMat);
      backFace.rotation.y = Math.PI;
      backFace.position.z = -0.03;

      // Floating camera-facing 5-minute +/- badge sprite directly above coin
      const badgeTex = createAltcoinBadgeSpriteTexture(cfg.symbol, initial5m, cfg.color);
      badgeTex.anisotropy = maxAnisotropy;
      const badgeMat = new THREE.SpriteMaterial({
        map: badgeTex,
        transparent: true,
        depthWrite: false,
      });
      const badgeSprite = new THREE.Sprite(badgeMat);
      badgeSprite.position.set(0, 0.42, 0);
      badgeSprite.scale.set(1.04, 0.29, 1);

      group.add(bodyMesh, rimMesh, frontFace, backFace, badgeSprite);
      group.position.set(
        Math.cos(baseAngle) * cfg.radius,
        1.9 + cfg.yOffset,
        Math.sin(baseAngle) * cfg.radius
      );

      this.rootGroup.add(group);
      const signStr = initial5m > 0 ? `+${initial5m.toFixed(2)}%` : `${initial5m.toFixed(2)}%`;
      const partInfo: PartInfo = {
        name: `${cfg.symbol} (${cfg.name})`,
        category: 'Orbiting Altcoin • 5M Momentum',
        description: `Mengorbit pusat Bitcoin pada radius ${cfg.radius.toFixed(2)} AU; indikator 5 menit terakhir ${initial5m >= 0 ? 'PLUS (Bullish)' : 'MINUS (Bearish)'}.`,
        metric: `5M: ${signStr} • Orbit Speed ${(cfg.speed * 100).toFixed(0)}`,
      };
      this.registerInteractive(group, partInfo);

      return {
        group,
        symbol: cfg.symbol,
        name: cfg.name,
        color: cfg.color,
        radius: cfg.radius,
        baseAngle,
        speed: cfg.speed,
        yOffset: cfg.yOffset,
        tiltX: cfg.tiltX,
        tiltZ: cfg.tiltZ,
        change5m: initial5m,
        price: 0,
        faceMat: coinFaceMat,
        faceTex: altTex,
        rimMat: coinRimMat,
        badgeSprite,
        badgeMat,
        badgeTex,
        partInfo,
      };
    });

    // Subtle micro-liquidity stardust orbiting the perimeter
    const satelliteGeo = new THREE.SphereGeometry(0.032, 10, 10);
    const satelliteMat = new THREE.MeshStandardMaterial({
      color: FINISH_THEMES[this.currentTheme].accentGlowColor,
      metalness: 0.9,
      roughness: 0.15,
      emissive: FINISH_THEMES[this.currentTheme].accentGlowColor,
      emissiveIntensity: 0.4,
      envMapIntensity: 1.5,
    });
    this.satellitesMesh = new THREE.InstancedMesh(satelliteGeo, satelliteMat, this.satelliteCount);
    this.satellitesMesh.frustumCulled = false;

    for (let i = 0; i < this.satelliteCount; i++) {
      const angle = (i / this.satelliteCount) * Math.PI * 2;
      const radius = 2.2 + (i % 3) * 0.35;
      const y = 1.9 + ((i % 5) - 2) * 0.14;
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

    // Update dial & Bitcoin core accent canvas
    const accentHex = '#' + theme.accentGlowColor.toString(16).padStart(6, '0');
    this.dialTexture.dispose();
    this.dialTexture = createVernierDialTexture(accentHex);
    this.dialTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.dialMaterial.map = this.dialTexture;
    this.dialMaterial.needsUpdate = true;

    this.btcFaceTexture.dispose();
    this.btcFaceTexture = createBitcoinCoreTexture(accentHex);
    this.btcFaceTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.btcFaceMaterial.map = this.btcFaceTexture;
    this.btcFaceMaterial.emissiveMap = this.btcFaceTexture;
    this.btcFaceMaterial.needsUpdate = true;
  }

  /**
   * Updates real-time 5-minute +/- indicators on each orbiting Altcoin & central Bitcoin
   */
  public updateAltcoins5m(metrics: Record<string, Altcoin5mMetric>) {
    if (this.isDisposed || !metrics) return;
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    if (metrics.BTC && this.btcPartInfo) {
      const btc5m = metrics.BTC.change5m;
      const btcSign = btc5m > 0 ? `+${btc5m.toFixed(2)}%` : `${btc5m.toFixed(2)}%`;
      const btcPriceStr = metrics.BTC.price ? `$${metrics.BTC.price.toLocaleString()} • ` : '';
      this.btcPartInfo.metric = `${btcPriceStr}5M: ${btcSign} • Supply Cap 21M`;
    }

    for (const orb of this.altcoinOrbiters) {
      const incoming = metrics[orb.symbol];
      if (!incoming) continue;

      const nextVal = parseFloat(incoming.change5m.toFixed(2));
      const nextPrice = incoming.price || orb.price;
      const valChanged = Math.abs(nextVal - orb.change5m) >= 0.005;

      orb.price = nextPrice;

      if (valChanged) {
        orb.change5m = nextVal;

        // 1. Update coin face texture
        const nextFaceTex = createAltcoinFaceTexture(orb.symbol, orb.name, orb.color, nextVal);
        nextFaceTex.anisotropy = maxAnisotropy;
        orb.faceTex.dispose();
        orb.faceTex = nextFaceTex;
        orb.faceMat.map = nextFaceTex;
        orb.faceMat.emissiveMap = nextFaceTex;
        orb.faceMat.needsUpdate = true;

        // 2. Update floating sprite badge texture
        const nextBadgeTex = createAltcoinBadgeSpriteTexture(orb.symbol, nextVal, orb.color);
        nextBadgeTex.anisotropy = maxAnisotropy;
        orb.badgeTex.dispose();
        orb.badgeTex = nextBadgeTex;
        orb.badgeMat.map = nextBadgeTex;
        orb.badgeMat.needsUpdate = true;

        // 3. Update coin metallic rim hue (emerald for +, crimson for -, brand for 0)
        const rimHex = nextVal > 0 ? 0x10b981 : nextVal < 0 ? 0xef4444 : new THREE.Color(orb.color).getHex();
        orb.rimMat.color.setHex(rimHex);
        orb.rimMat.emissive.setHex(rimHex);
      }

      const signStr = nextVal > 0 ? `+${nextVal.toFixed(2)}%` : `${nextVal.toFixed(2)}%`;
      const priceLabel = nextPrice > 0 ? `$${nextPrice < 1 ? nextPrice.toFixed(4) : nextPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} • ` : '';
      orb.partInfo.metric = `${priceLabel}5M: ${signStr}`;
    }
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
      const found = this.interactiveMeshes.find(
        (item) => item.mesh === hit || Boolean(item.mesh.getObjectById(hit.id))
      );
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
      const found = this.interactiveMeshes.find(
        (item) => item.mesh === hit || Boolean(item.mesh.getObjectById(hit.id))
      );
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
      const speed = this.autoRotate ? this.rotationSpeed : 0.15;
      if (this.autoRotate) {
        // Outer Gimbal rotates steadily
        this.outerGimbalGroup.rotation.y += 0.35 * speed * dt;
        // Escapement Gear counter-rotates with rhythmic micro-stepping
        this.gearEscapementGroup.rotation.z -= 0.65 * speed * dt;
        // Inner Gimbal wobbles on X and tilts
        this.innerGimbalGroup.rotation.x = Math.sin(elapsed * 0.8 * speed) * 0.45;
        this.innerGimbalGroup.rotation.z += 0.5 * speed * dt;
        // Central Bitcoin Sovereign Core levitates & spins gently
        this.monolithCoreGroup.rotation.y += 0.65 * speed * dt;
        this.monolithCoreGroup.rotation.x = Math.cos(elapsed * 1.1 * speed) * 0.12;
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

      // Bitcoin Core elevates to apex
      this.monolithCoreGroup.position.y = 1.9 + 3.4 * ex;

      // Orbit tracks scale cleanly with explosion
      this.orbitTracksGroup.position.y = 1.9 + 0.8 * ex;
      const trackScale = 1.0 + 0.35 * ex;
      this.orbitTracksGroup.scale.set(trackScale, trackScale, trackScale);

      // Laser needle separates
      this.laserNeedleGroup.position.y = 0.35 + 0.3 * ex;

      // 4.1 Orbiting 3D Altcoins circling around the rings & central Bitcoin
      const baseRadiusMul = 1.0 + 0.45 * ex;
      const orbitTime = elapsed * (this.autoRotate ? this.rotationSpeed : 0.2);
      for (let i = 0; i < this.altcoinOrbiters.length; i++) {
        const orb = this.altcoinOrbiters[i];
        const angle = orb.baseAngle + orbitTime * orb.speed;
        const r = orb.radius * baseRadiusMul;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const orbitalInclinationY = Math.sin(angle) * (orb.tiltX * r) + Math.cos(angle) * (orb.tiltZ * r);
        const y = 1.9 + 0.8 * ex + orb.yOffset + orbitalInclinationY + Math.sin(elapsed * 1.8 + i) * 0.06;

        orb.group.position.set(x, y, z);
        // Keep altcoins spinning gracefully so front & back logos are always readable
        orb.group.rotation.y = -angle + Math.PI / 2 + elapsed * 0.4;
        orb.group.rotation.x = Math.sin(elapsed * 1.4 + i) * 0.08;
      }

      // Instanced micro-liquidity stardust orbiting perimeter
      for (let i = 0; i < this.satelliteCount; i++) {
        const baseAngle = (i / this.satelliteCount) * Math.PI * 2;
        const currentAngle = baseAngle + orbitTime * (0.3 + (i % 3) * 0.1);
        const radius = (2.2 + (i % 3) * 0.35) * baseRadiusMul;
        const y = (1.9 + ((i % 5) - 2) * 0.14) + 0.8 * ex + Math.sin(elapsed * 2 + i) * 0.08;
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

    this.dialTexture?.dispose();
    this.contactTexture?.dispose();
    this.roughnessTexture?.dispose();
    this.btcFaceTexture?.dispose();
    this.altcoinOrbiters.forEach((orb) => {
      orb.faceTex?.dispose();
      orb.badgeTex?.dispose();
      orb.badgeMat?.dispose();
    });
    this.altcoinTextures = [];

    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}

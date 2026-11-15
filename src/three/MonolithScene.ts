import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FinishId, CameraPreset } from '../types/contrarian';
import {
  FINISH_THEMES,
  createTradingChartGridTexture,
  createContactShadowTexture,
  createBrushedMetalRoughnessTexture,
  createBitcoinCoreTexture,
  createAltcoinFaceTexture,
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
  change5m: number;
  price: number;
  faceMat: THREE.MeshStandardMaterial;
  faceTex: THREE.CanvasTexture;
  partInfo: PartInfo;
}

const ORBITING_ALTCOINS = [
  { symbol: 'ETH', name: 'Ethereum', color: '#818cf8', radius: 2.38, speed: 0.55, default5m: 0.42 },
  { symbol: 'SOL', name: 'Solana', color: '#2dd4bf', radius: 2.38, speed: 0.55, default5m: 0.85 },
  { symbol: 'BNB', name: 'BNB Chain', color: '#e7cc82', radius: 2.38, speed: 0.55, default5m: -0.24 },
  { symbol: 'XRP', name: 'Ripple', color: '#38bdf8', radius: 2.38, speed: 0.55, default5m: -0.51 },
  { symbol: 'LINK', name: 'Chainlink', color: '#60a5fa', radius: 2.38, speed: 0.55, default5m: 0.31 },
  { symbol: 'TAO', name: 'Bittensor', color: '#c084fc', radius: 2.38, speed: 0.55, default5m: 0.94 },
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

  // Sculptural Architecture
  private rootGroup!: THREE.Group;
  private chartStageMesh!: THREE.Mesh;
  private contactShadowMesh!: THREE.Mesh;
  private equilibriumRingGroup!: THREE.Group;
  private monolithCoreGroup!: THREE.Group;
  private orbitTracksGroup!: THREE.Group;
  private signalBeamsGroup!: THREE.Group;
  private signalBeamLines: { line: THREE.Line; altIndex: number }[] = [];
  private altcoinOrbiters: AltcoinOrbiter[] = [];

  // Materials
  private primaryMetalMaterial!: THREE.MeshStandardMaterial;
  private secondaryMetalMaterial!: THREE.MeshStandardMaterial;
  private btcGoldMaterial!: THREE.MeshStandardMaterial;
  private btcFaceMaterial!: THREE.MeshStandardMaterial;
  private chartStageMaterial!: THREE.MeshBasicMaterial;
  private trackMaterial!: THREE.MeshBasicMaterial;

  // Textures
  private chartGridTexture!: THREE.CanvasTexture;
  private contactTexture!: THREE.CanvasTexture;
  private roughnessTexture!: THREE.CanvasTexture;
  private btcFaceTexture!: THREE.CanvasTexture;
  private altcoinTextures: THREE.CanvasTexture[] = [];

  // Kinematics State
  public explodedValue = 0;
  private currentExploded = 0;
  public autoRotate = true;
  public rotationSpeed = 1.0;
  public currentTheme: FinishId = 'obsidian-gold';

  // Camera Target Interpolation
  private targetCameraPos = new THREE.Vector3(4.9, 3.1, 5.1);
  private targetLookAt = new THREE.Vector3(0, 1.45, 0);
  private currentLookAt = new THREE.Vector3(0, 1.45, 0);

  // Raycasting
  private _raycaster = new THREE.Raycaster();
  private _pointer = new THREE.Vector2(-999, -999);

  // Callbacks
  public onPartHover?: (part: PartInfo | null) => void;
  public onPartSelect?: (part: PartInfo) => void;

  private interactiveMeshes: { mesh: THREE.Object3D; info: PartInfo }[] = [];
  private btcPartInfo!: PartInfo;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const initialTheme = FINISH_THEMES[this.currentTheme];
    this.scene.background = new THREE.Color(initialTheme.bgHorizonColor);
    this.scene.fog = new THREE.FogExp2(initialTheme.bgHorizonColor, 0.036);

    this.camera = new THREE.PerspectiveCamera(
      44,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      100
    );
    this.camera.position.copy(this.targetCameraPos);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
    this.controls.minDistance = 2.8;
    this.controls.maxDistance = 14.0;
    this.controls.target.copy(this.targetLookAt);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    this.setupLighting();
    this.setupTextures();
    this.assembleTradingSculpture();

    window.addEventListener('resize', this.onResize);
    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('click', this.onClick);

    this.animate();
  }

  private setupLighting() {
    const theme = FINISH_THEMES[this.currentTheme];

    this.keyLight = new THREE.DirectionalLight(theme.keyLightColor, 2.2);
    this.keyLight.position.set(5, 8, 5);
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
      this.keyLight.shadow.camera.far = 22;
    }
    this.scene.add(this.keyLight);

    this.hemiLight = new THREE.HemisphereLight(0x94a3b8, theme.ambientLightColor, 1.1);
    this.scene.add(this.hemiLight);

    this.rimLight = new THREE.DirectionalLight(0xe7cc82, 1.25);
    this.rimLight.position.set(-5, 4, -5);
    this.scene.add(this.rimLight);
  }

  private setupTextures() {
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const theme = FINISH_THEMES[this.currentTheme];
    const accentHex = '#' + theme.accentGlowColor.toString(16).padStart(6, '0');

    this.chartGridTexture = createTradingChartGridTexture(accentHex);
    this.chartGridTexture.anisotropy = maxAnisotropy;

    this.contactTexture = createContactShadowTexture();
    this.roughnessTexture = createBrushedMetalRoughnessTexture();
    this.btcFaceTexture = createBitcoinCoreTexture(accentHex);
    this.btcFaceTexture.anisotropy = maxAnisotropy;

    this.primaryMetalMaterial = new THREE.MeshStandardMaterial({
      color: theme.primaryMetalColor,
      metalness: theme.metalnessPrimary,
      roughness: 0.22,
      roughnessMap: this.roughnessTexture,
      envMapIntensity: 1.25,
    });

    this.secondaryMetalMaterial = new THREE.MeshStandardMaterial({
      color: theme.secondaryMetalColor,
      metalness: 0.65,
      roughness: 0.2,
      envMapIntensity: 1.2,
    });

    this.btcGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xe7cc82,
      metalness: 0.94,
      roughness: 0.16,
      emissive: 0x5a4212,
      emissiveIntensity: 0.28,
      envMapIntensity: 1.7,
    });

    this.btcFaceMaterial = new THREE.MeshStandardMaterial({
      map: this.btcFaceTexture,
      metalness: 0.72,
      roughness: 0.2,
      emissive: 0xe7cc82,
      emissiveMap: this.btcFaceTexture,
      emissiveIntensity: 0.35,
      envMapIntensity: 1.5,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    this.chartStageMaterial = new THREE.MeshBasicMaterial({
      map: this.chartGridTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    this.trackMaterial = new THREE.MeshBasicMaterial({
      color: 0xe7cc82,
      transparent: true,
      opacity: 0.28,
    });
  }

  private assembleTradingSculpture() {
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // 1. Edge-Faded Rectangular Trading Chart Grid Plane
    const shadowGeo = new THREE.PlaneGeometry(6.8, 5.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.contactTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    this.contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadowMesh.rotation.x = -Math.PI / 2;
    this.contactShadowMesh.position.y = 0.002;
    this.rootGroup.add(this.contactShadowMesh);

    const chartStageGeo = new THREE.PlaneGeometry(6.6, 5.2);
    this.chartStageMesh = new THREE.Mesh(chartStageGeo, this.chartStageMaterial);
    this.chartStageMesh.rotation.x = -Math.PI / 2;
    this.chartStageMesh.position.y = 0.024;
    this.rootGroup.add(this.chartStageMesh);

    // 2. Sleek Equilibrium Ring Framing the Central Bitcoin Core
    this.equilibriumRingGroup = new THREE.Group();
    this.equilibriumRingGroup.position.y = 2.15;

    const eqRingGeo = new THREE.TorusGeometry(1.06, 0.018, 16, 72);
    const eqRingMesh = new THREE.Mesh(eqRingGeo, this.primaryMetalMaterial);
    this.equilibriumRingGroup.add(eqRingMesh);
    this.rootGroup.add(this.equilibriumRingGroup);

    // 3. Elevated Bitcoin (₿) Sovereign Core with iconic medallion face
    this.monolithCoreGroup = new THREE.Group();
    this.monolithCoreGroup.position.y = 2.15;

    const btcDiscGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.11, 64);
    const btcDiscMesh = new THREE.Mesh(btcDiscGeo, this.btcGoldMaterial);
    btcDiscMesh.rotation.x = Math.PI / 2;
    btcDiscMesh.castShadow = !this.isSoftwareGl;
    this.monolithCoreGroup.add(btcDiscMesh);

    const btcFaceGeo = new THREE.CircleGeometry(0.55, 64);
    const btcFrontFace = new THREE.Mesh(btcFaceGeo, this.btcFaceMaterial);
    btcFrontFace.position.z = 0.058;
    const btcBackFace = new THREE.Mesh(btcFaceGeo, this.btcFaceMaterial);
    btcBackFace.rotation.y = Math.PI;
    btcBackFace.position.z = -0.058;
    this.monolithCoreGroup.add(btcFrontFace, btcBackFace);

    const btcOuterRimGeo = new THREE.TorusGeometry(0.58, 0.032, 20, 64);
    const btcOuterRim = new THREE.Mesh(btcOuterRimGeo, this.btcGoldMaterial);
    this.monolithCoreGroup.add(btcOuterRim);

    this.btcCoreLight = new THREE.PointLight(0xe7cc82, 1.8, 5.0);
    this.btcCoreLight.position.set(0, 0, 0.35);
    this.monolithCoreGroup.add(this.btcCoreLight);

    this.rootGroup.add(this.monolithCoreGroup);
    this.btcPartInfo = {
      name: 'Bitcoin (₿) Sovereign Core',
      category: 'Pusat Gravitasi Pasar Kripto',
      description: 'Inti koin Bitcoin ₿ di puncak struktur; menyalurkan sinyal likuiditas on-chain secara real-time ke seluruh aset altcoin.',
      metric: 'BTC Dominance Anchor • Real-Time Signal Transmitter',
    };
    this.registerInteractive(this.monolithCoreGroup, this.btcPartInfo);

    // 4. Fine Orbital Track + 6 Flagship Crypto Medallions
    this.orbitTracksGroup = new THREE.Group();
    this.orbitTracksGroup.position.y = 2.08;

    const trackGeo = new THREE.TorusGeometry(2.38, 0.008, 10, 96);
    const trackMesh = new THREE.Mesh(trackGeo, this.trackMaterial);
    trackMesh.rotation.x = Math.PI / 2;
    this.orbitTracksGroup.add(trackMesh);
    this.rootGroup.add(this.orbitTracksGroup);

    // 5. Signal Beams Group (Connecting Bitcoin Center to Orbiting Altcoins)
    this.signalBeamsGroup = new THREE.Group();
    this.signalBeamsGroup.position.y = 2.12;
    this.rootGroup.add(this.signalBeamsGroup);

    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const altBodyGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 40);
    const altRimGeo = new THREE.TorusGeometry(0.224, 0.015, 12, 40);
    const altFaceGeo = new THREE.CircleGeometry(0.208, 40);

    const coinRimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.22,
      envMapIntensity: 1.4,
    });

    this.altcoinOrbiters = ORBITING_ALTCOINS.map((cfg, i) => {
      const group = new THREE.Group();
      const baseAngle = (i / ORBITING_ALTCOINS.length) * Math.PI * 2;
      const initial5m = cfg.default5m;

      const altTex = createAltcoinFaceTexture(cfg.symbol, cfg.name, cfg.color, initial5m);
      altTex.anisotropy = maxAnisotropy;
      this.altcoinTextures.push(altTex);

      const coinBodyMat = new THREE.MeshStandardMaterial({
        color: 0x0f1522,
        metalness: 0.85,
        roughness: 0.24,
        envMapIntensity: 1.35,
      });

      const coinFaceMat = new THREE.MeshStandardMaterial({
        map: altTex,
        metalness: 0.3,
        roughness: 0.3,
        emissive: 0xffffff,
        emissiveMap: altTex,
        emissiveIntensity: 0.18,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });

      const bodyMesh = new THREE.Mesh(altBodyGeo, coinBodyMat);
      bodyMesh.rotation.x = Math.PI / 2;
      bodyMesh.castShadow = !this.isSoftwareGl;

      const rimMesh = new THREE.Mesh(altRimGeo, coinRimMat);

      const frontFace = new THREE.Mesh(altFaceGeo, coinFaceMat);
      frontFace.position.z = 0.027;

      const backFace = new THREE.Mesh(altFaceGeo, coinFaceMat);
      backFace.rotation.y = Math.PI;
      backFace.position.z = -0.027;

      group.add(bodyMesh, rimMesh, frontFace, backFace);
      group.position.set(
        Math.cos(baseAngle) * cfg.radius,
        2.08,
        Math.sin(baseAngle) * cfg.radius
      );

      this.rootGroup.add(group);

      // Create signal beam line connecting center (0,0,0) to altcoin
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(baseAngle) * cfg.radius, -0.04, Math.sin(baseAngle) * cfg.radius),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.45,
      });
      const signalLine = new THREE.Line(lineGeo, lineMat);
      this.signalBeamsGroup.add(signalLine);
      this.signalBeamLines.push({ line: signalLine, altIndex: i });

      const signStr = initial5m > 0 ? `+${initial5m.toFixed(2)}%` : `${initial5m.toFixed(2)}%`;
      const partInfo: PartInfo = {
        name: `${cfg.symbol} · ${cfg.name}`,
        category: 'Orbiting Crypto Asset',
        description: `Menerima sinyal likuiditas real-time dari Bitcoin; perubahan 5 menit sebesar ${signStr}.`,
        metric: `5M: ${signStr}`,
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
        change5m: initial5m,
        price: 0,
        faceMat: coinFaceMat,
        faceTex: altTex,
        partInfo,
      };
    });
  }

  private registerInteractive(mesh: THREE.Object3D, info: PartInfo) {
    this.interactiveMeshes.push({ mesh, info });
  }

  public setTheme(themeId: FinishId) {
    this.currentTheme = themeId;
    const theme = FINISH_THEMES[themeId];

    this.scene.background = new THREE.Color(theme.bgHorizonColor);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.setHex(theme.bgHorizonColor);
    }

    this.primaryMetalMaterial.color.setHex(theme.primaryMetalColor);
    this.primaryMetalMaterial.metalness = theme.metalnessPrimary;
    this.primaryMetalMaterial.roughness = 0.22;

    this.secondaryMetalMaterial.color.setHex(theme.secondaryMetalColor);
    this.secondaryMetalMaterial.metalness = 0.65;
    this.secondaryMetalMaterial.roughness = 0.2;

    this.trackMaterial.color.setHex(theme.accentGlowColor);

    this.keyLight.color.setHex(theme.keyLightColor);
    this.hemiLight.groundColor.setHex(theme.ambientLightColor);
    this.rimLight.color.setHex(theme.accentGlowColor);

    const accentHex = '#' + theme.accentGlowColor.toString(16).padStart(6, '0');
    this.chartGridTexture.dispose();
    this.chartGridTexture = createTradingChartGridTexture(accentHex);
    this.chartGridTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.chartStageMaterial.map = this.chartGridTexture;
    this.chartStageMaterial.needsUpdate = true;

    this.btcFaceTexture.dispose();
    this.btcFaceTexture = createBitcoinCoreTexture(accentHex);
    this.btcFaceTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.btcFaceMaterial.map = this.btcFaceTexture;
    this.btcFaceMaterial.emissiveMap = this.btcFaceTexture;
    this.btcFaceMaterial.needsUpdate = true;
  }

  public updateAltcoins5m(metrics: Record<string, Altcoin5mMetric>) {
    if (this.isDisposed || !metrics) return;
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    if (metrics.BTC && this.btcPartInfo) {
      const btc5m = metrics.BTC.change5m;
      const btcSign = btc5m > 0 ? `+${btc5m.toFixed(2)}%` : `${btc5m.toFixed(2)}%`;
      const btcPriceStr = metrics.BTC.price ? `$${metrics.BTC.price.toLocaleString()} · ` : '';
      this.btcPartInfo.metric = `${btcPriceStr}5M: ${btcSign}`;
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
        const nextFaceTex = createAltcoinFaceTexture(orb.symbol, orb.name, orb.color, nextVal);
        nextFaceTex.anisotropy = maxAnisotropy;
        orb.faceTex.dispose();
        orb.faceTex = nextFaceTex;
        orb.faceMat.map = nextFaceTex;
        orb.faceMat.emissiveMap = nextFaceTex;
        orb.faceMat.needsUpdate = true;
      }

      const signStr = nextVal > 0 ? `+${nextVal.toFixed(2)}%` : `${nextVal.toFixed(2)}%`;
      const priceLabel =
        nextPrice > 0
          ? `$${nextPrice < 1 ? nextPrice.toFixed(4) : nextPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} · `
          : '';
      orb.partInfo.metric = `${priceLabel}5M: ${signStr}`;
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    switch (preset) {
      case 'macro':
        this.targetCameraPos.set(4.9, 3.1, 5.1);
        this.targetLookAt.set(0, 1.45, 0);
        break;
      case 'core':
        this.targetCameraPos.set(2.2, 2.3, 2.2);
        this.targetLookAt.set(0, 2.15, 0);
        break;
      case 'escapement':
        this.targetCameraPos.set(0, 1.6, 4.4);
        this.targetLookAt.set(0, 1.25, 0);
        break;
      case 'radar':
        this.targetCameraPos.set(3.2, 3.8, 3.2);
        this.targetLookAt.set(0, 0.9, 0);
        break;
      case 'topdown':
        this.targetCameraPos.set(0.01, 7.2, 0.01);
        this.targetLookAt.set(0, 1.3, 0);
        break;
    }
  }

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

  private animate = () => {
    if (this.isDisposed) return;

    const tick = () => {
      if (this.isDisposed) return;
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      this.currentExploded = THREE.MathUtils.damp(this.currentExploded, this.explodedValue, 6, dt);

      this.camera.position.lerp(this.targetCameraPos, 1 - Math.exp(-4 * dt));
      this.currentLookAt.lerp(this.targetLookAt, 1 - Math.exp(-4 * dt));
      this.controls.target.copy(this.currentLookAt);
      this.controls.update();

      const speed = this.autoRotate ? this.rotationSpeed : 0.12;
      if (this.autoRotate) {
        this.equilibriumRingGroup.rotation.y += 0.22 * speed * dt;
        this.equilibriumRingGroup.rotation.x = Math.sin(elapsed * 0.45 * speed) * 0.2;
        this.monolithCoreGroup.rotation.y += 0.4 * speed * dt;
        this.monolithCoreGroup.rotation.x = Math.sin(elapsed * 0.75 * speed) * 0.06;
      }

      const ex = this.currentExploded;
      this.chartStageMesh.position.y = 0.024 - 0.35 * ex;
      this.equilibriumRingGroup.position.y = 2.15 + 1.15 * ex;
      this.monolithCoreGroup.position.y = 2.15 + 1.75 * ex;
      this.orbitTracksGroup.position.y = 2.08 + 0.9 * ex;
      this.signalBeamsGroup.position.y = 2.15 + 1.75 * ex;

      const trackScale = 1.0 + 0.25 * ex;
      this.orbitTracksGroup.scale.set(trackScale, trackScale, trackScale);

      const baseRadiusMul = 1.0 + 0.32 * ex;
      const orbitTime = elapsed * (this.autoRotate ? this.rotationSpeed : 0.22);
      for (let i = 0; i < this.altcoinOrbiters.length; i++) {
        const orb = this.altcoinOrbiters[i];
        const angle = orb.baseAngle + orbitTime * orb.speed;
        const r = orb.radius * baseRadiusMul;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = 2.08 + 0.9 * ex + Math.sin(elapsed * 1.1 + i) * 0.05;

        orb.group.position.set(x, y, z);
        orb.group.rotation.y = -angle + Math.PI / 2 + elapsed * 0.35;

        // Update signal beam line geometry to connect Bitcoin center to orbiting altcoin
        const beamData = this.signalBeamLines.find((b) => b.altIndex === i);
        if (beamData) {
          const positions = beamData.line.geometry.attributes.position as THREE.BufferAttribute;
          if (positions) {
            positions.setXYZ(1, x, -0.07, z);
            positions.needsUpdate = true;
          }
          // Pulsing opacity animation for signal transmission effect
          const lineMat = beamData.line.material as THREE.LineBasicMaterial;
          lineMat.opacity = 0.22 + Math.sin(elapsed * 5.0 + i * 1.1) * 0.22;
        }
      }

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  };

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

    this.chartGridTexture?.dispose();
    this.contactTexture?.dispose();
    this.roughnessTexture?.dispose();
    this.btcFaceTexture?.dispose();
    this.altcoinOrbiters.forEach((orb) => {
      orb.faceTex?.dispose();
    });
    this.altcoinTextures = [];

    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}

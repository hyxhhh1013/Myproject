import * as THREE from 'three';
import { PersonalMemoryKind } from '../data/islandMemories';
import { IslandDestructionManager } from './islandDestruction';

export type SkySeaToyKind = 'pier-fireworks' | 'beach-skip-stone' | 'ufo-antenna';

export interface SkySeaToyRegistration {
  kind: SkySeaToyKind;
  hitTarget: THREE.Object3D;
  worldPos: { x: number; y: number; z: number };
}

export interface SkySeaCallbacks {
  onToast?: (titleZh: string, titleEn: string, textZh: string, textEn: string, icon?: string) => void;
  isMuted?: () => boolean;
}

// ============================================================================
// Procedural Web Audio Sound Effects
// ============================================================================
let sharedSkyAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!sharedSkyAudioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedSkyAudioCtx = new AudioCtx();
    }
    if (sharedSkyAudioCtx.state === 'suspended') {
      sharedSkyAudioCtx.resume().catch(() => {});
    }
    return sharedSkyAudioCtx;
  } catch {
    return null;
  }
}

function playFireworkWhistleSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520 + Math.random() * 140, now);
    osc.frequency.exponentialRampToValueAtTime(1650 + Math.random() * 350, now + 0.65);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.72);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.75);
  } catch {
    // Ignore
  }
}

function playFireworkBurstSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    // Soft pop + airy crackle
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.28);
    g.gain.setValueAtTime(0.16, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);

    const dur = 0.65;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.8);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.value = 0.9;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.14, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter);
    filter.connect(ng);
    ng.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur + 0.02);
  } catch {
    // Ignore
  }
}

function playStoneSkipSound(bounceIdx: number, muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const base = 360 + bounceIdx * 95;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.9, now + 0.065);
    gain.gain.setValueAtTime(0.09 * Math.pow(0.84, bounceIdx), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // Ignore
  }
}

function playUfoWarbleSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const carrier = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(420, now);
    carrier.frequency.linearRampToValueAtTime(640, now + 0.6);
    carrier.frequency.linearRampToValueAtTime(340, now + 1.5);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(9.5, now);
    lfoGain.gain.setValueAtTime(42, now);
    lfo.connect(lfoGain);
    lfoGain.connect(carrier.frequency);

    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(0.075, now + 0.15);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.55);

    carrier.connect(mainGain);
    mainGain.connect(ctx.destination);
    carrier.start(now);
    lfo.start(now);
    carrier.stop(now + 1.6);
    lfo.stop(now + 1.6);
  } catch {
    // Ignore
  }
}

// ============================================================================
// 3D Prop Builders
// ============================================================================
function buildFireworksRack(pos: THREE.Vector3): {
  root: THREE.Group;
  hitTarget: THREE.Mesh;
} {
  const root = new THREE.Group();
  root.position.copy(pos);

  const woodMat = new THREE.MeshStandardMaterial({ color: '#784421', roughness: 0.8 });
  const rackBase = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.12, 0.42), woodMat);
  rackBase.position.y = 0.06;
  rackBase.castShadow = true;
  root.add(rackBase);

  const rackRail = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.08, 0.08), woodMat);
  rackRail.position.set(0, 0.42, 0.18);
  root.add(rackRail);
  const rackRailBack = rackRail.clone();
  rackRailBack.position.z = -0.18;
  root.add(rackRailBack);

  // Corner end-posts framing the wooden mortar crate
  [-0.56, 0.56].forEach((px) => {
    [-0.18, 0.18].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.08), woodMat);
      post.position.set(px, 0.24, pz);
      root.add(post);
    });
  });

  const tubeColors = ['#EF4444', '#F59E0B', '#38BDF8', '#A855F7', '#10B981'];
  tubeColors.forEach((col, i) => {
    const tx = (i - 2) * 0.22;
    const tubeMat = new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.42,
      emissive: col,
      emissiveIntensity: 0.15,
    });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.072, 0.68, 12), tubeMat);
    tube.position.set(tx, 0.42, 0);
    tube.rotation.z = (2 - i) * 0.08;
    tube.rotation.x = 0.12;
    tube.castShadow = true;
    root.add(tube);

    // Gold collar band + protruding paper fuse
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.074, 0.074, 0.08, 12),
      new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.7, roughness: 0.3 })
    );
    band.position.y = 0.2;
    tube.add(band);

    const fuse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6),
      new THREE.MeshStandardMaterial({ color: '#FEF3C7', roughness: 0.85 })
    );
    fuse.position.set(0.02, 0.4, 0);
    fuse.rotation.z = -0.35;
    tube.add(fuse);
  });

  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitTarget.position.set(0, 0.5, 0);
  root.add(hitTarget);

  return { root, hitTarget };
}

function buildPebbleStack(pos: THREE.Vector3): {
  root: THREE.Group;
  hitTarget: THREE.Mesh;
} {
  const root = new THREE.Group();
  root.position.copy(pos);

  const stoneColors = ['#94A3B8', '#CBD5E1', '#64748B', '#E2E8F0', '#78716C'];
  const layers: [number, number, number, number][] = [
    [0, 0.06, 0, 0.36],
    [0.02, 0.16, -0.02, 0.28],
    [-0.02, 0.25, 0.01, 0.21],
    [0.01, 0.33, 0, 0.14],
    [0.42, 0.05, 0.18, 0.22],
    [-0.38, 0.05, 0.22, 0.24],
  ];
  layers.forEach(([lx, ly, lz, r], idx) => {
    const mat = new THREE.MeshStandardMaterial({
      color: stoneColors[idx % stoneColors.length],
      roughness: 0.65,
      flatShading: true,
    });
    const stone = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
    stone.scale.set(1.15, 0.34, 1.0);
    stone.position.set(lx, ly, lz);
    stone.castShadow = true;
    stone.receiveShadow = true;
    root.add(stone);
  });

  // Driftwood log & two tiny pastel seashells beside the pebble cairn
  const driftLog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 1.05, 8),
    new THREE.MeshStandardMaterial({ color: '#9C8265', roughness: 0.92, flatShading: true })
  );
  driftLog.rotation.z = Math.PI / 2;
  driftLog.rotation.y = 0.38;
  driftLog.position.set(-0.42, 0.09, -0.36);
  driftLog.castShadow = true;
  root.add(driftLog);

  [
    [0.52, 0.04, -0.18, '#FDE68A'],
    [0.24, 0.04, 0.38, '#FBCFE8'],
  ].forEach(([sx, sy, sz, col]) => {
    const shell = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.06, 7),
      new THREE.MeshStandardMaterial({ color: col as string, roughness: 0.5 })
    );
    shell.position.set(sx as number, sy as number, sz as number);
    root.add(shell);
  });

  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitTarget.position.set(0, 0.35, 0);
  root.add(hitTarget);

  return { root, hitTarget };
}

function buildUfoAntenna(pos: THREE.Vector3): {
  root: THREE.Group;
  dishPivot: THREE.Group;
  tipMat: THREE.MeshStandardMaterial;
  hitTarget: THREE.Mesh;
} {
  const root = new THREE.Group();
  root.position.copy(pos);

  const metalMat = new THREE.MeshStandardMaterial({
    color: '#94A3B8',
    roughness: 0.32,
    metalness: 0.78,
  });
  const dishMat = new THREE.MeshStandardMaterial({
    color: '#E2E8F0',
    roughness: 0.38,
    metalness: 0.45,
    side: THREE.DoubleSide,
  });
  const tipMat = new THREE.MeshStandardMaterial({
    color: '#10B981',
    emissive: '#10B981',
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  // Tripod legs
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 1.25, 8), metalMat);
    leg.position.set(Math.cos(a) * 0.28, 0.56, Math.sin(a) * 0.28);
    leg.rotation.z = Math.cos(a) * 0.32;
    leg.rotation.x = -Math.sin(a) * 0.32;
    leg.castShadow = true;
    root.add(leg);
  }

  // Rotating parabolic dish assembly
  const dishPivot = new THREE.Group();
  dishPivot.position.set(0, 1.18, 0);

  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.56, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.42),
    dishMat
  );
  dish.rotation.x = Math.PI * 0.72;
  dish.castShadow = true;
  dishPivot.add(dish);

  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.56, 8), metalMat);
  needle.position.set(0, 0.22, 0.24);
  needle.rotation.x = 0.75;
  dishPivot.add(needle);

  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), tipMat);
  tip.position.set(0, 0.42, 0.46);
  dishPivot.add(tip);

  root.add(dishPivot);

  // Retro sci-fi radar control box with glowing green CRT screen at the tripod base
  const consoleBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.34, 0.32),
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5, metalness: 0.55 })
  );
  consoleBox.position.set(0.36, 0.18, 0.22);
  consoleBox.rotation.y = -0.35;
  consoleBox.castShadow = true;
  root.add(consoleBox);

  const crtScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.18),
    new THREE.MeshBasicMaterial({ color: '#34D399' })
  );
  crtScreen.position.set(0, 0.03, 0.165);
  consoleBox.add(crtScreen);

  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitTarget.position.set(0, 1.0, 0);
  root.add(hitTarget);

  return { root, dishPivot, tipMat, hitTarget };
}

function buildCartoonUfo(): {
  root: THREE.Group;
  body: THREE.Group;
  beam: THREE.Mesh;
  beamMat: THREE.MeshBasicMaterial;
  rimLights: THREE.Mesh[];
} {
  const root = new THREE.Group();
  root.visible = false;

  const body = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({
    color: '#CBD5E1',
    roughness: 0.22,
    metalness: 0.85,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.35,
    metalness: 0.75,
  });
  const domeMat = new THREE.MeshStandardMaterial({
    color: '#67E8F9',
    emissive: '#06B6D4',
    emissiveIntensity: 0.65,
    roughness: 0.12,
    transparent: true,
    opacity: 0.78,
  });

  // Main saucer disc
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 3.0, 0.75, 24), hullMat);
  body.add(saucer);
  const underbelly = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 1.3, 0.55, 24), accentMat);
  underbelly.position.y = -0.58;
  body.add(underbelly);

  // Glowing cockpit dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    domeMat
  );
  dome.position.y = 0.28;
  body.add(dome);

  // 8 rim lights
  const rimLights: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const lightBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? '#4ADE80' : '#FACC15' })
    );
    lightBulb.position.set(Math.cos(a) * 2.65, -0.18, Math.sin(a) * 2.65);
    body.add(lightBulb);
    rimLights.push(lightBulb);
  }
  root.add(body);

  // Translucent emerald tractor beam cone
  const beamMat = new THREE.MeshBasicMaterial({
    color: '#34D399',
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(4.4, 12.5, 24, 1, true), beamMat);
  beam.position.y = -6.8;
  beam.visible = false;
  root.add(beam);

  return { root, body, beam, beamMat, rimLights };
}

// ============================================================================
// Runtime Simulation Types
// ============================================================================
interface FireworkRocket {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  targetY: number;
  color: THREE.Color;
  mesh: THREE.Mesh;
}

interface FireworkSpark {
  active: boolean;
  age: number;
  maxAge: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  baseScale: number;
}

interface WaterRipple {
  active: boolean;
  age: number;
  maxAge: number;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
}

interface SkippingStone {
  active: boolean;
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  bounces: number;
}

const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

const UFO_ORDER: PersonalMemoryKind[] = [
  'redbrick-gate',
  'yzfls-campus',
  'hunau-campus',
  'company-studio',
];

export class IslandSkySeaToysManager {
  private scene: THREE.Scene;
  private destruction: IslandDestructionManager;
  private callbacks: SkySeaCallbacks;

  // World prop positions (y snapped to real terrain/deck in mountProps)
  private fireworksPos = new THREE.Vector3(-0.78, 0.49, 13.42);
  private pebblePos = new THREE.Vector3(5.8, 0.65, 7.6);
  private antennaPos = new THREE.Vector3(-5.4, 0.72, 6.2);

  private mountedRoots: THREE.Object3D[] = [];
  private antennaDish: THREE.Group | null = null;
  private antennaTipMat: THREE.MeshStandardMaterial | null = null;
  private antennaPulseTime = 99;

  // Fireworks runtime
  private fireworkQueue: { delay: number; color: string }[] = [];
  private rockets: FireworkRocket[] = [];
  private fwSparks: FireworkSpark[] = [];
  private fwSparkMesh: THREE.InstancedMesh;
  private readonly MAX_FW_SPARKS = 220;

  // Stone skipping runtime
  private skipStones: SkippingStone[] = [];
  private ripples: WaterRipple[] = [];

  // UFO runtime
  private ufo: ReturnType<typeof buildCartoonUfo>;
  private ufoPhase: 'idle' | 'approach' | 'beaming' | 'depart' = 'idle';
  private ufoPhaseTime = 0;
  private ufoTargetId: PersonalMemoryKind | null = null;
  private ufoStartPos = new THREE.Vector3();
  private ufoHoverPos = new THREE.Vector3();
  private ufoCycleIdx = 0;

  constructor(
    scene: THREE.Scene,
    destruction: IslandDestructionManager,
    callbacks: SkySeaCallbacks = {}
  ) {
    this.scene = scene;
    this.destruction = destruction;
    this.callbacks = callbacks;

    // Rocket shells pool (6)
    const rocketGeo = new THREE.SphereGeometry(0.16, 8, 8);
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: '#FEF08A' });
      const mesh = new THREE.Mesh(rocketGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.rockets.push({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        targetY: 16,
        color: new THREE.Color('#F43F5E'),
        mesh,
      });
    }

    // Fireworks sparks instanced pool
    const fwGeo = new THREE.OctahedronGeometry(0.15, 0);
    const fwMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
    this.fwSparkMesh = new THREE.InstancedMesh(fwGeo, fwMat, this.MAX_FW_SPARKS);
    this.fwSparkMesh.frustumCulled = false;
    this.fwSparkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    _m4.makeScale(0, 0, 0);
    for (let i = 0; i < this.MAX_FW_SPARKS; i++) {
      this.fwSparks.push({
        active: false,
        age: 0,
        maxAge: 1,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        baseScale: 1,
      });
      this.fwSparkMesh.setMatrixAt(i, _m4);
      this.fwSparkMesh.setColorAt(i, _c.set('#FDE047'));
    }
    this.fwSparkMesh.instanceMatrix.needsUpdate = true;
    if (this.fwSparkMesh.instanceColor) this.fwSparkMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.fwSparkMesh);

    // Skipping stones pool (3)
    const pebbleGeo = new THREE.SphereGeometry(0.16, 10, 8);
    pebbleGeo.scale(1.2, 0.35, 1.0);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.5 });
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(pebbleGeo, pebbleMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.skipStones.push({
        active: false,
        mesh,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        bounces: 0,
      });
    }

    // Water ripple rings pool (10)
    const rippleGeo = new THREE.RingGeometry(0.65, 0.92, 28);
    for (let i = 0; i < 10; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: '#E0F2FE',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(rippleGeo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      this.scene.add(mesh);
      this.ripples.push({ active: false, age: 0, maxAge: 0.9, mesh, mat });
    }

    // Cartoon UFO
    this.ufo = buildCartoonUfo();
    this.scene.add(this.ufo.root);
  }

  public mountProps(getGroundY?: (x: number, z: number) => number): SkySeaToyRegistration[] {
    if (getGroundY) {
      this.pebblePos.y = getGroundY(this.pebblePos.x, this.pebblePos.z);
      this.antennaPos.y = getGroundY(this.antennaPos.x, this.antennaPos.z);
    }

    const fw = buildFireworksRack(this.fireworksPos);
    this.scene.add(fw.root);

    const pebbles = buildPebbleStack(this.pebblePos);
    this.scene.add(pebbles.root);

    const ant = buildUfoAntenna(this.antennaPos);
    this.antennaDish = ant.dishPivot;
    this.antennaTipMat = ant.tipMat;
    this.scene.add(ant.root);

    this.mountedRoots.push(fw.root, pebbles.root, ant.root);

    return [
      {
        kind: 'pier-fireworks',
        hitTarget: fw.hitTarget,
        worldPos: { x: this.fireworksPos.x, y: this.fireworksPos.y + 0.5, z: this.fireworksPos.z },
      },
      {
        kind: 'beach-skip-stone',
        hitTarget: pebbles.hitTarget,
        worldPos: { x: this.pebblePos.x, y: this.pebblePos.y + 0.35, z: this.pebblePos.z },
      },
      {
        kind: 'ufo-antenna',
        hitTarget: ant.hitTarget,
        worldPos: { x: this.antennaPos.x, y: this.antennaPos.y + 1.0, z: this.antennaPos.z },
      },
    ];
  }

  public triggerToy(kind: SkySeaToyKind) {
    const muted = this.callbacks.isMuted?.() ?? false;

    if (kind === 'pier-fireworks') {
      const colors = ['#F43F5E', '#FACC15', '#38BDF8', '#C084FC', '#34D399'];
      for (let i = 0; i < 5; i++) {
        this.fireworkQueue.push({ delay: i * 0.34, color: colors[i % colors.length] });
      }
      this.callbacks.onToast?.(
        '漂流瓶码头 · 海面烟花',
        'Sunset Pier · Sea Fireworks',
        '五连发海面礼花已点火升空！（调到星野/蓝调时刻更出片）',
        '5-shot seaside fireworks launched! Looks best at blue hour or night!',
        '🎆'
      );
      return;
    }

    if (kind === 'beach-skip-stone') {
      const stone = this.skipStones.find((s) => !s.active) ?? this.skipStones[0];
      stone.active = true;
      stone.bounces = 0;
      stone.pos.set(this.pebblePos.x + 0.5, this.pebblePos.y + 0.55, this.pebblePos.z + 0.4);
      // Throw outward over open water (+x, +z)
      const spread = (Math.random() - 0.5) * 0.25;
      const angle = 0.72 + spread;
      const spd = 11.8 + Math.random() * 2.2;
      stone.vel.set(Math.cos(angle) * spd, 2.3, Math.sin(angle) * spd);
      stone.mesh.position.copy(stone.pos);
      stone.mesh.visible = true;
      playStoneSkipSound(0, muted);
      return;
    }

    if (kind === 'ufo-antenna') {
      if (this.ufoPhase !== 'idle') return;
      // Rotate preferred order so each click visits a different intact school/studio
      const order: PersonalMemoryKind[] = [];
      for (let i = 0; i < UFO_ORDER.length; i++) {
        order.push(UFO_ORDER[(this.ufoCycleIdx + i) % UFO_ORDER.length]);
      }
      const picked = this.destruction.getFirstIntactTarget(order);
      if (!picked) {
        this.callbacks.onToast?.(
          '神秘雷达 · 暂无目标',
          'Mystery Radar · No Intact Target',
          '所有建筑都还在废墟或悬浮中，先用金色沙漏复原一座再召唤飞碟吧！',
          'All landmarks are currently in ruins — rewind one first!',
          '🛸'
        );
        return;
      }
      this.ufoCycleIdx = (this.ufoCycleIdx + 1) % UFO_ORDER.length;
      this.antennaPulseTime = 0;
      this.ufoTargetId = picked.id;
      this.ufoHoverPos.set(picked.worldCenter.x, picked.worldCenter.y + 12.2, picked.worldCenter.z);
      this.ufoStartPos.set(picked.worldCenter.x + 18, picked.worldCenter.y + 32, picked.worldCenter.z - 16);
      this.ufo.root.position.copy(this.ufoStartPos);
      this.ufo.root.visible = true;
      this.ufo.beam.visible = false;
      this.ufo.beamMat.opacity = 0;
      this.ufoPhase = 'approach';
      this.ufoPhaseTime = 0;

      playUfoWarbleSound(muted);
      this.callbacks.onToast?.(
        `神秘飞碟 · 锁定${picked.meta.shortZh}`,
        `UFO Sighting · ${picked.meta.shortEn}`,
        `雷达信号已接通！飞碟正飞往${picked.meta.nameZh}开启零重力牵引光束！`,
        `Signal locked! A UFO is descending on ${picked.meta.nameEn} with its tractor beam!`,
        '🛸'
      );
    }
  }

  public getProximityPrompt(playerPos: THREE.Vector3): {
    kind: SkySeaToyKind;
    titleZh: string;
    subZh: string;
    dist: number;
  } | null {
    let best: { kind: SkySeaToyKind; titleZh: string; subZh: string; dist: number } | null = null;
    let bestDist = Infinity;

    const dFw = Math.hypot(this.fireworksPos.x - playerPos.x, this.fireworksPos.z - playerPos.z);
    if (dFw < 3.4 && dFw < bestDist) {
      bestDist = dFw;
      best = {
        kind: 'pier-fireworks',
        titleZh: '🎆 彩绘烟花筒 · 漂流瓶码头',
        subZh: '按 [E] 或点击点燃海面五连发烟花',
        dist: dFw,
      };
    }

    const dPeb = Math.hypot(this.pebblePos.x - playerPos.x, this.pebblePos.z - playerPos.z);
    if (dPeb < 3.4 && dPeb < bestDist) {
      bestDist = dPeb;
      best = {
        kind: 'beach-skip-stone',
        titleZh: '🪨 鹅卵石堆 · 海岸浅滩',
        subZh: '按 [E] 或点击向海面打个水漂',
        dist: dPeb,
      };
    }

    const dAnt = Math.hypot(this.antennaPos.x - playerPos.x, this.antennaPos.z - playerPos.z);
    if (dAnt < 3.4 && dAnt < bestDist) {
      bestDist = dAnt;
      best = {
        kind: 'ufo-antenna',
        titleZh: '📡 神秘雷达天线 · 主岛西坡',
        subZh: '按 [E] 或点击发射信号召唤 UFO 牵引光束',
        dist: dAnt,
      };
    }

    return best;
  }

  private launchRocket(colorHex: string) {
    const rocket = this.rockets.find((r) => !r.active);
    if (!rocket) return;
    rocket.active = true;
    rocket.pos.set(
      this.fireworksPos.x + (Math.random() - 0.5) * 0.9,
      this.fireworksPos.y + 0.8,
      this.fireworksPos.z
    );
    rocket.vel.set(
      (Math.random() - 0.5) * 4.5,
      15.5 + Math.random() * 3.5,
      3.5 + Math.random() * 4.0
    );
    rocket.targetY = 13.5 + Math.random() * 4.5;
    rocket.color.set(colorHex);
    (rocket.mesh.material as THREE.MeshBasicMaterial).color.copy(rocket.color);
    rocket.mesh.position.copy(rocket.pos);
    rocket.mesh.visible = true;
    playFireworkWhistleSound(this.callbacks.isMuted?.() ?? false);
  }

  private burstFirework(pos: THREE.Vector3, color: THREE.Color) {
    playFireworkBurstSound(this.callbacks.isMuted?.() ?? false);

    let spawned = 0;
    let colorDirty = false;
    for (let i = 0; i < this.fwSparks.length; i++) {
      const sp = this.fwSparks[i];
      if (sp.active) continue;
      sp.active = true;
      sp.age = 0;
      sp.maxAge = 1.25 + Math.random() * 0.8;
      sp.pos.copy(pos);

      // Uniform spherical starburst distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const spd = 4.2 + Math.random() * 6.5;
      sp.vel.set(
        Math.sin(phi) * Math.cos(theta) * spd,
        Math.cos(phi) * spd + 1.2,
        Math.sin(phi) * Math.sin(theta) * spd
      );
      sp.baseScale = 0.75 + Math.random() * 0.7;

      // Slight warm gold variation mixed with primary color
      _c.copy(color).offsetHSL((Math.random() - 0.5) * 0.06, 0, (Math.random() - 0.5) * 0.15);
      this.fwSparkMesh.setColorAt(i, _c);
      colorDirty = true;

      if (++spawned >= 44) break;
    }
    if (colorDirty && this.fwSparkMesh.instanceColor) {
      this.fwSparkMesh.instanceColor.needsUpdate = true;
    }
  }

  private spawnRipple(x: number, z: number) {
    const r = this.ripples.find((rip) => !rip.active) ?? this.ripples[0];
    r.active = true;
    r.age = 0;
    r.maxAge = 0.95;
    r.mesh.position.set(x, -0.14, z);
    r.mesh.scale.setScalar(0.25);
    r.mat.opacity = 0.85;
    r.mesh.visible = true;
  }

  public update(dt: number, elapsed: number) {
    const safeDt = Math.min(dt, 0.05);
    const muted = this.callbacks.isMuted?.() ?? false;

    // 1. Queued fireworks salvo
    for (let i = this.fireworkQueue.length - 1; i >= 0; i--) {
      this.fireworkQueue[i].delay -= safeDt;
      if (this.fireworkQueue[i].delay <= 0) {
        const item = this.fireworkQueue.splice(i, 1)[0];
        this.launchRocket(item.color);
      }
    }

    // Rising rockets
    for (const r of this.rockets) {
      if (!r.active) continue;
      r.vel.y -= 6.5 * safeDt;
      r.pos.addScaledVector(r.vel, safeDt);
      r.mesh.position.copy(r.pos);
      if (r.pos.y >= r.targetY || r.vel.y <= 1.0) {
        r.active = false;
        r.mesh.visible = false;
        this.burstFirework(r.pos, r.color);
      }
    }

    // Firework starburst sparks
    let fwDirty = false;
    for (let i = 0; i < this.fwSparks.length; i++) {
      const sp = this.fwSparks[i];
      if (!sp.active) continue;
      fwDirty = true;
      sp.age += safeDt;
      if (sp.age >= sp.maxAge) {
        sp.active = false;
        _m4.makeScale(0, 0, 0);
        this.fwSparkMesh.setMatrixAt(i, _m4);
        continue;
      }
      const u = sp.age / sp.maxAge;
      sp.vel.multiplyScalar(Math.pow(0.22, safeDt));
      sp.vel.y -= 4.8 * safeDt;
      sp.pos.addScaledVector(sp.vel, safeDt);
      const s = sp.baseScale * (1 - u);
      _s.setScalar(Math.max(0.001, s));
      _q.identity();
      _m4.compose(sp.pos, _q, _s);
      this.fwSparkMesh.setMatrixAt(i, _m4);
    }
    if (fwDirty) this.fwSparkMesh.instanceMatrix.needsUpdate = true;

    // 2. Skipping stones & water ripples
    for (const st of this.skipStones) {
      if (!st.active) continue;
      st.vel.y -= 15.5 * safeDt;
      st.pos.addScaledVector(st.vel, safeDt);
      st.mesh.position.copy(st.pos);
      st.mesh.rotation.y += safeDt * 24;

      if (st.pos.y <= -0.18) {
        this.spawnRipple(st.pos.x, st.pos.z);
        st.bounces += 1;
        if (st.bounces < 5) {
          st.pos.y = -0.16;
          st.vel.y = Math.max(1.8, Math.abs(st.vel.y) * 0.72);
          st.vel.x *= 0.84;
          st.vel.z *= 0.84;
          playStoneSkipSound(st.bounces, muted);
        } else {
          playStoneSkipSound(5, muted);
          st.active = false;
          st.mesh.visible = false;
        }
      }
    }

    for (const rip of this.ripples) {
      if (!rip.active) continue;
      rip.age += safeDt;
      if (rip.age >= rip.maxAge) {
        rip.active = false;
        rip.mesh.visible = false;
        continue;
      }
      const u = rip.age / rip.maxAge;
      rip.mesh.scale.setScalar(0.25 + u * 2.4);
      rip.mat.opacity = 0.8 * (1 - u);
    }

    // 3. Mystery Radar Dish & Cartoon UFO Tractor Beam
    if (this.antennaDish) {
      this.antennaDish.rotation.y =
        this.ufoPhase !== 'idle' ? elapsed * 4.5 : Math.sin(elapsed * 0.7) * 0.6;
    }
    if (this.antennaTipMat) {
      if (this.antennaPulseTime < 2.0) {
        this.antennaPulseTime += safeDt;
        this.antennaTipMat.emissiveIntensity = 1.6 + Math.sin(elapsed * 32) * 0.8;
      } else {
        this.antennaTipMat.emissiveIntensity = 0.55 + Math.sin(elapsed * 2.5) * 0.35;
      }
    }

    if (this.ufoPhase !== 'idle') {
      this.ufoPhaseTime += safeDt;
      this.ufo.body.rotation.y += safeDt * 2.8;
      this.ufo.rimLights.forEach((bulb, idx) => {
        const active = Math.floor(elapsed * 10 + idx) % 2 === 0;
        bulb.scale.setScalar(active ? 1.2 : 0.75);
      });

      if (this.ufoPhase === 'approach') {
        const u = Math.min(1, this.ufoPhaseTime / 1.45);
        const eased = 1 - Math.pow(1 - u, 3);
        this.ufo.root.position.lerpVectors(this.ufoStartPos, this.ufoHoverPos, eased);
        this.ufo.body.rotation.z = (1 - u) * 0.28;
        if (u >= 1) {
          this.ufoPhase = 'beaming';
          this.ufoPhaseTime = 0;
          this.ufo.beam.visible = true;
          if (this.ufoTargetId) {
            this.destruction.startZeroGBeam(this.ufoTargetId);
          }
        }
      } else if (this.ufoPhase === 'beaming') {
        const dur = 3.4;
        const u = Math.min(1, this.ufoPhaseTime / dur);
        this.ufo.root.position.y = this.ufoHoverPos.y + Math.sin(elapsed * 3.2) * 0.35;
        this.ufo.body.rotation.z = Math.sin(elapsed * 2.0) * 0.06;
        this.ufo.beamMat.opacity = 0.28 + Math.sin(elapsed * 14) * 0.06;
        if (u >= 1) {
          this.ufo.beam.visible = false;
          this.ufo.beamMat.opacity = 0;
          if (this.ufoTargetId) {
            this.destruction.releaseZeroGBeam(this.ufoTargetId);
          }
          this.ufoPhase = 'depart';
          this.ufoPhaseTime = 0;
        }
      } else if (this.ufoPhase === 'depart') {
        const u = Math.min(1, this.ufoPhaseTime / 1.3);
        const eased = u * u * u;
        this.ufo.root.position.set(
          this.ufoHoverPos.x - eased * 22,
          this.ufoHoverPos.y + eased * 28,
          this.ufoHoverPos.z - eased * 18
        );
        this.ufo.body.rotation.z = -eased * 0.35;
        if (u >= 1) {
          this.ufo.root.visible = false;
          this.ufoPhase = 'idle';
          this.ufoTargetId = null;
        }
      }
    }
  }

  public dispose() {
    this.mountedRoots.forEach((r) => this.scene.remove(r));
    this.mountedRoots = [];
    this.scene.remove(this.fwSparkMesh, this.ufo.root);
    this.rockets.forEach((r) => this.scene.remove(r.mesh));
    this.skipStones.forEach((s) => this.scene.remove(s.mesh));
    this.ripples.forEach((r) => {
      this.scene.remove(r.mesh);
      r.mat.dispose();
    });
    this.fwSparkMesh.geometry.dispose();
    (this.fwSparkMesh.material as THREE.Material).dispose();
  }
}

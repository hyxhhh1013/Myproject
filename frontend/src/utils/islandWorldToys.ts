import * as THREE from 'three';
import { PersonalMemoryKind } from '../data/islandMemories';

export type WorldToyKind = 'school-bell' | 'maple-harvest' | 'power-breaker';

export interface WorldToyRegistration {
  kind: WorldToyKind;
  id: string;
  hitTarget: THREE.Object3D;
  worldPos: { x: number; y: number; z: number };
}

export interface WorldToysCallbacks {
  onToast?: (titleZh: string, titleEn: string, textZh: string, textEn: string, icon?: string) => void;
  onShiftTimeOfDay?: (targetHour: number) => void;
  isMuted?: () => boolean;
}

// ============================================================================
// Procedural Web Audio Helpers
// ============================================================================
let sharedToyAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!sharedToyAudioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedToyAudioCtx = new AudioCtx();
    }
    if (sharedToyAudioCtx.state === 'suspended') {
      sharedToyAudioCtx.resume().catch(() => {});
    }
    return sharedToyAudioCtx;
  } catch {
    return null;
  }
}

/** Resonant bronze school dismissal bell (3 rings) */
function playSchoolBellSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const partials = [523.25, 1046.5, 1568.0, 2110.0];
    [0, 0.42, 0.84].forEach((offset, ringIdx) => {
      const t = now + offset;
      partials.forEach((freq, pIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = pIdx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        const amp = (0.09 / (pIdx + 1)) * (ringIdx === 2 ? 1.15 : 0.9);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(amp, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + (ringIdx === 2 ? 1.8 : 0.9));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.85);
      });
    });
  } catch {
    // Ignore
  }
}

/** Swirling autumn breeze + golden harvest chime */
function playAutumnWindSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    // Soft filtered breeze whoosh
    const dur = 1.6;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(1250, now + 0.7);
    filter.frequency.exponentialRampToValueAtTime(380, now + dur);
    filter.Q.value = 2.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur + 0.05);

    // Pentatonic golden harvest shimmer
    [587.33, 659.25, 880.0, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const t = now + 0.1 + i * 0.09;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.045, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0006, t + 0.65);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.7);
    });
  } catch {
    // Ignore
  }
}

/** Heavy industrial power breaker clunk + electric arc / power-down hum */
function playPowerBreakerSound(turningOff: boolean, muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    // Heavy switch snap
    const clunk = ctx.createOscillator();
    const clunkG = ctx.createGain();
    clunk.type = 'square';
    clunk.frequency.setValueAtTime(turningOff ? 220 : 180, now);
    clunk.frequency.exponentialRampToValueAtTime(turningOff ? 55 : 320, now + 0.08);
    clunkG.gain.setValueAtTime(0.14, now);
    clunkG.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    clunk.connect(clunkG);
    clunkG.connect(ctx.destination);
    clunk.start(now);
    clunk.stop(now + 0.1);

    // Power-down pitch drop OR power-up hum
    const hum = ctx.createOscillator();
    const humG = ctx.createGain();
    hum.type = 'sawtooth';
    if (turningOff) {
      hum.frequency.setValueAtTime(340, now + 0.04);
      hum.frequency.exponentialRampToValueAtTime(42, now + 0.65);
    } else {
      hum.frequency.setValueAtTime(65, now + 0.04);
      hum.frequency.exponentialRampToValueAtTime(440, now + 0.45);
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    humG.gain.setValueAtTime(0.06, now + 0.04);
    humG.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
    hum.connect(filter);
    filter.connect(humG);
    humG.connect(ctx.destination);
    hum.start(now + 0.04);
    hum.stop(now + 0.7);
  } catch {
    // Ignore
  }
}

// ============================================================================
// Procedural Textures
// ============================================================================
function createBellPlaqueTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#4A2511';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#EAB308';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 30px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('放 学 铜 钟', 128, 34);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createScarecrowFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(0, 0, 128, 128);
    // Cute button eyes
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(46, 54, 7, 0, Math.PI * 2);
    ctx.arc(82, 54, 7, 0, Math.PI * 2);
    ctx.fill();
    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.arc(34, 70, 9, 0, Math.PI * 2);
    ctx.arc(94, 70, 9, 0, Math.PI * 2);
    ctx.fill();
    // Stitched smile
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 68, 22, 0.25, Math.PI - 0.25);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createVoltmeterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.stroke();
    // Green / Red arc ticks
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(64, 64, 44, Math.PI * 0.85, Math.PI * 1.75);
    ctx.stroke();
    ctx.strokeStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(64, 64, 44, Math.PI * 1.75, Math.PI * 2.15);
    ctx.stroke();
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('220V', 64, 96);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createVoltageBadgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 112, 112);
    // Lightning bolt
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.moveTo(74, 20);
    ctx.lineTo(40, 70);
    ctx.lineTo(64, 70);
    ctx.lineTo(52, 108);
    ctx.lineTo(90, 56);
    ctx.lineTo(66, 56);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================================
// 3D Diegetic Toy Builders (Batch 1)
// ============================================================================
interface BellToyRuntime {
  id: string;
  root: THREE.Group;
  bellPivot: THREE.Group;
  rope: THREE.Mesh;
  worldPos: THREE.Vector3;
  campusCenter: THREE.Vector3;
  swingTime: number;
  ringCount: number;
}

function buildSchoolBellProp(localPos: [number, number, number]): {
  root: THREE.Group;
  bellPivot: THREE.Group;
  rope: THREE.Mesh;
  hitTarget: THREE.Mesh;
} {
  const root = new THREE.Group();
  root.position.set(localPos[0], localPos[1], localPos[2]);

  const woodMat = new THREE.MeshStandardMaterial({ color: '#7C4A27', roughness: 0.78 });
  const brassMat = new THREE.MeshStandardMaterial({
    color: '#EAB308',
    roughness: 0.25,
    metalness: 0.84,
    emissive: '#854D0E',
    emissiveIntensity: 0.22,
  });
  const ropeMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.72 });

  // Stone base plinth
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.14, 0.65),
    new THREE.MeshStandardMaterial({ color: '#D6D3CD', roughness: 0.85 })
  );
  base.position.y = 0.07;
  base.receiveShadow = true;
  root.add(base);

  // Wooden twin posts + top beam
  [-0.34, 0.34].forEach((px) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.48, 0.1), woodMat);
    post.position.set(px, 0.86, 0);
    post.castShadow = true;
    root.add(post);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.12, 0.14), woodMat);
  beam.position.set(0, 1.62, 0);
  beam.castShadow = true;
  root.add(beam);

  // Diagonal timber corner braces + gold-lettered wooden plaque
  [-0.24, 0.24].forEach((bx) => {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.06), woodMat);
    brace.position.set(bx, 1.46, 0);
    brace.rotation.z = bx < 0 ? -0.75 : 0.75;
    root.add(brace);
  });
  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.17, 0.04),
    new THREE.MeshStandardMaterial({ map: createBellPlaqueTexture(), roughness: 0.55 })
  );
  plaque.position.set(0, 1.63, 0.09);
  root.add(plaque);

  // Small tiled roof cap over the bell frame
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.72, 0.36, 4),
    new THREE.MeshStandardMaterial({ color: '#2F465E', roughness: 0.55 })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 1.86, 0);
  roof.castShadow = true;
  root.add(roof);

  // Sculpted LatheGeometry bronze bell pivot
  const bellPivot = new THREE.Group();
  bellPivot.position.set(0, 1.54, 0);

  const bellProfile = [
    new THREE.Vector2(0.02, 0.0),
    new THREE.Vector2(0.11, -0.04),
    new THREE.Vector2(0.14, -0.14),
    new THREE.Vector2(0.18, -0.28),
    new THREE.Vector2(0.28, -0.42),
    new THREE.Vector2(0.31, -0.45),
    new THREE.Vector2(0.27, -0.47),
  ];
  const bellBody = new THREE.Mesh(new THREE.LatheGeometry(bellProfile, 22), brassMat);
  bellBody.castShadow = true;
  bellPivot.add(bellBody);

  const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), brassMat);
  clapper.position.y = -0.47;
  bellPivot.add(clapper);

  root.add(bellPivot);

  // Red pull rope hanging down
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.72, 8), ropeMat);
  rope.position.set(0.16, 0.92, 0.05);
  root.add(rope);

  const tassel = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), ropeMat);
  tassel.position.set(0, -0.38, 0);
  rope.add(tassel);

  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitTarget.position.set(0, 1.05, 0);
  root.add(hitTarget);

  return { root, bellPivot, rope, hitTarget };
}

interface ScarecrowToyRuntime {
  id: string;
  root: THREE.Group;
  body: THREE.Group;
  worldPos: THREE.Vector3;
  campusCenter: THREE.Vector3;
  spinTime: number;
}

function buildScarecrowProp(localPos: [number, number, number]): {
  root: THREE.Group;
  body: THREE.Group;
  hitTarget: THREE.Mesh;
} {
  const root = new THREE.Group();
  root.position.set(localPos[0], localPos[1], localPos[2]);

  const body = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: '#784421', roughness: 0.85 });
  const coatMat = new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.8 });
  const strawMat = new THREE.MeshStandardMaterial({
    color: '#FACC15',
    roughness: 0.72,
    emissive: '#A16207',
    emissiveIntensity: 0.14,
  });
  const hatMat = new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.76 });
  const scarfMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.65 });

  // Vertical wooden pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.55, 8), woodMat);
  pole.position.y = 0.78;
  pole.castShadow = true;
  body.add(pole);

  // Crossbar arms
  const arms = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.12, 8), woodMat);
  arms.rotation.z = Math.PI / 2;
  arms.position.y = 1.08;
  arms.castShadow = true;
  body.add(arms);

  // Autumn tunic torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.62, 10), coatMat);
  torso.position.y = 0.94;
  torso.castShadow = true;
  body.add(torso);

  // Red autumn scarf
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.045, 8, 16), scarfMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 1.24;
  body.add(scarf);

  // Burlap head with cute stitched smiling face
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 14, 12),
    new THREE.MeshStandardMaterial({ map: createScarecrowFaceTexture(), roughness: 0.85 })
  );
  head.position.y = 1.4;
  head.rotation.y = -Math.PI / 2;
  head.castShadow = true;
  body.add(head);

  // Straw tufts sticking out from both sleeves
  [-0.56, 0.56].forEach((sx) => {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 7), strawMat);
    tuft.position.set(sx, 1.08, 0);
    tuft.rotation.z = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
    body.add(tuft);
  });

  // Wide straw hat + tiny perched blackbird on brim!
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.05, 16), strawMat);
  brim.position.y = 1.54;
  brim.rotation.z = -0.08;
  body.add(brim);

  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.24, 14), hatMat);
  crown.position.y = 1.67;
  crown.rotation.z = -0.08;
  body.add(crown);

  const crowMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.6 });
  const crowBody = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), crowMat);
  crowBody.scale.set(1.3, 0.9, 0.9);
  crowBody.position.set(-0.24, 1.62, 0.1);
  body.add(crowBody);
  const crowBeak = new THREE.Mesh(
    new THREE.ConeGeometry(0.022, 0.08, 6),
    new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.5 })
  );
  crowBeak.rotation.z = Math.PI / 2;
  crowBeak.position.set(-0.33, 1.63, 0.1);
  body.add(crowBeak);

  // Golden wheat sheaf tied to right arm
  const wheat = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 8), strawMat);
  wheat.position.set(0.48, 1.12, 0.06);
  wheat.rotation.z = -0.3;
  body.add(wheat);

  root.add(body);

  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitTarget.position.set(0, 1.0, 0);
  root.add(hitTarget);

  return { root, body, hitTarget };
}

interface SavedEmissive {
  mat: THREE.MeshStandardMaterial;
  origIntensity: number;
}

interface BreakerToyRuntime {
  id: string;
  root: THREE.Group;
  leverPivot: THREE.Group;
  ledMat: THREE.MeshStandardMaterial;
  worldPos: THREE.Vector3;
  isPowerOff: boolean;
  savedEmissives: SavedEmissive[];
}

function buildPowerBreakerProp(
  localPos: [number, number, number],
  badgeTex: THREE.CanvasTexture
): {
  root: THREE.Group;
  leverPivot: THREE.Group;
  ledMat: THREE.MeshStandardMaterial;
  hitTarget: THREE.Mesh;
} {
  const root = new THREE.Group();
  root.position.set(localPos[0], localPos[1], localPos[2]);

  const steelMat = new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.42,
    metalness: 0.68,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: '#1E293B',
    roughness: 0.5,
    metalness: 0.6,
  });
  const redMat = new THREE.MeshStandardMaterial({
    color: '#EF4444',
    roughness: 0.35,
    emissive: '#7F1D1D',
    emissiveIntensity: 0.25,
  });
  const ledMat = new THREE.MeshStandardMaterial({
    color: '#22C55E',
    emissive: '#22C55E',
    emissiveIntensity: 1.1,
    roughness: 0.2,
  });

  // Pedestal post
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.72, 10), darkMetalMat);
  post.position.y = 0.36;
  post.castShadow = true;
  root.add(post);

  // Breaker cabinet box
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.84, 0.42), steelMat);
  box.position.y = 1.06;
  box.castShadow = true;
  root.add(box);

  // High-voltage lightning bolt decal on lower front + analog voltmeter dial above
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshStandardMaterial({ map: badgeTex, roughness: 0.5 })
  );
  badge.position.set(0, 0.88, 0.216);
  root.add(badge);

  const meter = new THREE.Mesh(
    new THREE.CircleGeometry(0.14, 18),
    new THREE.MeshStandardMaterial({ map: createVoltmeterTexture(), roughness: 0.3 })
  );
  meter.position.set(0.11, 1.24, 0.218);
  root.add(meter);

  // Conduit pipe descending into the floor
  const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.85, 8), darkMetalMat);
  conduit.position.set(-0.22, 0.42, -0.06);
  root.add(conduit);

  // Status LED
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), ledMat);
  led.position.set(-0.2, 1.34, 0.22);
  root.add(led);

  // Side chunky red lever pivot (rotates from -0.65 rad UP to +0.75 rad DOWN)
  const leverPivot = new THREE.Group();
  leverPivot.position.set(0.36, 1.08, 0);
  leverPivot.rotation.x = -0.65;

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.52, 8), darkMetalMat);
  arm.position.set(0.05, 0.26, 0);
  leverPivot.add(arm);

  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.24, 10), redMat);
  grip.rotation.z = Math.PI / 2;
  grip.position.set(0.14, 0.52, 0);
  leverPivot.add(grip);

  root.add(leverPivot);

  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitTarget.position.set(0, 1.05, 0);
  root.add(hitTarget);

  return { root, leverPivot, ledMat, hitTarget };
}

// ============================================================================
// Particle Pool for Batch 1 (Confetti, Autumn Maple Leaves, Electric Sparks)
// ============================================================================
interface ToyParticle {
  active: boolean;
  age: number;
  maxAge: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  baseScale: number;
  swayPhase: number;
  orbitCenter?: THREE.Vector3;
  orbitSpeed?: number;
  floorY: number;
}

const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

export class IslandWorldToysManager {
  private scene: THREE.Scene;
  private callbacks: WorldToysCallbacks;

  private voltageTex: THREE.CanvasTexture;

  private bellToy: BellToyRuntime | null = null;
  private scarecrowToy: ScarecrowToyRuntime | null = null;
  private breakerToy: BreakerToyRuntime | null = null;

  // Instanced particle pools
  private confettiPool: ToyParticle[] = [];
  private maplePool: ToyParticle[] = [];
  private sparkPool: ToyParticle[] = [];
  private confettiMesh: THREE.InstancedMesh;
  private mapleMesh: THREE.InstancedMesh;
  private sparkMesh: THREE.InstancedMesh;

  private readonly MAX_CONFETTI = 90;
  private readonly MAX_MAPLES = 120;
  private readonly MAX_SPARKS = 60;

  constructor(scene: THREE.Scene, callbacks: WorldToysCallbacks = {}) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.voltageTex = createVoltageBadgeTexture();

    // 1. Confetti ribbons (colored per instance)
    const confettiGeo = new THREE.BoxGeometry(0.16, 0.015, 0.32);
    const confettiMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
    this.confettiMesh = new THREE.InstancedMesh(confettiGeo, confettiMat, this.MAX_CONFETTI);
    this.confettiMesh.frustumCulled = false;
    this.confettiMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const palette = ['#F43F5E', '#F59E0B', '#10B981', '#38BDF8', '#A855F7', '#FDE047'];
    for (let i = 0; i < this.MAX_CONFETTI; i++) {
      _c.set(palette[i % palette.length]);
      this.confettiMesh.setColorAt(i, _c);
    }
    if (this.confettiMesh.instanceColor) this.confettiMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.confettiMesh);

    // 2. Crimson/Amber Maple Leaves & Golden Harvest motes
    const mapleGeo = new THREE.OctahedronGeometry(0.16, 0);
    mapleGeo.scale(1.2, 0.16, 1.0);
    const mapleMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.6,
      emissive: '#7C2D12',
      emissiveIntensity: 0.25,
    });
    this.mapleMesh = new THREE.InstancedMesh(mapleGeo, mapleMat, this.MAX_MAPLES);
    this.mapleMesh.frustumCulled = false;
    this.mapleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const autumnPalette = ['#DC2626', '#EA580C', '#F59E0B', '#FACC15', '#B91C1C'];
    for (let i = 0; i < this.MAX_MAPLES; i++) {
      _c.set(autumnPalette[i % autumnPalette.length]);
      this.mapleMesh.setColorAt(i, _c);
    }
    if (this.mapleMesh.instanceColor) this.mapleMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.mapleMesh);

    // 3. Cyan-violet electric sparks
    const sparkGeo = new THREE.OctahedronGeometry(0.1, 0);
    const sparkMat = new THREE.MeshBasicMaterial({ color: '#67E8F9' });
    this.sparkMesh = new THREE.InstancedMesh(sparkGeo, sparkMat, this.MAX_SPARKS);
    this.sparkMesh.frustumCulled = false;
    this.sparkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.sparkMesh);

    this.initPool(this.confettiPool, this.MAX_CONFETTI, this.confettiMesh);
    this.initPool(this.maplePool, this.MAX_MAPLES, this.mapleMesh);
    this.initPool(this.sparkPool, this.MAX_SPARKS, this.sparkMesh);
  }

  private initPool(pool: ToyParticle[], count: number, mesh: THREE.InstancedMesh) {
    _m4.makeScale(0, 0, 0);
    for (let i = 0; i < count; i++) {
      pool.push({
        active: false,
        age: 0,
        maxAge: 1,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Euler(),
        rotVel: new THREE.Vector3(),
        baseScale: 1,
        swayPhase: Math.random() * Math.PI * 2,
        floorY: 0,
      });
      mesh.setMatrixAt(i, _m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  /** Attach Batch-1 landmark-specific 3D toys onto their corresponding memory island groups. */
  public registerLandmarkToy(
    memId: PersonalMemoryKind,
    group: THREE.Group,
    campusWorldPos: { x: number; y: number; z: number }
  ): WorldToyRegistration | null {
    if (memId === 'redbrick-gate') {
      const built = buildSchoolBellProp([-2.95, 0.28, 3.85]);
      group.add(built.root);
      group.updateWorldMatrix(true, true);
      const wp = new THREE.Vector3();
      built.hitTarget.getWorldPosition(wp);
      this.bellToy = {
        id: memId,
        root: built.root,
        bellPivot: built.bellPivot,
        rope: built.rope,
        worldPos: wp,
        campusCenter: new THREE.Vector3(campusWorldPos.x, campusWorldPos.y, campusWorldPos.z),
        swingTime: 99,
        ringCount: 0,
      };
      return {
        kind: 'school-bell',
        id: memId,
        hitTarget: built.hitTarget,
        worldPos: { x: wp.x, y: wp.y, z: wp.z },
      };
    }

    if (memId === 'hunau-campus') {
      const built = buildScarecrowProp([-4.75, 0.28, 3.65]);
      group.add(built.root);
      group.updateWorldMatrix(true, true);
      const wp = new THREE.Vector3();
      built.hitTarget.getWorldPosition(wp);
      this.scarecrowToy = {
        id: memId,
        root: built.root,
        body: built.body,
        worldPos: wp,
        campusCenter: new THREE.Vector3(campusWorldPos.x, campusWorldPos.y, campusWorldPos.z),
        spinTime: 99,
      };
      return {
        kind: 'maple-harvest',
        id: memId,
        hitTarget: built.hitTarget,
        worldPos: { x: wp.x, y: wp.y, z: wp.z },
      };
    }

    if (memId === 'company-studio') {
      // Snapshot all glowing/emissive materials inside the studio so pulling the breaker truly blacks out the building!
      const savedEmissives: SavedEmissive[] = [];
      const seen = new Set<THREE.Material>();
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.material) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (seen.has(m)) return;
          seen.add(m);
          if (m instanceof THREE.MeshStandardMaterial && m.emissiveIntensity > 0.05) {
            savedEmissives.push({ mat: m, origIntensity: m.emissiveIntensity });
          }
        });
      });

      const built = buildPowerBreakerProp([-3.65, 0.2, 3.05], this.voltageTex);
      group.add(built.root);
      group.updateWorldMatrix(true, true);
      const wp = new THREE.Vector3();
      built.hitTarget.getWorldPosition(wp);
      this.breakerToy = {
        id: memId,
        root: built.root,
        leverPivot: built.leverPivot,
        ledMat: built.ledMat,
        worldPos: wp,
        isPowerOff: false,
        savedEmissives,
      };
      return {
        kind: 'power-breaker',
        id: memId,
        hitTarget: built.hitTarget,
        worldPos: { x: wp.x, y: wp.y, z: wp.z },
      };
    }

    return null;
  }

  public isStudioPoweredOff(): boolean {
    return this.breakerToy?.isPowerOff ?? false;
  }

  public triggerToy(kind: WorldToyKind) {
    const muted = this.callbacks.isMuted?.() ?? false;

    if (kind === 'school-bell' && this.bellToy) {
      playSchoolBellSound(muted);
      this.bellToy.swingTime = 0;
      this.bellToy.ringCount += 1;
      this.spawnConfetti(this.bellToy.campusCenter);
      this.callbacks.onShiftTimeOfDay?.(17.5);
      this.callbacks.onToast?.(
        '株洲南方中学 · 放学钟',
        'Nanfang HS · Dismissal Bell',
        '下课铃提前拉响！天色快进至 17:30 放学黄昏，全体解散！',
        'Dismissal bell rung! Fast-forwarding sky to 17:30 golden hour!',
        '🔔'
      );
      return;
    }

    if (kind === 'maple-harvest' && this.scarecrowToy) {
      playAutumnWindSound(muted);
      this.scarecrowToy.spinTime = 0;
      this.spawnMapleWhirlwind(this.scarecrowToy.campusCenter);
      this.callbacks.onToast?.(
        '湖南农业大学 · 红枫与稻浪',
        'HUNAU · Autumn Harvest',
        '秋风卷起红枫叶雨，金色杂交水稻进入丰收模式！',
        'Autumn breeze sweeps crimson maple leaves across the golden paddy!',
        '🍁'
      );
      return;
    }

    if (kind === 'power-breaker' && this.breakerToy) {
      const nextOff = !this.breakerToy.isPowerOff;
      this.breakerToy.isPowerOff = nextOff;
      playPowerBreakerSound(nextOff, muted);

      // Toggle all glowing materials inside the studio building!
      for (const item of this.breakerToy.savedEmissives) {
        item.mat.emissiveIntensity = nextOff ? 0.0 : item.origIntensity;
      }

      this.breakerToy.ledMat.color.set(nextOff ? '#EF4444' : '#22C55E');
      this.breakerToy.ledMat.emissive.set(nextOff ? '#EF4444' : '#22C55E');
      this.spawnElectricSparks(this.breakerToy.worldPos);

      if (nextOff) {
        this.callbacks.onToast?.(
          '研发工作室 · 物理断电',
          'Studio · Power Cut',
          '电闸已拉下！服务器与大屏全部熄灯，今天禁止提需求！',
          'Main breaker pulled! All servers offline — no PRs allowed today!',
          '⚡'
        );
      } else {
        this.callbacks.onToast?.(
          '研发工作室 · 恢复供电',
          'Studio · Power Restored',
          '电力重新接通！咖啡机与 IDE 已满血上线！',
          'Power restored! Coffee machine & IDE back online!',
          '💡'
        );
      }
    }
  }

  public getProximityPrompt(playerPos: THREE.Vector3): {
    kind: WorldToyKind;
    id: string;
    titleZh: string;
    subZh: string;
    dist: number;
  } | null {
    let best: {
      kind: WorldToyKind;
      id: string;
      titleZh: string;
      subZh: string;
      dist: number;
    } | null = null;
    let bestDist = Infinity;

    if (this.bellToy) {
      const d = Math.hypot(
        this.bellToy.worldPos.x - playerPos.x,
        this.bellToy.worldPos.z - playerPos.z
      );
      if (d < 3.4 && d < bestDist) {
        bestDist = d;
        best = {
          kind: 'school-bell',
          id: this.bellToy.id,
          titleZh: '🔔 放学铜钟 · 南方中学',
          subZh: '按 [E] 或点击敲响放学钟，快进到黄昏',
          dist: d,
        };
      }
    }

    if (this.scarecrowToy) {
      const d = Math.hypot(
        this.scarecrowToy.worldPos.x - playerPos.x,
        this.scarecrowToy.worldPos.z - playerPos.z
      );
      if (d < 3.4 && d < bestDist) {
        bestDist = d;
        best = {
          kind: 'maple-harvest',
          id: this.scarecrowToy.id,
          titleZh: '🍁 稻田稻草人 · 湖南农大',
          subZh: '按 [E] 或点击唤起秋风红枫叶雨',
          dist: d,
        };
      }
    }

    if (this.breakerToy) {
      const d = Math.hypot(
        this.breakerToy.worldPos.x - playerPos.x,
        this.breakerToy.worldPos.z - playerPos.z
      );
      if (d < 3.4 && d < bestDist) {
        bestDist = d;
        best = {
          kind: 'power-breaker',
          id: this.breakerToy.id,
          titleZh: this.breakerToy.isPowerOff
            ? '💡 工业电闸（已断电） · 研发工作室'
            : '⚡ 工业电闸（供电中） · 研发工作室',
          subZh: this.breakerToy.isPowerOff
            ? '按 [E] 或点击推上电闸恢复供电'
            : '按 [E] 或点击拉闸断电提前下班',
          dist: d,
        };
      }
    }

    return best;
  }

  private spawnConfetti(center: THREE.Vector3) {
    let n = 0;
    for (const p of this.confettiPool) {
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      p.maxAge = 3.8 + Math.random() * 2.2;
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.0 + Math.random() * 5.8;
      p.pos.set(
        center.x + (Math.random() - 0.5) * 4.2,
        center.y + 4.2 + Math.random() * 1.8,
        center.z + (Math.random() - 0.5) * 3.5
      );
      p.vel.set(Math.cos(ang) * spd, 5.5 + Math.random() * 5.2, Math.sin(ang) * spd);
      p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      p.rotVel.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 10
      );
      p.baseScale = 0.85 + Math.random() * 0.65;
      p.floorY = center.y + 0.3;
      if (++n >= 70) break;
    }
  }

  private spawnMapleWhirlwind(center: THREE.Vector3) {
    let n = 0;
    for (const p of this.maplePool) {
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      p.maxAge = 4.6 + Math.random() * 2.4;
      const ang = Math.random() * Math.PI * 2;
      const rad = 1.6 + Math.random() * 5.2;
      p.pos.set(
        center.x + Math.cos(ang) * rad,
        center.y + 0.8 + Math.random() * 4.5,
        center.z + Math.sin(ang) * rad
      );
      p.vel.set(0, 1.6 + Math.random() * 2.2, 0);
      p.orbitCenter = center.clone();
      p.orbitSpeed = 1.6 + Math.random() * 1.4;
      p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      p.rotVel.set(
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 7
      );
      p.baseScale = 0.9 + Math.random() * 0.7;
      p.floorY = center.y + 0.25;
      if (++n >= 95) break;
    }
  }

  private spawnElectricSparks(origin: THREE.Vector3) {
    let n = 0;
    for (const p of this.sparkPool) {
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      p.maxAge = 0.45 + Math.random() * 0.4;
      p.pos.set(origin.x, origin.y + 0.2, origin.z);
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.2 + Math.random() * 4.8;
      p.vel.set(Math.cos(ang) * spd, 2.2 + Math.random() * 4.2, Math.sin(ang) * spd);
      p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      p.rotVel.set(10, 10, 10);
      p.baseScale = 0.7 + Math.random() * 0.7;
      p.floorY = origin.y - 0.9;
      if (++n >= 32) break;
    }
  }

  public update(dt: number, elapsed: number) {
    const safeDt = Math.min(dt, 0.05);

    // 1. School Bell damped swing
    if (this.bellToy) {
      if (this.bellToy.swingTime < 2.8) {
        this.bellToy.swingTime += safeDt;
        const decay = Math.exp(-this.bellToy.swingTime * 1.25);
        this.bellToy.bellPivot.rotation.z = Math.sin(this.bellToy.swingTime * 14) * 0.58 * decay;
        this.bellToy.rope.position.y =
          0.92 - Math.max(0, Math.sin(this.bellToy.swingTime * 9) * 0.16 * decay);
      } else {
        this.bellToy.bellPivot.rotation.z = Math.sin(elapsed * 1.4) * 0.03;
      }
    }

    // 2. Scarecrow joyful spin & gentle idle sway
    if (this.scarecrowToy) {
      if (this.scarecrowToy.spinTime < 1.2) {
        this.scarecrowToy.spinTime += safeDt;
        const u = Math.min(1, this.scarecrowToy.spinTime / 1.2);
        const eased = 1 - Math.pow(1 - u, 3);
        this.scarecrowToy.body.rotation.y = eased * Math.PI * 4;
        this.scarecrowToy.body.position.y = Math.sin(u * Math.PI) * 0.45;
      } else {
        this.scarecrowToy.body.rotation.y = 0;
        this.scarecrowToy.body.position.y = 0;
        this.scarecrowToy.body.rotation.z = Math.sin(elapsed * 1.8) * 0.04;
      }
    }

    // 3. Power Breaker smooth lever animation
    if (this.breakerToy) {
      const targetAngle = this.breakerToy.isPowerOff ? 0.78 : -0.65;
      this.breakerToy.leverPivot.rotation.x +=
        (targetAngle - this.breakerToy.leverPivot.rotation.x) * Math.min(1, safeDt * 18);
      this.breakerToy.ledMat.emissiveIntensity = this.breakerToy.isPowerOff
        ? 0.4 + Math.sin(elapsed * 6.5) * 0.35
        : 1.05;
    }

    // Update particle pools
    this.updateConfetti(safeDt, elapsed);
    this.updateMaples(safeDt, elapsed);
    this.updateSparks(safeDt);
  }

  private updateConfetti(dt: number, elapsed: number) {
    let dirty = false;
    for (let i = 0; i < this.confettiPool.length; i++) {
      const p = this.confettiPool[i];
      if (!p.active) continue;
      dirty = true;
      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        _m4.makeScale(0, 0, 0);
        this.confettiMesh.setMatrixAt(i, _m4);
        continue;
      }
      const u = p.age / p.maxAge;
      p.vel.x *= Math.pow(0.35, dt);
      p.vel.z *= Math.pow(0.35, dt);
      p.vel.y -= 9.0 * dt;
      if (p.vel.y < -1.5) p.vel.y = -1.5;

      p.pos.x += (p.vel.x + Math.sin(elapsed * 4.2 + p.swayPhase) * 0.9) * dt;
      p.pos.y += p.vel.y * dt;
      p.pos.z += (p.vel.z + Math.cos(elapsed * 3.6 + p.swayPhase) * 0.9) * dt;

      if (p.pos.y <= p.floorY) {
        p.pos.y = p.floorY;
        p.vel.set(0, 0, 0);
      } else {
        p.rot.x += p.rotVel.x * dt;
        p.rot.y += p.rotVel.y * dt;
        p.rot.z += p.rotVel.z * dt;
      }

      const fade = u > 0.8 ? 1 - (u - 0.8) / 0.2 : 1;
      _s.setScalar(Math.max(0.001, p.baseScale * fade));
      _q.setFromEuler(p.rot);
      _m4.compose(p.pos, _q, _s);
      this.confettiMesh.setMatrixAt(i, _m4);
    }
    if (dirty) this.confettiMesh.instanceMatrix.needsUpdate = true;
  }

  private updateMaples(dt: number, elapsed: number) {
    let dirty = false;
    for (let i = 0; i < this.maplePool.length; i++) {
      const p = this.maplePool[i];
      if (!p.active) continue;
      dirty = true;
      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        _m4.makeScale(0, 0, 0);
        this.mapleMesh.setMatrixAt(i, _m4);
        continue;
      }
      const u = p.age / p.maxAge;
      if (p.orbitCenter && p.orbitSpeed) {
        // Gentle swirling vortex around campus, then float down
        const dx = p.pos.x - p.orbitCenter.x;
        const dz = p.pos.z - p.orbitCenter.z;
        const swirl = p.orbitSpeed * (1 - u * 0.65) * dt;
        const cos = Math.cos(swirl);
        const sin = Math.sin(swirl);
        p.pos.x = p.orbitCenter.x + (dx * cos - dz * sin);
        p.pos.z = p.orbitCenter.z + (dx * sin + dz * cos);
      }
      p.vel.y -= 2.2 * dt;
      if (p.vel.y < -1.1) p.vel.y = -1.1;
      p.pos.y += p.vel.y * dt;
      p.pos.x += Math.sin(elapsed * 3.0 + p.swayPhase) * 0.45 * dt;

      if (p.pos.y <= p.floorY) {
        p.pos.y = p.floorY;
        p.vel.y = 0;
      } else {
        p.rot.x += p.rotVel.x * dt;
        p.rot.y += p.rotVel.y * dt;
        p.rot.z += p.rotVel.z * dt;
      }

      const fade = u > 0.8 ? 1 - (u - 0.8) / 0.2 : 1;
      _s.setScalar(Math.max(0.001, p.baseScale * fade));
      _q.setFromEuler(p.rot);
      _m4.compose(p.pos, _q, _s);
      this.mapleMesh.setMatrixAt(i, _m4);
    }
    if (dirty) this.mapleMesh.instanceMatrix.needsUpdate = true;
  }

  private updateSparks(dt: number) {
    let dirty = false;
    for (let i = 0; i < this.sparkPool.length; i++) {
      const p = this.sparkPool[i];
      if (!p.active) continue;
      dirty = true;
      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        _m4.makeScale(0, 0, 0);
        this.sparkMesh.setMatrixAt(i, _m4);
        continue;
      }
      const u = p.age / p.maxAge;
      p.vel.y -= 16 * dt;
      p.pos.addScaledVector(p.vel, dt);
      p.rot.x += p.rotVel.x * dt;
      p.rot.y += p.rotVel.y * dt;
      _s.setScalar(Math.max(0.001, p.baseScale * (1 - u)));
      _q.setFromEuler(p.rot);
      _m4.compose(p.pos, _q, _s);
      this.sparkMesh.setMatrixAt(i, _m4);
    }
    if (dirty) this.sparkMesh.instanceMatrix.needsUpdate = true;
  }

  public dispose() {
    this.bellToy?.root.parent?.remove(this.bellToy.root);
    this.scarecrowToy?.root.parent?.remove(this.scarecrowToy.root);
    this.breakerToy?.root.parent?.remove(this.breakerToy.root);
    this.scene.remove(this.confettiMesh, this.mapleMesh, this.sparkMesh);
    this.confettiMesh.geometry.dispose();
    (this.confettiMesh.material as THREE.Material).dispose();
    this.mapleMesh.geometry.dispose();
    (this.mapleMesh.material as THREE.Material).dispose();
    this.sparkMesh.geometry.dispose();
    (this.sparkMesh.material as THREE.Material).dispose();
    this.voltageTex.dispose();
  }
}

import * as THREE from 'three';
import { PersonalMemoryKind } from '../data/islandMemories';

export type DestructibleState = 'intact' | 'wiring' | 'exploded' | 'rebuilding' | 'abducted';

export interface DestructibleMeta {
  id: PersonalMemoryKind;
  shortZh: string;
  shortEn: string;
  nameZh: string;
  nameEn: string;
  /** Local placement of the 3D detonator box inside the landmark's group */
  detonatorLocalPos: [number, number, number];
  /** Local target point where the wire enters the building */
  wireEndLocalPos: [number, number, number];
  toastsZh: string[];
  toastsEn: string[];
}

export const DESTRUCTIBLE_TARGETS: DestructibleMeta[] = [
  {
    id: 'yzfls-campus',
    shortZh: '株洲外校',
    shortEn: 'YZFLS',
    nameZh: '株洲市外国语学校',
    nameEn: 'Zhuzhou Foreign Language School',
    detonatorLocalPos: [3.85, 0.28, 4.15],
    wireEndLocalPos: [0, 1.45, -1.2],
    toastsZh: [
      '「办有灵魂的学校」已升空，英语听写永久取消！',
      '作业本与晨读课文已化为满天飞雪！',
      '227 班宣布提前放暑假！',
    ],
    toastsEn: [
      'Morning English dictation officially cancelled!',
      'Homework sheets scattered across the sky!',
      'Class 227 declares eternal summer vacation!',
    ],
  },
  {
    id: 'redbrick-gate',
    shortZh: '南方中学',
    shortEn: 'Nanfang HS',
    nameZh: '株洲南方中学',
    nameEn: 'Zhuzhou Nanfang High School',
    detonatorLocalPos: [2.95, 0.28, 3.85],
    wireEndLocalPos: [0.6, 0.45, -0.5],
    toastsZh: [
      '红砖钟楼已起飞，晚自习正式解散！',
      '五年高考三年模拟已成功物理超度！',
      '2114 班的铃声再也响不起来了！',
    ],
    toastsEn: [
      'The red-brick clock tower has achieved liftoff!',
      'Mock exam papers turned into confetti!',
      'Evening self-study is permanently dismissed!',
    ],
  },
  {
    id: 'hunau-campus',
    shortZh: '湖南农大',
    shortEn: 'HUNAU',
    nameZh: '湖南农业大学',
    nameEn: 'Hunan Agricultural University',
    detonatorLocalPos: [4.55, 0.28, 3.75],
    wireEndLocalPos: [0, 0.55, -1.6],
    toastsZh: [
      '早八已彻底物理取消，计科实验报告随风飘散！',
      '第一教学楼原地升天，红枫叶与考卷齐飞！',
      '期末周警告已解除（仅限本岛有效）！',
    ],
    toastsEn: [
      '8 AM lectures physically cancelled!',
      'CS lab reports fluttering into the ocean!',
      'Finals week temporarily suspended on this island!',
    ],
  },
  {
    id: 'company-studio',
    shortZh: '办公大楼',
    shortEn: 'Office',
    nameZh: '研发工作室',
    nameEn: 'Engineering Studio',
    detonatorLocalPos: [3.75, 0.2, 3.05],
    wireEndLocalPos: [0, 0.55, -0.4],
    toastsZh: [
      '需求文档与周报已成功物理销毁，准时下班！',
      'Bug 随着屋顶一起飞向了外太空！',
      '今天全员带薪放假，禁止提 PR！',
    ],
    toastsEn: [
      'PRD & weekly reports physically shredded!',
      'All production bugs launched into orbit!',
      'Emergency paid holiday activated!',
    ],
  },
];

export const DESTRUCTIBLE_IDS = new Set<PersonalMemoryKind>(
  DESTRUCTIBLE_TARGETS.map((t) => t.id)
);

// ============================================================================
// Procedural Web Audio Sound Effects (Zero external asset dependencies)
// ============================================================================
let sharedAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/** Mechanical T-handle plunger slam */
export function playPlungerClunkSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    // Heavy metallic thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 0.085);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);

    // Crisp latch click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1150, now + 0.055);
    clickOsc.frequency.exponentialRampToValueAtTime(420, now + 0.08);
    clickGain.gain.setValueAtTime(0.06, now + 0.055);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now + 0.055);
    clickOsc.stop(now + 0.095);
  } catch {
    // Ignore
  }
}

/** Spark sizzling along the detonator wire */
export function playFuseSizzleSound(durationSec = 0.95, muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Crackling white noise bursts
      const crackle = Math.random() > 0.88 ? 1.0 : 0.35;
      data[i] = (Math.random() * 2 - 1) * crackle;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.linearRampToValueAtTime(5400, now + durationSec);
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.06);
    gain.gain.setValueAtTime(0.085, now + durationSec * 0.85);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + durationSec + 0.02);
  } catch {
    // Ignore
  }
}

export function playCartoonExplosionSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;

    // 1. Sub-bass shockwave punch (145Hz -> 26Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(145, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.58);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.72);

    // 2. Filtered white-noise boom
    const bufferSize = Math.floor(ctx.sampleRate * 1.15);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.3);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(130, now + 1.0);
    filter.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.27, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 1.12);
  } catch {
    // Ignore
  }
}

export function playRewindSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = [392.0, 493.88, 587.33, 783.99, 987.77, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.1;
      osc.frequency.setValueAtTime(freq * 0.9, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.065, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {
    // Ignore
  }
}

// ============================================================================
// Procedural Textures (Detonator Caution Badge & Mini Exam Paper)
// ============================================================================
function createDetonatorBadgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Hazard yellow-black stripes top & bottom
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#18181B';
    for (let x = -128; x < 384; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 14, 0);
      ctx.lineTo(x - 6, 22);
      ctx.lineTo(x - 20, 22);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, 106);
      ctx.lineTo(x + 14, 106);
      ctx.lineTo(x - 6, 128);
      ctx.lineTo(x - 20, 128);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#18181B';
    ctx.fillRect(0, 22, 256, 84);
    ctx.fillStyle = '#EF4444';
    ctx.font = '900 44px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TNT', 128, 66);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createExamPaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(0, 0, 128, 160);
    // Faint printed lines
    ctx.fillStyle = '#CBD5E1';
    for (let y = 24; y < 146; y += 14) {
      ctx.fillRect(14, y, 100 - ((y * 7) % 28), 3);
    }
    // Red teacher grade mark in top-right corner
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(96, 32, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A+', 96, 33);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================================
// 3D Diegetic Props: Cartoon Plunger Detonator & Golden Time-Rewind Hourglass
// ============================================================================
interface BuiltDetonator {
  root: THREE.Group;
  hitTarget: THREE.Mesh;
  plunger: THREE.Group;
  lampMat: THREE.MeshStandardMaterial;
  wireCurve: THREE.CatmullRomCurve3;
  spark: THREE.Mesh;
  sparkGlow: THREE.Mesh;
  plungerUpY: number;
  plungerDownY: number;
}

function buildPlungerDetonator(
  localPos: [number, number, number],
  wireEndLocal: [number, number, number],
  badgeTex: THREE.CanvasTexture
): BuiltDetonator {
  const root = new THREE.Group();
  root.position.set(localPos[0], localPos[1], localPos[2]);

  const woodMat = new THREE.MeshStandardMaterial({ color: '#9A5B2C', roughness: 0.78 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: '#6E3D1B', roughness: 0.82 });
  const metalMat = new THREE.MeshStandardMaterial({
    color: '#CBD5E1',
    roughness: 0.28,
    metalness: 0.78,
  });
  const redHandleMat = new THREE.MeshStandardMaterial({
    color: '#DC2626',
    roughness: 0.36,
    emissive: '#7F1D1D',
    emissiveIntensity: 0.22,
  });
  const badgeMat = new THREE.MeshStandardMaterial({ map: badgeTex, roughness: 0.5 });
  const lampMat = new THREE.MeshStandardMaterial({
    color: '#EF4444',
    emissive: '#EF4444',
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  // Wooden detonator box
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.72, 0.62), woodMat);
  box.position.y = 0.36;
  box.castShadow = true;
  box.receiveShadow = true;
  root.add(box);

  // Brass/wood corner trim top & bottom
  const topTrim = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.09, 0.7), darkWoodMat);
  topTrim.position.y = 0.72;
  topTrim.castShadow = true;
  root.add(topTrim);

  const botTrim = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.09, 0.7), darkWoodMat);
  botTrim.position.y = 0.045;
  root.add(botTrim);

  // Brass corner brackets + wire binding posts for handcrafted detail
  const brassMat = new THREE.MeshStandardMaterial({
    color: '#D9A74A',
    roughness: 0.3,
    metalness: 0.8,
  });
  [
    [-0.38, 0.38, 0.31],
    [0.38, 0.38, 0.31],
    [-0.38, 0.38, -0.31],
    [0.38, 0.38, -0.31],
  ].forEach(([cx, cy, cz]) => {
    const corner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.64, 0.06), brassMat);
    corner.position.set(cx, cy, cz);
    root.add(corner);
  });

  // Two brass wire terminals on the cable side
  [-0.12, 0.12].forEach((tz) => {
    const term = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8), brassMat);
    term.rotation.z = Math.PI / 2;
    term.position.set(-0.4, 0.24, tz);
    root.add(term);
  });

  // Cute mini 3-stick TNT bundle resting next to the detonator box
  const miniTnt = new THREE.Group();
  miniTnt.position.set(0.54, 0.02, -0.14);
  miniTnt.rotation.y = -0.35;
  const stickGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.34, 10);
  [
    [-0.05, 0.03],
    [0.05, 0.03],
    [0, -0.05],
  ].forEach(([sx, sz]) => {
    const s = new THREE.Mesh(stickGeo, redHandleMat);
    s.position.set(sx, 0.17, sz);
    s.castShadow = true;
    miniTnt.add(s);
  });
  const tape = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.115, 0.07, 12),
    new THREE.MeshStandardMaterial({ color: '#18181B', roughness: 0.6 })
  );
  tape.position.y = 0.17;
  miniTnt.add(tape);
  root.add(miniTnt);

  // Front TNT hazard badge
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), badgeMat);
  badge.position.set(0, 0.38, 0.316);
  root.add(badge);

  // Back TNT hazard badge too so it's readable from behind
  const badgeBack = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), badgeMat);
  badgeBack.position.set(0, 0.38, -0.316);
  badgeBack.rotation.y = Math.PI;
  root.add(badgeBack);

  // Blinking red indicator lamp on corner of top trim
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.06, 10), metalMat);
  lampBase.position.set(0.26, 0.79, 0.18);
  root.add(lampBase);

  const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), lampMat);
  lampBulb.position.set(0.26, 0.86, 0.18);
  root.add(lampBulb);

  // Plunger collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.09, 12), metalMat);
  collar.position.y = 0.8;
  root.add(collar);

  // Animated T-Plunger group
  const plungerUpY = 0.42;
  const plungerDownY = 0.06;
  const plunger = new THREE.Group();
  plunger.position.y = plungerUpY;

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.72, 10), metalMat);
  shaft.position.y = 0.62;
  shaft.castShadow = true;
  plunger.add(shaft);

  const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.64, 12), redHandleMat);
  handleBar.rotation.z = Math.PI / 2;
  handleBar.position.y = 0.98;
  handleBar.castShadow = true;
  plunger.add(handleBar);

  // End caps on T-handle
  [-0.32, 0.32].forEach((hx) => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), redHandleMat);
    cap.position.set(hx, 0.98, 0);
    plunger.add(cap);
  });
  root.add(plunger);

  // Ground wire snaking from detonator box into the building (in root's local space)
  const dx = wireEndLocal[0] - localPos[0];
  const dy = wireEndLocal[1] - localPos[1];
  const dz = wireEndLocal[2] - localPos[2];
  const wireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.36, 0.2, 0),
    new THREE.Vector3(dx * 0.28, 0.06, dz * 0.18 + 0.6),
    new THREE.Vector3(dx * 0.62, Math.max(0.06, dy * 0.35), dz * 0.58 - 0.5),
    new THREE.Vector3(dx, Math.max(0.12, dy), dz),
  ]);
  const wireGeo = new THREE.TubeGeometry(wireCurve, 28, 0.042, 6, false);
  const wireMat = new THREE.MeshStandardMaterial({
    color: '#1E293B',
    roughness: 0.65,
    emissive: '#334155',
    emissiveIntensity: 0.15,
  });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  root.add(wireMesh);

  // Traveling electric spark along the wire
  const spark = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshBasicMaterial({ color: '#FEF08A' })
  );
  spark.visible = false;
  root.add(spark);

  const sparkGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 10, 8),
    new THREE.MeshBasicMaterial({
      color: '#F97316',
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  sparkGlow.visible = false;
  root.add(sparkGlow);

  // Generous invisible hitbox for effortless clicking & hovering
  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitTarget.position.set(0, 0.72, 0);
  root.add(hitTarget);

  return {
    root,
    hitTarget,
    plunger,
    lampMat,
    wireCurve,
    spark,
    sparkGlow,
    plungerUpY,
    plungerDownY,
  };
}

interface BuiltHourglass {
  root: THREE.Group;
  body: THREE.Group;
  ring: THREE.Mesh;
  hitTarget: THREE.Mesh;
}

function buildRewindHourglass(): BuiltHourglass {
  const root = new THREE.Group();
  root.visible = false;

  const body = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: '#F5C451',
    roughness: 0.25,
    metalness: 0.82,
    emissive: '#B45309',
    emissiveIntensity: 0.35,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: '#E0F2FE',
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.55,
  });
  const sandMat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });

  // Top & bottom golden plates
  const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 16), goldMat);
  topCap.position.y = 0.62;
  body.add(topCap);

  const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 16), goldMat);
  botCap.position.y = -0.62;
  body.add(botCap);

  // 3 slim golden pillars
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.24, 8), goldMat);
    pillar.position.set(Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38);
    body.add(pillar);
  }

  // Two glass cones meeting at the waist
  const topCone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.58, 14), glassMat);
  topCone.rotation.x = Math.PI;
  topCone.position.y = 0.3;
  body.add(topCone);

  const botCone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.58, 14), glassMat);
  botCone.position.y = -0.3;
  body.add(botCone);

  // Glowing cyan-gold time sand inside
  const sandCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), sandMat);
  body.add(sandCore);

  root.add(body);

  // Orbiting Doctor-Strange-style arcane ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.035, 10, 36),
    new THREE.MeshBasicMaterial({
      color: '#FCD34D',
      transparent: true,
      opacity: 0.85,
    })
  );
  ring.rotation.x = Math.PI / 2.4;
  root.add(ring);

  // Generous click hitbox
  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  root.add(hitTarget);

  return { root, body, ring, hitTarget };
}

// ============================================================================
// Runtime Types
// ============================================================================
interface FragmentPiece {
  obj: THREE.Object3D;
  origPos: THREE.Vector3;
  origQuat: THREE.Quaternion;
  origScale: THREE.Vector3;
  ruinPos: THREE.Vector3;
  ruinQuat: THREE.Quaternion;
  vel: THREE.Vector3;
  angVel: THREE.Vector3;
  floorY: number;
  heightNorm: number;
  settled: boolean;
}

interface DestructibleTargetRuntime {
  meta: DestructibleMeta;
  group: THREE.Group;
  beacon: THREE.Mesh;
  worldCenter: THREE.Vector3;
  islandRadius: number;
  pieces: FragmentPiece[];
  detonator: BuiltDetonator;
  hourglass: BuiltHourglass;
  detonatorWorldPos: THREE.Vector3;
  hourglassWorldPos: THREE.Vector3;
  state: DestructibleState;
  stateTime: number;
  blastCount: number;
}

interface BurstParticle {
  active: boolean;
  age: number;
  maxAge: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  baseScale: number;
  swayPhase: number;
  floorY: number;
}

interface ShockwaveRing {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  active: boolean;
  age: number;
  maxAge: number;
}

export interface WorldInteractiveRegistration {
  detonatorHit: THREE.Object3D;
  detonatorWorldPos: { x: number; y: number; z: number };
  hourglassHit: THREE.Object3D;
  hourglassWorldPos: { x: number; y: number; z: number };
}

export interface DestructionCallbacks {
  onStateChange?: (states: Record<string, DestructibleState>) => void;
  onExplode?: (meta: DestructibleMeta, toastZh: string, toastEn: string) => void;
  isMuted?: () => boolean;
}

const _tmpVec = new THREE.Vector3();
const _tmpQuat = new THREE.Quaternion();
const _tmpEuler = new THREE.Euler();
const _tmpMat4 = new THREE.Matrix4();
const _tmpScale = new THREE.Vector3();
const _tmpBox = new THREE.Box3();
const _tmpSize = new THREE.Vector3();
const _tmpCenter = new THREE.Vector3();
const _invGroupMat = new THREE.Matrix4();

function easeOutBack(t: number): number {
  const c1 = 1.45;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Diegetic 3D Destruction & Time-Rewind Manager.
 * Places a physical cartoon plunger detonator with ground wire at each landmark,
 * runs spark-along-wire -> dynamic flash + shockwave + physics debris + exam papers,
 * and spawns a floating golden 3D hourglass in the ruins to rewind time.
 */
export class IslandDestructionManager {
  private scene: THREE.Scene;
  private targets = new Map<PersonalMemoryKind, DestructibleTargetRuntime>();
  private callbacks: DestructionCallbacks;

  private badgeTex: THREE.CanvasTexture;
  private paperTex: THREE.CanvasTexture;

  // Camera shake & dynamic blast flash light
  private shakeIntensity = 0;
  private blastLight: THREE.PointLight;
  private blastLightAge = 99;

  // Shockwave rings pool
  private shockwaves: ShockwaveRing[] = [];

  // Instanced particle pools (3 draw calls total)
  private firePool: BurstParticle[] = [];
  private smokePool: BurstParticle[] = [];
  private paperPool: BurstParticle[] = [];
  private fireMesh: THREE.InstancedMesh;
  private smokeMesh: THREE.InstancedMesh;
  private paperMesh: THREE.InstancedMesh;

  private readonly MAX_FIRE = 96;
  private readonly MAX_SMOKE = 120;
  private readonly MAX_PAPERS = 180;

  constructor(scene: THREE.Scene, callbacks: DestructionCallbacks = {}) {
    this.scene = scene;
    this.callbacks = callbacks;

    this.badgeTex = createDetonatorBadgeTexture();
    this.paperTex = createExamPaperTexture();

    // Dynamic warm explosion PointLight (lights up flying bricks & grass!)
    this.blastLight = new THREE.PointLight('#FF9D2E', 0, 30, 1.8);
    this.scene.add(this.blastLight);

    // Expanding shockwave rings pool
    const ringGeo = new THREE.RingGeometry(0.75, 1.0, 36);
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: '#FEF3C7',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      this.scene.add(mesh);
      this.shockwaves.push({ mesh, mat, active: false, age: 0, maxAge: 0.58 });
    }

    // 1. Fireballs pool
    const fireGeo = new THREE.IcosahedronGeometry(0.46, 1);
    const fireMat = new THREE.MeshBasicMaterial({
      color: '#FF7A1A',
      transparent: true,
      opacity: 0.92,
    });
    this.fireMesh = new THREE.InstancedMesh(fireGeo, fireMat, this.MAX_FIRE);
    this.fireMesh.frustumCulled = false;
    this.fireMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.fireMesh);

    // 2. Cartoon smoke puffs pool
    const smokeGeo = new THREE.DodecahedronGeometry(0.58, 1);
    const smokeMat = new THREE.MeshStandardMaterial({
      color: '#E7E5E4',
      roughness: 0.95,
      metalness: 0,
      transparent: true,
      opacity: 0.84,
    });
    this.smokeMesh = new THREE.InstancedMesh(smokeGeo, smokeMat, this.MAX_SMOKE);
    this.smokeMesh.frustumCulled = false;
    this.smokeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.smokeMesh);

    // 3. Textured fluttering exam papers pool
    const paperGeo = new THREE.BoxGeometry(0.38, 0.012, 0.5);
    const paperMat = new THREE.MeshStandardMaterial({
      map: this.paperTex,
      roughness: 0.72,
      emissive: '#FEF3C7',
      emissiveIntensity: 0.14,
    });
    this.paperMesh = new THREE.InstancedMesh(paperGeo, paperMat, this.MAX_PAPERS);
    this.paperMesh.frustumCulled = false;
    this.paperMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.paperMesh);

    this.initPool(this.firePool, this.MAX_FIRE, this.fireMesh);
    this.initPool(this.smokePool, this.MAX_SMOKE, this.smokeMesh);
    this.initPool(this.paperPool, this.MAX_PAPERS, this.paperMesh);
  }

  private initPool(pool: BurstParticle[], count: number, mesh: THREE.InstancedMesh) {
    _tmpMat4.makeScale(0, 0, 0);
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
      mesh.setMatrixAt(i, _tmpMat4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  public registerTarget(
    id: PersonalMemoryKind,
    group: THREE.Group,
    beacon: THREE.Mesh,
    worldCenter: { x: number; y: number; z: number },
    islandRadius: number
  ): WorldInteractiveRegistration | null {
    const meta = DESTRUCTIBLE_TARGETS.find((m) => m.id === id);
    if (!meta) return null;

    group.updateWorldMatrix(true, true);
    _invGroupMat.copy(group.matrixWorld).invert();

    const pieces: FragmentPiece[] = [];
    const candidates: THREE.Object3D[] = [];
    for (const child of group.children) {
      if (child === beacon || this.containsObject(child, beacon)) continue;
      if (child instanceof THREE.Group && child.children.length >= 6) {
        for (const grand of child.children) {
          if (grand === beacon || this.containsObject(grand, beacon)) continue;
          candidates.push(grand);
        }
      } else {
        candidates.push(child);
      }
    }

    let maxY = 1;
    const validCandidates: { obj: THREE.Object3D; localCenterY: number }[] = [];

    for (const obj of candidates) {
      if (obj instanceof THREE.Light) continue;
      _tmpBox.setFromObject(obj);
      if (_tmpBox.isEmpty()) continue;
      _tmpBox.applyMatrix4(_invGroupMat);
      _tmpBox.getSize(_tmpSize);
      _tmpBox.getCenter(_tmpCenter);

      // Keep wide ground slabs / plaza surfaces / hillside terraces anchored
      const isGroundSlab =
        (_tmpSize.x > 6.5 && _tmpSize.z > 5.0 && _tmpCenter.y < 1.6) ||
        (_tmpSize.y < 0.16 && _tmpSize.x > 4.5 && _tmpCenter.y < 0.45);
      if (isGroundSlab) continue;

      if (_tmpCenter.y > maxY) maxY = _tmpCenter.y;
      validCandidates.push({ obj, localCenterY: Math.max(0, _tmpCenter.y) });
    }

    for (const { obj, localCenterY } of validCandidates) {
      const parentY = obj.parent && obj.parent !== group ? obj.parent.position.y : 0;
      pieces.push({
        obj,
        origPos: obj.position.clone(),
        origQuat: obj.quaternion.clone(),
        origScale: obj.scale.clone(),
        ruinPos: obj.position.clone(),
        ruinQuat: obj.quaternion.clone(),
        vel: new THREE.Vector3(),
        angVel: new THREE.Vector3(),
        floorY: 0.25 - parentY,
        heightNorm: Math.min(1, localCenterY / Math.max(1.5, maxY)),
        settled: false,
      });
    }

    // Mount diegetic 3D Plunger Detonator & Golden Time-Rewind Hourglass inside the landmark group
    const detonator = buildPlungerDetonator(
      meta.detonatorLocalPos,
      meta.wireEndLocalPos,
      this.badgeTex
    );
    group.add(detonator.root);

    const hourglass = buildRewindHourglass();
    hourglass.root.position.set(0, 2.2, 0.8);
    group.add(hourglass.root);

    group.updateWorldMatrix(true, true);
    const detonatorWorldPos = new THREE.Vector3();
    detonator.hitTarget.getWorldPosition(detonatorWorldPos);
    const hourglassWorldPos = new THREE.Vector3();
    hourglass.hitTarget.getWorldPosition(hourglassWorldPos);

    this.targets.set(id, {
      meta,
      group,
      beacon,
      worldCenter: new THREE.Vector3(worldCenter.x, worldCenter.y, worldCenter.z),
      islandRadius,
      pieces,
      detonator,
      hourglass,
      detonatorWorldPos,
      hourglassWorldPos,
      state: 'intact',
      stateTime: 0,
      blastCount: 0,
    });

    this.emitStates();

    return {
      detonatorHit: detonator.hitTarget,
      detonatorWorldPos: {
        x: detonatorWorldPos.x,
        y: detonatorWorldPos.y,
        z: detonatorWorldPos.z,
      },
      hourglassHit: hourglass.hitTarget,
      hourglassWorldPos: {
        x: hourglassWorldPos.x,
        y: hourglassWorldPos.y,
        z: hourglassWorldPos.z,
      },
    };
  }

  private containsObject(root: THREE.Object3D, target: THREE.Object3D): boolean {
    let found = false;
    root.traverse((o) => {
      if (o === target) found = true;
    });
    return found;
  }

  public getState(id: PersonalMemoryKind): DestructibleState {
    return this.targets.get(id)?.state ?? 'intact';
  }

  public getAllStates(): Record<string, DestructibleState> {
    const map: Record<string, DestructibleState> = {};
    this.targets.forEach((t, id) => {
      map[id] = t.state;
    });
    return map;
  }

  public getProximityPrompt(playerPos: THREE.Vector3): {
    kind: 'detonator' | 'hourglass';
    id: PersonalMemoryKind;
    meta: DestructibleMeta;
    dist: number;
  } | null {
    let best: {
      kind: 'detonator' | 'hourglass';
      id: PersonalMemoryKind;
      meta: DestructibleMeta;
      dist: number;
    } | null = null;

    this.targets.forEach((t, id) => {
      if (t.state === 'intact') {
        const d = Math.hypot(
          t.detonatorWorldPos.x - playerPos.x,
          t.detonatorWorldPos.z - playerPos.z
        );
        if (d < 3.4 && (!best || d < best.dist)) {
          best = { kind: 'detonator', id, meta: t.meta, dist: d };
        }
      } else if (t.state === 'exploded') {
        const d = Math.hypot(
          t.hourglassWorldPos.x - playerPos.x,
          t.hourglassWorldPos.z - playerPos.z
        );
        if (d < 4.5 && (!best || d < best.dist)) {
          best = { kind: 'hourglass', id, meta: t.meta, dist: d };
        }
      }
    });

    return best;
  }

  private emitStates() {
    this.callbacks.onStateChange?.(this.getAllStates());
  }

  /** Press the 3D plunger detonator -> electric spark races along wire -> BOOM! */
  public pressDetonator(id: PersonalMemoryKind): boolean {
    const target = this.targets.get(id);
    if (!target || target.state !== 'intact') return false;

    const muted = this.callbacks.isMuted?.() ?? false;
    playPlungerClunkSound(muted);
    playFuseSizzleSound(0.92, muted);

    target.state = 'wiring';
    target.stateTime = 0;
    target.detonator.spark.visible = true;
    target.detonator.sparkGlow.visible = true;
    this.emitStates();
    return true;
  }

  /** Activate the floating golden hourglass -> Doctor-Strange time-rewind! */
  public activateHourglass(id: PersonalMemoryKind): boolean {
    const target = this.targets.get(id);
    if (!target || target.state !== 'exploded') return false;

    const muted = this.callbacks.isMuted?.() ?? false;
    playRewindSound(muted);

    for (const p of target.pieces) {
      p.ruinPos.copy(p.obj.position);
      p.ruinQuat.copy(p.obj.quaternion);
    }
    target.state = 'rebuilding';
    target.stateTime = 0;
    this.emitStates();
    return true;
  }

  /** Pick an intact landmark for the UFO tractor beam and lift its pieces into zero-G! */
  public getFirstIntactTarget(preferredOrder: PersonalMemoryKind[]): {
    id: PersonalMemoryKind;
    meta: DestructibleMeta;
    worldCenter: THREE.Vector3;
  } | null {
    for (const id of preferredOrder) {
      const t = this.targets.get(id);
      if (t && t.state === 'intact') {
        return { id, meta: t.meta, worldCenter: t.worldCenter.clone() };
      }
    }
    return null;
  }

  public startZeroGBeam(id: PersonalMemoryKind): boolean {
    const target = this.targets.get(id);
    if (!target || target.state !== 'intact') return false;
    target.state = 'abducted';
    target.stateTime = 0;
    for (const p of target.pieces) {
      p.angVel.set(
        (Math.random() - 0.5) * 2.2,
        (Math.random() - 0.5) * 2.6,
        (Math.random() - 0.5) * 2.2
      );
      p.vel.set(0, 1.8 + Math.random() * 2.4, 0);
    }
    this.emitStates();
    return true;
  }

  public releaseZeroGBeam(id: PersonalMemoryKind): boolean {
    const target = this.targets.get(id);
    if (!target || target.state !== 'abducted') return false;
    for (const p of target.pieces) {
      p.ruinPos.copy(p.obj.position);
      p.ruinQuat.copy(p.obj.quaternion);
    }
    target.state = 'rebuilding';
    target.stateTime = 0;
    this.emitStates();
    return true;
  }

  private detonate(target: DestructibleTargetRuntime) {
    const muted = this.callbacks.isMuted?.() ?? false;
    playCartoonExplosionSound(muted);

    target.detonator.spark.visible = false;
    target.detonator.sparkGlow.visible = false;
    target.detonator.lampMat.emissiveIntensity = 0.05;
    target.detonator.lampMat.color.set('#57534E');

    target.state = 'exploded';
    target.stateTime = 0;
    target.blastCount += 1;

    // Show the floating golden Time-Rewind Hourglass in the ruins
    target.hourglass.root.visible = true;
    target.hourglass.root.scale.setScalar(0.01);

    // Camera shake + dynamic warm flash light + shockwave ring
    this.shakeIntensity = Math.min(1.15, this.shakeIntensity + 0.78);
    this.blastLight.position.set(
      target.worldCenter.x,
      target.worldCenter.y + 3.2,
      target.worldCenter.z
    );
    this.blastLight.intensity = 22;
    this.blastLightAge = 0;

    const ring = this.shockwaves.find((r) => !r.active) ?? this.shockwaves[0];
    ring.active = true;
    ring.age = 0;
    ring.mesh.position.set(target.worldCenter.x, target.worldCenter.y + 0.45, target.worldCenter.z);
    ring.mesh.scale.setScalar(0.6);
    ring.mesh.visible = true;
    ring.mat.opacity = 0.9;

    // Launch every architectural fragment outward & upward
    for (const p of target.pieces) {
      p.settled = false;
      p.obj.position.copy(p.origPos);
      p.obj.quaternion.copy(p.origQuat);

      const rx = p.origPos.x + (Math.random() - 0.5) * 1.2;
      const rz = p.origPos.z + (Math.random() - 0.5) * 1.2;
      const dist = Math.hypot(rx, rz) + 0.35;
      const radialSpeed = 4.5 + Math.random() * 7.8 + p.heightNorm * 3.4;

      p.vel.set(
        (rx / dist) * radialSpeed + (Math.random() - 0.5) * 3.0,
        6.8 + Math.random() * 8.6 + p.heightNorm * 4.5,
        (rz / dist) * radialSpeed + (Math.random() - 0.5) * 3.0
      );
      p.angVel.set(
        (Math.random() - 0.5) * 9.8,
        (Math.random() - 0.5) * 9.8,
        (Math.random() - 0.5) * 9.8
      );
    }

    this.spawnBurst(target.worldCenter);

    const toastIdx = (target.blastCount - 1) % target.meta.toastsZh.length;
    this.callbacks.onExplode?.(
      target.meta,
      target.meta.toastsZh[toastIdx],
      target.meta.toastsEn[toastIdx]
    );
    this.emitStates();
  }

  private spawnBurst(center: THREE.Vector3) {
    const originY = center.y + 1.4;

    // 1. Fireballs
    let spawned = 0;
    for (const p of this.firePool) {
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      p.maxAge = 0.45 + Math.random() * 0.45;
      p.pos.set(
        center.x + (Math.random() - 0.5) * 2.2,
        originY + Math.random() * 1.4,
        center.z + (Math.random() - 0.5) * 2.2
      );
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.6 + Math.random() * 6.8;
      p.vel.set(Math.cos(ang) * spd, 2.5 + Math.random() * 6.2, Math.sin(ang) * spd);
      p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      p.rotVel.set(4, 4, 4);
      p.baseScale = 0.95 + Math.random() * 1.45;
      p.floorY = center.y;
      if (++spawned >= 38) break;
    }

    // 2. Cartoon smoke mushroom cloud
    spawned = 0;
    for (const p of this.smokePool) {
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      p.maxAge = 2.0 + Math.random() * 1.6;
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * 2.6;
      p.pos.set(
        center.x + Math.cos(ang) * rad,
        originY + Math.random() * 1.6,
        center.z + Math.sin(ang) * rad
      );
      const spd = 1.2 + Math.random() * 3.5;
      p.vel.set(Math.cos(ang) * spd, 3.3 + Math.random() * 4.5, Math.sin(ang) * spd);
      p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      p.rotVel.set(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8
      );
      p.baseScale = 0.85 + Math.random() * 1.55;
      p.floorY = center.y;
      if (++spawned >= 48) break;
    }

    // 3. Fluttering textured exam papers!
    spawned = 0;
    for (const p of this.paperPool) {
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      p.maxAge = 4.4 + Math.random() * 2.8;
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.2 + Math.random() * 7.0;
      p.pos.set(
        center.x + (Math.random() - 0.5) * 3.5,
        originY + 0.8 + Math.random() * 2.6,
        center.z + (Math.random() - 0.5) * 3.5
      );
      p.vel.set(Math.cos(ang) * spd, 7.8 + Math.random() * 6.5, Math.sin(ang) * spd);
      p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      p.rotVel.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 8
      );
      p.baseScale = 0.9 + Math.random() * 0.55;
      p.swayPhase = Math.random() * Math.PI * 2;
      p.floorY = center.y + 0.16;
      if (++spawned >= 80) break;
    }
  }

  public update(dt: number, elapsed: number, outShakeOffset: THREE.Vector3) {
    const safeDt = Math.min(dt, 0.05);

    this.targets.forEach((target) => {
      // Idle gentle blink on armed detonators so curious explorers notice them naturally
      if (target.state === 'intact') {
        target.detonator.lampMat.emissiveIntensity = 0.45 + Math.sin(elapsed * 3.2) * 0.4;
        target.detonator.plunger.position.y +=
          (target.detonator.plungerUpY - target.detonator.plunger.position.y) * Math.min(1, safeDt * 10);
        return;
      }

      target.stateTime += safeDt;

      // 1. Plunger slams down + electric spark races along wire into the building
      if (target.state === 'wiring') {
        const wireDur = 0.92;
        const u = Math.min(1, target.stateTime / wireDur);

        // Slam plunger down in first 0.14s
        const slamU = Math.min(1, target.stateTime / 0.14);
        target.detonator.plunger.position.y =
          target.detonator.plungerUpY +
          (target.detonator.plungerDownY - target.detonator.plungerUpY) * slamU;

        // Rapid amber warning flash on lamp
        target.detonator.lampMat.color.set('#FACC15');
        target.detonator.lampMat.emissiveIntensity = 1.4 + Math.sin(elapsed * 40) * 0.6;

        // Race spark along the CatmullRomCurve3 wire
        target.detonator.wireCurve.getPointAt(u, _tmpVec);
        target.detonator.spark.position.copy(_tmpVec);
        target.detonator.spark.rotation.y += safeDt * 18;
        target.detonator.spark.scale.setScalar(0.9 + Math.sin(elapsed * 50) * 0.35);
        target.detonator.sparkGlow.position.copy(_tmpVec);
        target.detonator.sparkGlow.scale.setScalar(0.85 + Math.cos(elapsed * 42) * 0.3);

        // Building rumbles as the spark nears the entrance!
        if (u > 0.55) {
          const jitter = ((u - 0.55) / 0.45) * 0.13;
          for (const p of target.pieces) {
            p.obj.position.set(
              p.origPos.x + (Math.random() - 0.5) * jitter,
              p.origPos.y + (Math.random() - 0.5) * jitter * 0.5,
              p.origPos.z + (Math.random() - 0.5) * jitter
            );
          }
        }

        if (u >= 1) {
          this.detonate(target);
        }
        return;
      }

      // 2. Exploded ruins + rising golden Time-Rewind Hourglass
      if (target.state === 'exploded') {
        // Animate the floating golden hourglass rising out of the ruins
        const hgAppear = Math.min(1, Math.max(0, (target.stateTime - 0.65) / 0.55));
        const hgScale = hgAppear > 0 ? easeOutBack(hgAppear) : 0.001;
        target.hourglass.root.scale.setScalar(hgScale);
        target.hourglass.root.position.y = 2.2 + Math.sin(elapsed * 2.4) * 0.22;
        target.hourglass.body.rotation.y = elapsed * 1.1;
        target.hourglass.ring.rotation.z = elapsed * 1.6;

        const gravity = 21.5;
        for (const p of target.pieces) {
          if (p.settled) continue;

          p.vel.y -= gravity * safeDt;
          p.obj.position.addScaledVector(p.vel, safeDt);

          _tmpEuler.set(p.angVel.x * safeDt, p.angVel.y * safeDt, p.angVel.z * safeDt);
          _tmpQuat.setFromEuler(_tmpEuler);
          p.obj.quaternion.premultiply(_tmpQuat);

          const radialDist = Math.hypot(p.obj.position.x, p.obj.position.z);
          const isOverIsland = radialDist < target.islandRadius * 0.92;
          const floor = isOverIsland ? p.floorY : p.floorY - 2.6;

          if (p.obj.position.y <= floor) {
            p.obj.position.y = floor;
            if (isOverIsland) {
              if (Math.abs(p.vel.y) > 1.2) {
                p.vel.y *= -0.42;
                p.vel.x *= 0.72;
                p.vel.z *= 0.72;
                p.angVel.multiplyScalar(0.65);
              } else {
                p.vel.y = 0;
                p.vel.x *= 0.65;
                p.vel.z *= 0.65;
                p.angVel.multiplyScalar(0.55);
                if (p.vel.lengthSq() < 0.04 && p.angVel.lengthSq() < 0.08) {
                  p.settled = true;
                }
              }
            } else {
              p.vel.multiplyScalar(0.5);
              p.angVel.multiplyScalar(0.5);
              if (p.vel.lengthSq() < 0.03) p.settled = true;
            }
          }
        }
        return;
      }

      // 3. Zero-G UFO Tractor Beam levitation!
      if (target.state === 'abducted') {
        const liftU = Math.min(1, target.stateTime / 1.4);
        for (const p of target.pieces) {
          const targetLift = 2.0 + p.heightNorm * 4.2;
          const hoverY =
            p.origPos.y + targetLift * liftU + Math.sin(elapsed * 2.6 + p.heightNorm * 8) * 0.35;
          // Gently pull slightly inward & swirl around center
          const swirlAngle = safeDt * (0.9 + p.heightNorm * 0.7);
          const cos = Math.cos(swirlAngle);
          const sin = Math.sin(swirlAngle);
          const curX = p.obj.position.x * 0.996;
          const curZ = p.obj.position.z * 0.996;
          p.obj.position.set(
            curX * cos - curZ * sin,
            p.obj.position.y + (hoverY - p.obj.position.y) * Math.min(1, safeDt * 4.5),
            curX * sin + curZ * cos
          );
          _tmpEuler.set(p.angVel.x * safeDt, p.angVel.y * safeDt, p.angVel.z * safeDt);
          _tmpQuat.setFromEuler(_tmpEuler);
          p.obj.quaternion.premultiply(_tmpQuat);
        }
        return;
      }

      // 4. Doctor-Strange Time-Rewind reconstruction
      if (target.state === 'rebuilding') {
        const rebuildDur = 1.35;
        const globalU = Math.min(1, target.stateTime / rebuildDur);

        // Spin hourglass backward rapidly and shrink away
        target.hourglass.body.rotation.y -= safeDt * 12;
        target.hourglass.ring.rotation.z -= safeDt * 10;
        target.hourglass.root.scale.setScalar(Math.max(0.001, 1 - globalU));

        for (const p of target.pieces) {
          const delay = p.heightNorm * 0.25;
          const localU = Math.max(0, Math.min(1, (globalU - delay) / (1 - delay)));
          const eased = easeOutBack(localU);

          p.obj.position.lerpVectors(p.ruinPos, p.origPos, eased);
          p.obj.quaternion.slerpQuaternions(p.ruinQuat, p.origQuat, Math.min(1, localU * 1.15));
        }

        if (globalU >= 1) {
          for (const p of target.pieces) {
            p.obj.position.copy(p.origPos);
            p.obj.quaternion.copy(p.origQuat);
            p.obj.scale.copy(p.origScale);
          }
          target.hourglass.root.visible = false;
          target.detonator.lampMat.color.set('#EF4444');
          target.state = 'intact';
          target.stateTime = 0;
          this.emitStates();
        }
      }
    });

    // Dynamic blast flash light decay
    if (this.blastLightAge < 0.55) {
      this.blastLightAge += safeDt;
      const t = Math.min(1, this.blastLightAge / 0.55);
      this.blastLight.intensity = 22 * Math.pow(1 - t, 2.4);
    } else if (this.blastLight.intensity > 0) {
      this.blastLight.intensity = 0;
    }

    // Shockwave rings
    for (const r of this.shockwaves) {
      if (!r.active) continue;
      r.age += safeDt;
      if (r.age >= r.maxAge) {
        r.active = false;
        r.mesh.visible = false;
        continue;
      }
      const u = r.age / r.maxAge;
      const eased = 1 - Math.pow(1 - u, 3);
      r.mesh.scale.setScalar(0.6 + eased * 11.5);
      r.mat.opacity = 0.85 * (1 - u);
    }

    // Particle pools
    this.updateFireParticles(safeDt);
    this.updateSmokeParticles(safeDt);
    this.updatePaperParticles(safeDt, elapsed);

    // Camera shake
    if (this.shakeIntensity > 0.005) {
      outShakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity * 0.75,
        (Math.random() - 0.5) * this.shakeIntensity
      );
      this.shakeIntensity *= Math.pow(0.016, safeDt);
    } else {
      this.shakeIntensity = 0;
      outShakeOffset.set(0, 0, 0);
    }
  }

  private updateFireParticles(dt: number) {
    let dirty = false;
    for (let i = 0; i < this.firePool.length; i++) {
      const p = this.firePool[i];
      if (!p.active) continue;
      dirty = true;
      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        _tmpMat4.makeScale(0, 0, 0);
        this.fireMesh.setMatrixAt(i, _tmpMat4);
        continue;
      }
      const u = p.age / p.maxAge;
      p.vel.multiplyScalar(Math.pow(0.25, dt));
      p.vel.y += 3.2 * dt;
      p.pos.addScaledVector(p.vel, dt);
      const s = p.baseScale * (u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75);
      _tmpScale.setScalar(Math.max(0.001, s));
      _tmpQuat.setFromEuler(p.rot);
      _tmpMat4.compose(p.pos, _tmpQuat, _tmpScale);
      this.fireMesh.setMatrixAt(i, _tmpMat4);
    }
    if (dirty) this.fireMesh.instanceMatrix.needsUpdate = true;
  }

  private updateSmokeParticles(dt: number) {
    let dirty = false;
    for (let i = 0; i < this.smokePool.length; i++) {
      const p = this.smokePool[i];
      if (!p.active) continue;
      dirty = true;
      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        _tmpMat4.makeScale(0, 0, 0);
        this.smokeMesh.setMatrixAt(i, _tmpMat4);
        continue;
      }
      const u = p.age / p.maxAge;
      p.vel.x *= Math.pow(0.45, dt);
      p.vel.z *= Math.pow(0.45, dt);
      p.vel.y = Math.max(0.6, p.vel.y * Math.pow(0.55, dt));
      p.pos.addScaledVector(p.vel, dt);
      p.rot.x += p.rotVel.x * dt;
      p.rot.y += p.rotVel.y * dt;

      const grow = Math.min(1, u * 4.5);
      const fade = u > 0.55 ? 1 - (u - 0.55) / 0.45 : 1;
      const s = p.baseScale * (0.4 + grow * 1.45) * fade;
      _tmpScale.setScalar(Math.max(0.001, s));
      _tmpQuat.setFromEuler(p.rot);
      _tmpMat4.compose(p.pos, _tmpQuat, _tmpScale);
      this.smokeMesh.setMatrixAt(i, _tmpMat4);
    }
    if (dirty) this.smokeMesh.instanceMatrix.needsUpdate = true;
  }

  private updatePaperParticles(dt: number, elapsed: number) {
    let dirty = false;
    for (let i = 0; i < this.paperPool.length; i++) {
      const p = this.paperPool[i];
      if (!p.active) continue;
      dirty = true;
      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        _tmpMat4.makeScale(0, 0, 0);
        this.paperMesh.setMatrixAt(i, _tmpMat4);
        continue;
      }
      const u = p.age / p.maxAge;

      p.vel.x *= Math.pow(0.32, dt);
      p.vel.z *= Math.pow(0.32, dt);
      p.vel.y -= 9.5 * dt;
      if (p.vel.y < -1.35) p.vel.y = -1.35;

      p.pos.x += (p.vel.x + Math.sin(elapsed * 3.8 + p.swayPhase) * 1.1) * dt;
      p.pos.y += p.vel.y * dt;
      p.pos.z += (p.vel.z + Math.cos(elapsed * 3.2 + p.swayPhase) * 1.1) * dt;

      if (p.pos.y <= p.floorY) {
        p.pos.y = p.floorY;
        p.vel.set(0, 0, 0);
        p.rot.x = 0;
        p.rot.z = 0;
      } else {
        p.rot.x += p.rotVel.x * dt;
        p.rot.y += p.rotVel.y * dt;
        p.rot.z += p.rotVel.z * dt;
      }

      const fade = u > 0.8 ? 1 - (u - 0.8) / 0.2 : 1;
      _tmpScale.setScalar(Math.max(0.001, p.baseScale * fade));
      _tmpQuat.setFromEuler(p.rot);
      _tmpMat4.compose(p.pos, _tmpQuat, _tmpScale);
      this.paperMesh.setMatrixAt(i, _tmpMat4);
    }
    if (dirty) this.paperMesh.instanceMatrix.needsUpdate = true;
  }

  public dispose() {
    this.targets.forEach((t) => {
      t.group.remove(t.detonator.root);
      t.group.remove(t.hourglass.root);
    });
    this.targets.clear();
    this.scene.remove(this.blastLight);
    this.shockwaves.forEach((r) => {
      this.scene.remove(r.mesh);
      r.mat.dispose();
    });
    if (this.shockwaves[0]) this.shockwaves[0].mesh.geometry.dispose();
    this.scene.remove(this.fireMesh, this.smokeMesh, this.paperMesh);
    this.fireMesh.geometry.dispose();
    (this.fireMesh.material as THREE.Material).dispose();
    this.smokeMesh.geometry.dispose();
    (this.smokeMesh.material as THREE.Material).dispose();
    this.paperMesh.geometry.dispose();
    (this.paperMesh.material as THREE.Material).dispose();
    this.badgeTex.dispose();
    this.paperTex.dispose();
  }
}

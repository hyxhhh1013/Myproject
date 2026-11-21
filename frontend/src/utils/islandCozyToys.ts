import * as THREE from 'three';

export type CozyToyKind = 'gramophone-play' | 'campfire-logs';

export interface CozyToyRegistration {
  kind: CozyToyKind;
  hitTarget: THREE.Object3D;
  worldPos: { x: number; y: number; z: number };
}

export interface CozyToysCallbacks {
  onToast?: (titleZh: string, titleEn: string, textZh: string, textEn: string, icon?: string) => void;
  isMuted?: () => boolean;
}

// ============================================================================
// Procedural Web Audio (Warm Lo-Fi Jazz Chords + Campfire Wood Crackle)
// ============================================================================
let sharedCozyAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!sharedCozyAudioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedCozyAudioCtx = new AudioCtx();
    }
    if (sharedCozyAudioCtx.state === 'suspended') {
      sharedCozyAudioCtx.resume().catch(() => {});
    }
    return sharedCozyAudioCtx;
  } catch {
    return null;
  }
}

/** Play one warm Lo-Fi electric-piano chord (Fmaj7 -> Em7 -> Dm7 -> Cmaj7) */
function playLofiChord(chordIdx: number, muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 196.0, 246.94, 329.63], // Cmaj7
    ];
    const notes = chords[chordIdx % chords.length];
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, now);
    filter.connect(ctx.destination);

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.045);
      // Slight lo-fi detune warmth
      osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * 4, now);

      const t = now + i * 0.045;
      gain.gain.setValueAtTime(0.0005, t);
      gain.gain.linearRampToValueAtTime(0.032, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 2.35);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(t);
      osc.stop(t + 2.4);
    });
  } catch {
    // Ignore
  }
}

/** Campfire firewood whoosh + cozy wood crackle burst */
function playCampfireCrackleSound(muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    // Warm fire whoosh
    const dur = 0.85;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = Math.sin((i / data.length) * Math.PI);
      const pop = Math.random() > 0.96 ? 1.8 : 0.4;
      data[i] = (Math.random() * 2 - 1) * env * pop;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(420, now + dur);
    filter.Q.value = 1.1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur + 0.04);
  } catch {
    // Ignore
  }
}

// ============================================================================
// Procedural Textures (Golden Musical Note Sprite & Split Wood End-Ring)
// ============================================================================
function createMusicNoteTexture(symbol: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 128, 128);
    // Soft golden aura
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 56);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.55)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 74px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 64, 66);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================================
// Detailed 3D Firewood Stack + Chopping Stump & Camping Hatchet
// ============================================================================
function buildFirewoodPile(pos: THREE.Vector3): {
  root: THREE.Group;
  hitTarget: THREE.Mesh;
} {
  const root = new THREE.Group();
  root.position.copy(pos);

  const barkMat = new THREE.MeshStandardMaterial({ color: '#5C3A21', roughness: 0.92 });
  const splitWoodMat = new THREE.MeshStandardMaterial({ color: '#E2C290', roughness: 0.78 });
  const strapMat = new THREE.MeshStandardMaterial({ color: '#7F1D1D', roughness: 0.7 });
  const steelMat = new THREE.MeshStandardMaterial({
    color: '#CBD5E1',
    roughness: 0.25,
    metalness: 0.82,
  });

  // Stacked firewood logs (3-2-1 pyramid with lighter wood ends)
  const logGeo = new THREE.CylinderGeometry(0.11, 0.115, 0.88, 10);
  logGeo.rotateZ(Math.PI / 2);
  const endGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.9, 10);
  endGeo.rotateZ(Math.PI / 2);

  const stackCoords: [number, number, number][] = [
    [0, 0.11, -0.22],
    [0, 0.11, 0.0],
    [0, 0.11, 0.22],
    [0, 0.29, -0.11],
    [0, 0.29, 0.11],
    [0, 0.47, 0.0],
  ];
  stackCoords.forEach(([lx, ly, lz], i) => {
    const log = new THREE.Mesh(logGeo, barkMat);
    log.position.set(lx, ly, lz);
    log.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.05;
    log.castShadow = true;
    log.receiveShadow = true;
    root.add(log);

    const endCore = new THREE.Mesh(endGeo, splitWoodMat);
    endCore.position.copy(log.position);
    endCore.rotation.copy(log.rotation);
    root.add(endCore);
  });

  // Leather strap binding the logs
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 18), strapMat);
  strap.rotation.y = Math.PI / 2;
  strap.position.set(0, 0.25, 0);
  root.add(strap);

  // Small chopping stump beside the woodpile with a camping hatchet embedded in top!
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.34, 12), barkMat);
  stump.position.set(0.72, 0.17, 0.18);
  stump.castShadow = true;
  root.add(stump);

  const stumpTop = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 12), splitWoodMat);
  stumpTop.position.set(0.72, 0.345, 0.18);
  root.add(stumpTop);

  // Hatchet stuck at a jaunty angle
  const hatchet = new THREE.Group();
  hatchet.position.set(0.72, 0.38, 0.18);
  hatchet.rotation.z = -0.35;
  hatchet.rotation.y = 0.4;
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.22), steelMat);
  hatchet.add(blade);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.56, 8), splitWoodMat);
  handle.position.set(0, 0.28, -0.06);
  handle.rotation.x = 0.18;
  hatchet.add(handle);
  root.add(hatchet);

  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitTarget.position.set(0.25, 0.45, 0.05);
  root.add(hitTarget);

  return { root, hitTarget };
}

// ============================================================================
// Runtime Manager
// ============================================================================
interface NoteSpriteRuntime {
  sprite: THREE.Sprite;
  active: boolean;
  age: number;
  maxAge: number;
  startPos: THREE.Vector3;
  driftX: number;
  driftZ: number;
  phase: number;
}

interface EmberParticle {
  active: boolean;
  age: number;
  maxAge: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  baseScale: number;
  phase: number;
}

const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();

export class IslandCozyToysManager {
  private scene: THREE.Scene;
  private callbacks: CozyToysCallbacks;

  private mountedRoots: THREE.Object3D[] = [];

  // 1. Gramophone runtime
  private gramPlaying = false;
  private gramChordTimer = 0;
  private gramChordIdx = 0;
  private gramNoteSpawnTimer = 0;
  private gramHornWorldPos = new THREE.Vector3();
  private gramWorldPos = new THREE.Vector3();
  private gramMounted = false;
  private noteTextures: THREE.CanvasTexture[] = [];
  private noteSprites: NoteSpriteRuntime[] = [];

  // 2. Campfire firewood runtime
  private woodpilePos = new THREE.Vector3(1.95, 2.75, -16.6);
  private campfirePos = new THREE.Vector3(0, 2.95, -17.2);
  private flyingLog: THREE.Mesh;
  private flyingLogActive = false;
  private flyingLogTime = 0;
  private fireBoostTime = 0;

  private embers: EmberParticle[] = [];
  private emberMesh: THREE.InstancedMesh;
  private readonly MAX_EMBERS = 90;

  constructor(scene: THREE.Scene, callbacks: CozyToysCallbacks = {}) {
    this.scene = scene;
    this.callbacks = callbacks;

    // Musical note sprites pool (12)
    this.noteTextures = ['♪', '♫', '♩'].map((sym) => createMusicNoteTexture(sym));
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.noteTextures[i % this.noteTextures.length],
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      this.scene.add(sprite);
      this.noteSprites.push({
        sprite,
        active: false,
        age: 0,
        maxAge: 2.2,
        startPos: new THREE.Vector3(),
        driftX: 0,
        driftZ: 0,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Flying log mesh (arcing from woodpile into campfire)
    this.flyingLog = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.095, 0.72, 10),
      new THREE.MeshStandardMaterial({ color: '#6E4223', roughness: 0.88 })
    );
    this.flyingLog.visible = false;
    this.scene.add(this.flyingLog);

    // Rising campfire embers instanced pool
    const emberGeo = new THREE.OctahedronGeometry(0.075, 0);
    const emberMat = new THREE.MeshBasicMaterial({ color: '#FF9E2C' });
    this.emberMesh = new THREE.InstancedMesh(emberGeo, emberMat, this.MAX_EMBERS);
    this.emberMesh.frustumCulled = false;
    this.emberMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    _m4.makeScale(0, 0, 0);
    for (let i = 0; i < this.MAX_EMBERS; i++) {
      this.embers.push({
        active: false,
        age: 0,
        maxAge: 1,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        baseScale: 1,
        phase: Math.random() * Math.PI * 2,
      });
      this.emberMesh.setMatrixAt(i, _m4);
    }
    this.emberMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.emberMesh);
  }

  /** Attach click hitbox onto the real vintage brass gramophone inside gramophone-lounge */
  public attachGramophone(loungeGroup: THREE.Group): CozyToyRegistration {
    const hitTarget = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 10, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    // Exact local position of the gramophone cabinet + horn in buildGramophoneLoungeMemory
    hitTarget.position.set(0.88, 1.55, -1.88);
    loungeGroup.add(hitTarget);
    this.mountedRoots.push(hitTarget);

    const hornMarker = new THREE.Object3D();
    hornMarker.position.set(0.95, 2.25, -1.85);
    loungeGroup.add(hornMarker);
    this.mountedRoots.push(hornMarker);

    loungeGroup.updateWorldMatrix(true, true);
    hitTarget.getWorldPosition(this.gramWorldPos);
    hornMarker.getWorldPosition(this.gramHornWorldPos);
    this.gramMounted = true;

    return {
      kind: 'gramophone-play',
      hitTarget,
      worldPos: { x: this.gramWorldPos.x, y: this.gramWorldPos.y, z: this.gramWorldPos.z },
    };
  }

  /** Mount the firewood stack + hatchet stump next to the summit campfire */
  public mountCampfireWoodpile(getGroundY?: (x: number, z: number) => number): CozyToyRegistration {
    if (getGroundY) {
      this.woodpilePos.y = getGroundY(this.woodpilePos.x, this.woodpilePos.z);
    }
    const pile = buildFirewoodPile(this.woodpilePos);
    this.scene.add(pile.root);
    this.mountedRoots.push(pile.root);

    return {
      kind: 'campfire-logs',
      hitTarget: pile.hitTarget,
      worldPos: {
        x: this.woodpilePos.x + 0.25,
        y: this.woodpilePos.y + 0.45,
        z: this.woodpilePos.z + 0.05,
      },
    };
  }

  public isGramophonePlaying(): boolean {
    return this.gramPlaying;
  }

  /** Returns 0..1 intensity boost for the real summit campfire flame & PointLight */
  public getCampfireBoost(): number {
    if (this.fireBoostTime <= 0) return 0;
    return Math.min(1, this.fireBoostTime / 1.2);
  }

  public triggerToy(kind: CozyToyKind) {
    const muted = this.callbacks.isMuted?.() ?? false;

    if (kind === 'gramophone-play') {
      this.gramPlaying = !this.gramPlaying;
      if (this.gramPlaying) {
        this.gramChordTimer = 0;
        this.gramNoteSpawnTimer = 0;
        playLofiChord(this.gramChordIdx++, muted);
        this.spawnMusicNote();
        this.callbacks.onToast?.(
          '云端客厅 · 复古黄铜留声机',
          'Sky Lounge · Vintage Gramophone',
          '黑胶唱片已落针，温暖的夜色 Lo-Fi 旋律缓缓响起…',
          'Needle dropped — warm late-night Lo-Fi chords drifting out of the brass horn…',
          '🎵'
        );
      } else {
        this.callbacks.onToast?.(
          '云端客厅 · 留声机已暂停',
          'Sky Lounge · Gramophone Paused',
          '唱针轻轻抬起，露台重归宁静夜风。',
          'Tonearm lifted — the night breeze returns.',
          '🎶'
        );
      }
      return;
    }

    if (kind === 'campfire-logs') {
      this.flyingLogActive = true;
      this.flyingLogTime = 0;
      this.flyingLog.position.set(this.woodpilePos.x, this.woodpilePos.y + 0.55, this.woodpilePos.z);
      this.flyingLog.visible = true;
      this.callbacks.onToast?.(
        '观星台篝火 · 添柴加火',
        'Summit Campfire · Stoked!',
        '往火堆里添了一根干木柴，橘色火星缓缓飘向星空！',
        'Tossed a fresh log onto the fire — warm embers drifting toward the stars!',
        '🔥'
      );
    }
  }

  public getProximityPrompt(playerPos: THREE.Vector3): {
    kind: CozyToyKind;
    titleZh: string;
    subZh: string;
    dist: number;
  } | null {
    let best: { kind: CozyToyKind; titleZh: string; subZh: string; dist: number } | null = null;
    let bestDist = Infinity;

    if (this.gramMounted) {
      const d = Math.hypot(
        this.gramWorldPos.x - playerPos.x,
        this.gramWorldPos.z - playerPos.z
      );
      if (d < 3.6 && d < bestDist) {
        bestDist = d;
        best = {
          kind: 'gramophone-play',
          titleZh: this.gramPlaying ? '🎶 复古留声机（播放中）' : '🎵 复古黄铜留声机',
          subZh: this.gramPlaying
            ? '按 [E] 或点击抬起唱针暂停'
            : '按 [E] 或点击落针播放夜色 Lo-Fi 旋律',
          dist: d,
        };
      }
    }

    const dLog = Math.hypot(
      this.woodpilePos.x - playerPos.x,
      this.woodpilePos.z - playerPos.z
    );
    if (dLog < 3.2 && dLog < bestDist) {
      bestDist = dLog;
      best = {
        kind: 'campfire-logs',
        titleZh: '🪵 篝火木柴堆 · 云端观星台',
        subZh: '按 [E] 或点击往篝火添柴爆火星',
        dist: dLog,
      };
    }

    return best;
  }

  private spawnMusicNote() {
    const slot = this.noteSprites.find((n) => !n.active);
    if (!slot) return;
    slot.active = true;
    slot.age = 0;
    slot.maxAge = 2.4 + Math.random() * 0.8;
    slot.startPos.copy(this.gramHornWorldPos);
    slot.driftX = (Math.random() - 0.5) * 1.4;
    slot.driftZ = (Math.random() - 0.5) * 1.4;
    slot.sprite.position.copy(slot.startPos);
    slot.sprite.scale.setScalar(0.55);
    slot.sprite.visible = true;
  }

  private spawnEmbers(count: number) {
    let n = 0;
    for (const e of this.embers) {
      if (e.active) continue;
      e.active = true;
      e.age = 0;
      e.maxAge = 1.6 + Math.random() * 1.6;
      e.pos.set(
        this.campfirePos.x + (Math.random() - 0.5) * 0.55,
        this.campfirePos.y + 0.15,
        this.campfirePos.z + (Math.random() - 0.5) * 0.55
      );
      e.vel.set(
        (Math.random() - 0.5) * 1.6,
        2.2 + Math.random() * 3.0,
        (Math.random() - 0.5) * 1.6
      );
      e.baseScale = 0.65 + Math.random() * 0.85;
      if (++n >= count) break;
    }
  }

  public update(dt: number, elapsed: number) {
    const safeDt = Math.min(dt, 0.05);
    const muted = this.callbacks.isMuted?.() ?? false;

    // 1. Gramophone Lo-Fi chord loop & floating musical notes
    if (this.gramPlaying) {
      this.gramChordTimer += safeDt;
      if (this.gramChordTimer >= 2.2) {
        this.gramChordTimer = 0;
        playLofiChord(this.gramChordIdx++, muted);
      }
      this.gramNoteSpawnTimer += safeDt;
      if (this.gramNoteSpawnTimer >= 0.48) {
        this.gramNoteSpawnTimer = 0;
        this.spawnMusicNote();
      }
    }

    for (const n of this.noteSprites) {
      if (!n.active) continue;
      n.age += safeDt;
      if (n.age >= n.maxAge) {
        n.active = false;
        n.sprite.visible = false;
        continue;
      }
      const u = n.age / n.maxAge;
      n.sprite.position.set(
        n.startPos.x + n.driftX * u + Math.sin(elapsed * 3.2 + n.phase) * 0.25,
        n.startPos.y + u * 2.6,
        n.startPos.z + n.driftZ * u + Math.cos(elapsed * 2.8 + n.phase) * 0.25
      );
      const alpha = u < 0.2 ? u / 0.2 : 1 - (u - 0.2) / 0.8;
      (n.sprite.material as THREE.SpriteMaterial).opacity = Math.max(0, alpha * 0.95);
      n.sprite.scale.setScalar(0.45 + u * 0.35);
    }

    // 2. Flying firewood log -> lands in campfire -> flame surge + embers
    if (this.flyingLogActive) {
      this.flyingLogTime += safeDt;
      const dur = 0.45;
      const u = Math.min(1, this.flyingLogTime / dur);
      this.flyingLog.position.lerpVectors(this.woodpilePos, this.campfirePos, u);
      this.flyingLog.position.y += Math.sin(u * Math.PI) * 1.85 + 0.3;
      this.flyingLog.rotation.x += safeDt * 11;
      this.flyingLog.rotation.z += safeDt * 8;

      if (u >= 1) {
        this.flyingLogActive = false;
        this.flyingLog.visible = false;
        this.fireBoostTime = 4.6;
        playCampfireCrackleSound(muted);
        this.spawnEmbers(55);
      }
    }

    if (this.fireBoostTime > 0) {
      this.fireBoostTime = Math.max(0, this.fireBoostTime - safeDt);
      if (Math.random() < safeDt * 14) {
        this.spawnEmbers(2);
      }
    }

    // Update rising embers
    let dirty = false;
    for (let i = 0; i < this.embers.length; i++) {
      const e = this.embers[i];
      if (!e.active) continue;
      dirty = true;
      e.age += safeDt;
      if (e.age >= e.maxAge) {
        e.active = false;
        _m4.makeScale(0, 0, 0);
        this.emberMesh.setMatrixAt(i, _m4);
        continue;
      }
      const u = e.age / e.maxAge;
      e.vel.x *= Math.pow(0.4, safeDt);
      e.vel.z *= Math.pow(0.4, safeDt);
      e.pos.x += (e.vel.x + Math.sin(elapsed * 4.5 + e.phase) * 0.45) * safeDt;
      e.pos.y += e.vel.y * safeDt;
      e.pos.z += (e.vel.z + Math.cos(elapsed * 4.0 + e.phase) * 0.45) * safeDt;

      const s = e.baseScale * (1 - u);
      _s.setScalar(Math.max(0.001, s));
      _q.identity();
      _m4.compose(e.pos, _q, _s);
      this.emberMesh.setMatrixAt(i, _m4);
    }
    if (dirty) this.emberMesh.instanceMatrix.needsUpdate = true;
  }

  public dispose() {
    this.mountedRoots.forEach((r) => r.parent?.remove(r));
    this.mountedRoots = [];
    this.noteSprites.forEach((n) => {
      this.scene.remove(n.sprite);
      (n.sprite.material as THREE.Material).dispose();
    });
    this.noteTextures.forEach((t) => t.dispose());
    this.scene.remove(this.flyingLog, this.emberMesh);
    this.flyingLog.geometry.dispose();
    (this.flyingLog.material as THREE.Material).dispose();
    this.emberMesh.geometry.dispose();
    (this.emberMesh.material as THREE.Material).dispose();
  }
}

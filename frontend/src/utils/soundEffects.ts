// ============================================================================
// TACTILE WEB AUDIO SOUND ENGINE
// Inspired by Rauno Freiberg (rauno.me), Dieter Rams (Braun) & Teenage Engineering
// Zero external MP3 dependencies — pure real-time procedural synthesis
// ============================================================================

const STORAGE_KEY = 'hyx_sfx_enabled';

type SfxListener = (enabled: boolean) => void;
const listeners = new Set<SfxListener>();

let sfxEnabled: boolean = (() => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === null ? true : saved === 'true';
})();

let sharedCtx: AudioContext | null = null;
let lastHoverTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

export function isSfxEnabled(): boolean {
  return sfxEnabled;
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }
  listeners.forEach((fn) => fn(enabled));
  if (enabled) {
    playToggleSwitch(true);
  }
}

export function toggleSfx(): boolean {
  const next = !sfxEnabled;
  if (!next) {
    // Play a soft power-down click right before muting
    playToggleSwitch(false, true);
  }
  setSfxEnabled(next);
  return next;
}

export function subscribeSfx(listener: SfxListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * 1. Mechanical Micro-Switch Click (Primary / Secondary Buttons)
 * Crisp 14ms damped sine drop + subtle mechanical transient
 */
export function playTactileClick(pitchMultiplier = 1): void {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(720 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(140 * pitchMultiplier, now + 0.018);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0006, now + 0.018);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // Ignore audio context restrictions
  }
}

/**
 * 2. Rotary Encoder Detent Tick (Hovering Nav / Command Palette / Tabs)
 * Ultra-subtle 7ms ceramic tick, throttled to prevent spam
 */
export function playSoftTick(): void {
  if (!sfxEnabled) return;
  const nowMs = Date.now();
  if (nowMs - lastHoverTime < 45) return;
  lastHoverTime = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.009);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.011);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.012);
  } catch {
    // Ignore
  }
}

/**
 * 3. Two-Tone Mechanical Toggle Switch (Theme / Language / Filter Tabs)
 */
export function playToggleSwitch(on = true, force = false): void {
  if (!sfxEnabled && !force) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const freqs = on ? [520, 780] : [740, 480];
    freqs.forEach((freq, idx) => {
      const start = now + idx * 0.028;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, start + 0.024);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.042, start + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.026);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.028);
    });
  } catch {
    // Ignore
  }
}

/**
 * 4. Card Flip / Monograph Page Turn (3D Holographic ID Card / Lightbox)
 * Soft filtered air brush + warm harmonic snap
 */
export function playCardFlip(): void {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Subtle noise whoosh
    const bufferSize = Math.floor(ctx.sampleRate * 0.09);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.085);
    filter.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.032, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);

    // Subtle lock snap at the end of the flip
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(640, now + 0.055);
    snapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
    snapGain.gain.setValueAtTime(0.001, now + 0.055);
    snapGain.gain.linearRampToValueAtTime(0.035, now + 0.058);
    snapGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.082);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now + 0.055);
    snapOsc.stop(now + 0.085);
  } catch {
    // Ignore
  }
}

/**
 * 5. Warm Bronze Harmonic Chime (Copy Email / Like / Danmaku Sent / Form Sent)
 */
export function playSuccessChime(): void {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Warm major fifth + octave (C5 -> G5 -> E6)
    const notes = [523.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const start = now + i * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.048 / (i * 0.4 + 1), start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0006, start + 0.36);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.38);
    });
  } catch {
    // Ignore
  }
}

/**
 * 6. Command Palette / AI Drawer Acoustic Sweep
 */
export function playPaletteWhoosh(open = true): void {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (open) {
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.055);
    } else {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.045);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0006, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.065);
  } catch {
    // Ignore
  }
}

/**
 * 7. Analog Vinyl Turntable Needle Drop / Lift
 */
export function playVinylNeedle(drop = true): void {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low warm thump of stylus touching vinyl groove
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(drop ? 145 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(drop ? 48 : 95, now + 0.055);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  } catch {
    // Ignore
  }
}

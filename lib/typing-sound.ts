/** Soft mechanical-keyboard sounds made with the Web Audio API (no audio files needed). */
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export type KeyKind = "key" | "space" | "enter" | "back";

export function playKey(kind: KeyKind) {
  const c = ensure();
  if (!c || !noise) return;
  const t = c.currentTime;
  const big = kind === "space" || kind === "enter";
  const jitter = () => 0.92 + Math.random() * 0.16;

  // Click: a tiny burst of filtered noise.
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = jitter();
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = (big ? 1800 : kind === "back" ? 2400 : 3200) * jitter();
  bp.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(big ? 0.45 : 0.3, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  src.connect(bp);
  bp.connect(g);
  g.connect(c.destination);
  src.start(t);
  src.stop(t + 0.05);

  // Thock: a short falling low tone.
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime((big ? 150 : 210) * jitter(), t);
  o.frequency.exponentialRampToValueAtTime(big ? 70 : 100, t + 0.06);
  const og = c.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(big ? 0.45 : 0.25, t + 0.003);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(og);
  og.connect(c.destination);
  o.start(t);
  o.stop(t + 0.1);
}

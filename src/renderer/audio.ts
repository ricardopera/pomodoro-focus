/**
 * All sounds are synthesised with the Web Audio API — no asset files to
 * ship, no loading failures inside a packaged build, and the chimes stay
 * gentle instead of startling.
 */

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  if (context.state === 'suspended') void context.resume();
  return context;
}

interface ToneOptions {
  frequency: number;
  /** Seconds from now. */
  delay?: number;
  duration?: number;
  gain: number;
  type?: OscillatorType;
}

function tone(
  ctx: AudioContext,
  { frequency, delay = 0, duration = 1.6, gain, type = 'sine' }: ToneOptions
): void {
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);

  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export type ChimeKind = 'focusEnd' | 'breakEnd' | 'start';

/** A soft bell whose shape depends on what just happened. */
export function playChime(kind: ChimeKind, volume: number): void {
  if (volume <= 0) return;
  const ctx = getContext();
  if (!ctx) return;
  const v = Math.min(1, Math.max(0, volume));

  if (kind === 'start') {
    tone(ctx, { frequency: 660, gain: 0.09 * v, duration: 0.5 });
    return;
  }

  // Rising triad to come back to work, descending one to let go of it.
  const notes = kind === 'focusEnd' ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25];
  notes.forEach((frequency, index) => {
    tone(ctx, { frequency, delay: index * 0.16, gain: 0.16 * v, duration: 1.8 });
    tone(ctx, { frequency: frequency * 2, delay: index * 0.16, gain: 0.05 * v, duration: 1.1 });
  });
}

/** Barely-there tick, for people who like the pressure of a clock. */
export function playTick(volume: number): void {
  if (volume <= 0) return;
  const ctx = getContext();
  if (!ctx) return;
  tone(ctx, {
    frequency: 1180,
    gain: 0.012 * Math.min(1, Math.max(0, volume)),
    duration: 0.05,
    type: 'triangle',
  });
}

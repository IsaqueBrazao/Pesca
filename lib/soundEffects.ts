/**
 * High-fidelity retro 16-bit sound synthesizer using Web Audio API.
 * Emulates the iconic Stardew Valley audio feedback with zero external sound files.
 */

let audioCtx: AudioContext | null = null;
let reelOscillator: OscillatorNode | null = null;
let reelGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(420, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

export function playCast(powerPercent: number = 80): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Whip / swoosh sound
  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(300 + (powerPercent * 12), ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1800 + (powerPercent * 15), ctx.currentTime + 0.15);
  filter.Q.value = 4.0;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + 0.25);
}

export function playWaterSplash(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Water splash: filtered white noise burst with subtle bass plop
  const bufferSize = ctx.sampleRate * 0.35;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // Plop oscillator
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(340, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.18);
  oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + 0.35);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playBiteAlert(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Iconic Stardew "!" high-pitched alert chirp (ping-ping!)
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  // Two fast chirps
  osc.frequency.setValueAtTime(1320, now);
  osc.frequency.setValueAtTime(1760, now + 0.06);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.setValueAtTime(0.01, now + 0.05);
  gain.gain.setValueAtTime(0.35, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.26);
}

export function playHookSnap(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(580, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Continuous reel tension sound while fish is safely in green bar
 */
export function setReelSoundActive(active: boolean): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (active) {
    if (!reelOscillator) {
      try {
        reelOscillator = ctx.createOscillator();
        reelGain = ctx.createGain();

        reelOscillator.type = 'sawtooth';
        reelOscillator.frequency.setValueAtTime(110, ctx.currentTime);

        reelGain.gain.setValueAtTime(0.04, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 650;
        filter.Q.value = 3;

        reelOscillator.connect(filter);
        filter.connect(reelGain);
        reelGain.connect(ctx.destination);

        reelOscillator.start();
      } catch {
        // audio context safety
      }
    }
  } else {
    if (reelOscillator) {
      try {
        if (reelGain) {
          reelGain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
        }
        setTimeout(() => {
          try {
            reelOscillator?.stop();
            reelOscillator?.disconnect();
          } catch {}
          reelOscillator = null;
          reelGain = null;
        }, 50);
      } catch {
        reelOscillator = null;
        reelGain = null;
      }
    }
  }
}

export function playTreasureChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + idx * 0.07;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.29);
  });
}

export function playCaughtFanfare(isPerfect: boolean = false): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Stardew Valley signature triumphant catch jingle!
  // G4 -> C5 -> E5 -> G5 -> C6 (with flourish if perfect)
  const notes = isPerfect
    ? [392, 523.25, 659.25, 783.99, 1046.5, 1318.51]
    : [392, 523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + index * 0.11;
    const duration = index === notes.length - 1 ? 0.7 : 0.18;

    osc.type = index === notes.length - 1 ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.22, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  });
}

export function playEscapeSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.45);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.46);
}

export function playLevelUp(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const chords = [
    [523.25, 659.25, 783.99], // C
    [587.33, 739.99, 880.00], // D
    [659.25, 830.61, 987.77], // E
    [1046.5, 1318.51, 1567.98] // High C
  ];

  chords.forEach((chord, i) => {
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.14;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  });
}

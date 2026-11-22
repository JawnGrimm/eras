const AUDIO_PREFERENCE_KEY = 'scribe_audio_muted';

let audioContext: AudioContext | null = null;
let mutedOverride: boolean | null = null;

function readMutedPreference(): boolean {
  if (mutedOverride !== null) return mutedOverride;
  try {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(AUDIO_PREFERENCE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function isAudioMuted(): boolean {
  return readMutedPreference();
}

export function setAudioMuted(muted: boolean): void {
  mutedOverride = muted;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUDIO_PREFERENCE_KEY, String(muted));
    }
  } catch {
    // Audio preference persistence is best-effort; sound remains optional.
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const contextConstructor = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!contextConstructor) return null;
    audioContext ??= new contextConstructor();
    return audioContext;
  } catch {
    return null;
  }
}

function withAudioContext(synthesize: (context: AudioContext) => void): void {
  if (readMutedPreference()) return;
  const context = getAudioContext();
  if (!context) return;

  try {
    if (context.state === 'suspended') {
      void context.resume()
        .then(() => {
          if (!readMutedPreference() && context.state === 'running') synthesize(context);
        })
        .catch(() => undefined);
      return;
    }
    if (context.state !== 'running') return;
    synthesize(context);
  } catch {
    // Audio must never interrupt gameplay if a browser audio node fails.
  }
}

export function playStylusTap(): void {
  withAudioContext((context) => {
    const now = context.currentTime;
    const duration = 0.04;

    const tone = context.createOscillator();
    const toneGain = context.createGain();
    tone.type = 'triangle';
    tone.frequency.setValueAtTime(320, now);
    tone.frequency.exponentialRampToValueAtTime(140, now + duration);
    toneGain.gain.setValueAtTime(0.12, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    tone.connect(toneGain);
    toneGain.connect(context.destination);
    tone.start(now);
    tone.stop(now + duration);

    const noiseDuration = 0.035;
    const noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * noiseDuration), context.sampleRate);
    const samples = noiseBuffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }
    const noise = context.createBufferSource();
    const highPass = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = noiseBuffer;
    highPass.type = 'highpass';
    highPass.frequency.setValueAtTime(1800, now);
    noiseGain.gain.setValueAtTime(0.045, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);
    noise.connect(highPass);
    highPass.connect(noiseGain);
    noiseGain.connect(context.destination);
    noise.start(now);
    noise.stop(now + noiseDuration);
  });
}

export function playSealStamp(): void {
  withAudioContext((context) => {
    const now = context.currentTime;
    const duration = 0.13;
    const oscillator = context.createOscillator();
    const lowPass = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(118, now);
    oscillator.frequency.exponentialRampToValueAtTime(42, now + duration);
    lowPass.type = 'lowpass';
    lowPass.frequency.setValueAtTime(220, now);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(lowPass);
    lowPass.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}

export function playSettlementChime(): void {
  withAudioContext((context) => {
    const now = context.currentTime;
    const duration = 0.68;
    const tones: Array<{ frequency: number; amplitude: number }> = [
      { frequency: 261.6, amplitude: 0.075 },
      { frequency: 523.2, amplitude: 0.028 },
    ];

    for (const tone of tones) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(tone.frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(tone.amplitude, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    }
  });
}

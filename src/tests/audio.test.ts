import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let audio: typeof import('../engine/audio');

beforeEach(async () => {
  vi.resetModules();
  audio = await import('../engine/audio');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('tactile audio', () => {
  it('is a silent no-op when browser audio APIs are unavailable', () => {
    vi.stubGlobal('window', {});
    expect(() => {
      audio.playStylusTap();
      audio.playSealStamp();
      audio.playSettlementChime();
    }).not.toThrow();
  });

  it('defaults to unmuted and persists the explicit mute preference', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });

    expect(audio.isAudioMuted()).toBe(false);
    audio.setAudioMuted(true);
    expect(values.get('scribe_audio_muted')).toBe('true');
    expect(audio.isAudioMuted()).toBe(true);

    values.set('scribe_audio_muted', 'false');
    expect(audio.isAudioMuted()).toBe(false);
    values.set('scribe_audio_muted', 'true');
    expect(audio.isAudioMuted()).toBe(true);
  });

  it('uses memory fallback only when local storage access throws', () => {
    vi.stubGlobal('window', {
      get localStorage() { throw new Error('storage unavailable'); },
    });

    expect(audio.isAudioMuted()).toBe(false);
    expect(() => audio.setAudioMuted(true)).not.toThrow();
    expect(audio.isAudioMuted()).toBe(true);
    audio.setAudioMuted(false);
    expect(audio.isAudioMuted()).toBe(false);
  });
});

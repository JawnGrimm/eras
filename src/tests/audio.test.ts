import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAudioMuted, playSealStamp, playSettlementChime, playStylusTap, setAudioMuted } from '../engine/audio';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('tactile audio', () => {
  it('is a silent no-op when browser audio APIs are unavailable', () => {
    vi.stubGlobal('window', {});
    expect(() => {
      playStylusTap();
      playSealStamp();
      playSettlementChime();
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

    expect(isAudioMuted()).toBe(false);
    setAudioMuted(true);
    expect(values.get('scribe_audio_muted')).toBe('true');
    expect(isAudioMuted()).toBe(true);
    setAudioMuted(false);
    expect(isAudioMuted()).toBe(false);
  });

  it('fails silently when local storage access throws', () => {
    vi.stubGlobal('window', {
      get localStorage() { throw new Error('storage unavailable'); },
    });
    expect(isAudioMuted()).toBe(false);
    expect(() => setAudioMuted(true)).not.toThrow();
  });
});

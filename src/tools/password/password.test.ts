import { describe, expect, it } from 'vitest';
import { CHARSETS, generatePassword, type PwdOptions } from './password';

const fullOpts: PwdOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

describe('generatePassword', () => {
  it('respects requested length', () => {
    for (const length of [4, 8, 16, 32, 64]) {
      expect(generatePassword({ ...fullOpts, length })).toHaveLength(length);
    }
  });

  it('only includes characters from enabled charsets', () => {
    const opts: PwdOptions = { length: 100, uppercase: true, lowercase: false, numbers: true, symbols: false };
    const pool = CHARSETS.uppercase + CHARSETS.numbers;
    const pwd = generatePassword(opts);
    for (const ch of pwd) {
      expect(pool).toContain(ch);
    }
  });

  it('contains at least one char from each enabled class', () => {
    // run many times for statistical confidence
    for (let i = 0; i < 50; i++) {
      const pwd = generatePassword(fullOpts);
      expect(pwd).toMatch(/[A-Z]/);
      expect(pwd).toMatch(/[a-z]/);
      expect(pwd).toMatch(/[0-9]/);
    }
  });

  it('does NOT use Math.random (CSPRNG only)', () => {
    const orig = Math.random;
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => 0.5);
    generatePassword(fullOpts);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    Math.random = orig;
  });

  it('distributes characters uniformly over 10k samples', () => {
    const counts: Record<string, number> = {};
    const pool = CHARSETS.uppercase;
    const opts: PwdOptions = {
      length: 10,
      uppercase: true,
      lowercase: false,
      numbers: false,
      symbols: false,
    };
    for (let i = 0; i < 10_000; i++) {
      for (const ch of generatePassword(opts)) {
        counts[ch] = (counts[ch] ?? 0) + 1;
      }
    }
    for (const ch of pool) {
      expect(counts[ch] ?? 0).toBeGreaterThan(0);
    }
  });

  it('returns empty string when no charsets enabled', () => {
    const opts: PwdOptions = { length: 20, uppercase: false, lowercase: false, numbers: false, symbols: false };
    expect(generatePassword(opts)).toBe('');
  });
});

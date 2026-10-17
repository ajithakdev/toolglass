import { describe, it, expect } from 'vitest';
import { DEFAULT_ALPHABET, nanoid, uniqueChars } from './nanoid';

describe('nanoid', () => {
  it('returns the requested length from the alphabet', () => {
    const id = nanoid(21, DEFAULT_ALPHABET);
    expect(id).toHaveLength(21);
    for (const ch of id) expect(DEFAULT_ALPHABET).toContain(ch);
  });

  it('can pick characters past index 255 of a long alphabet', () => {
    const alphabet = Array.from({ length: 300 }, (_, i) => String.fromCharCode(0x4e00 + i)).join('');
    const late = new Set(alphabet.slice(256));
    const id = nanoid(2000, alphabet);
    expect([...id].some((ch) => late.has(ch))).toBe(true);
  });

  it('counts astral characters as one character each', () => {
    expect([...nanoid(10, '😀😁😂')]).toHaveLength(10);
  });

  it('returns an empty string for an empty alphabet', () => {
    expect(nanoid(10, '')).toBe('');
  });

  it('ignores duplicate alphabet characters', () => {
    expect(uniqueChars('aab')).toEqual(['a', 'b']);
  });
});

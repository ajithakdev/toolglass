import { describe, expect, it } from 'vitest';
import { clean, inspect } from './unicode';

describe('unicode', () => {
  it('flags zero-width and look-alike characters', () => {
    const info = inspect('a​b c');
    expect(info.map((c) => c.hex)).toEqual(['U+0061', 'U+200B', 'U+0062', 'U+00A0', 'U+0063']);
    expect(info[1]!.warning).toBe('ZERO WIDTH SPACE');
    expect(info[3]!.warning).toBe('NO-BREAK SPACE');
    expect(info[0]!.warning).toBeUndefined();
  });
  it('flags bidi overrides and tag characters', () => {
    expect(inspect('‮')[0]!.warning).toBe('RIGHT-TO-LEFT OVERRIDE');
    expect(inspect('\u{E0041}')[0]!.warning).toMatch(/TAG/);
  });
  it('treats astral characters as one', () => expect(inspect('😀')).toHaveLength(1));
  it('cleans hidden characters but keeps emoji sequences', () => {
    expect(clean('pass​word‮ x﻿')).toBe('password x');
    expect(clean('👨‍👩‍👧 ❤️')).toBe('👨‍👩‍👧 ❤️');
    expect(clean('line\ttab\nnext')).toBe('line\ttab\nnext');
  });
});

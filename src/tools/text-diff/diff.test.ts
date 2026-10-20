import { describe, expect, it } from 'vitest';
import { diffLines, MAX_CELLS } from './diff';

const ops = (a: string, b: string) => diffLines(a, b)!.map((l) => `${l.type[0]}:${l.text}`);

describe('diffLines', () => {
  it('marks identical text as unchanged', () => {
    expect(ops('a\nb', 'a\nb')).toEqual(['s:a', 's:b']);
  });

  it('finds a changed line in the middle', () => {
    expect(ops('a\nb\nc', 'a\nB\nc')).toEqual(['s:a', 'a:B', 'd:b', 's:c']);
  });

  it('handles pure additions and deletions', () => {
    expect(ops('a', 'a\nb')).toEqual(['s:a', 'a:b']);
    expect(ops('a\nb\nc', 'a\nc')).toEqual(['s:a', 'd:b', 's:c']);
  });

  it('rebuilds both sides from the result', () => {
    const a = 'one\ntwo\nthree\nfour\nfive';
    const b = 'zero\none\nthree\nfour!\nfive\nsix';
    const d = diffLines(a, b)!;
    expect(d.filter((l) => l.type !== 'add').map((l) => l.text).join('\n')).toBe(a);
    expect(d.filter((l) => l.type !== 'del').map((l) => l.text).join('\n')).toBe(b);
  });

  it('returns null when the input is too big', () => {
    const n = Math.ceil(Math.sqrt(MAX_CELLS)) + 1;
    const a = Array.from({ length: n }, (_, i) => `a${i}`).join('\n');
    const b = Array.from({ length: n }, (_, i) => `b${i}`).join('\n');
    expect(diffLines(a, b)).toBeNull();
  });
});

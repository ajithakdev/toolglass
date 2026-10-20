import { describe, expect, it } from 'vitest';
import { fromBits, group, parseBig, toBase, toBits } from './numberBase';

describe('number base', () => {
  it('parses bases and prefixes', () => {
    expect(parseBig('ff', 16)).toBe(255n);
    expect(parseBig('0b1010', 10)).toBe(10n);
    expect(parseBig('-0x10', 10)).toBe(-16n);
    expect(parseBig('1_000_000', 10)).toBe(1000000n);
  });
  it('rejects invalid digits', () => {
    expect(parseBig('12', 2)).toBeNull();
    expect(parseBig('', 10)).toBeNull();
    expect(parseBig('0x', 10)).toBeNull();
  });
  it('handles values past 2^53', () => expect(toBase(parseBig('ffffffffffffffff', 16)!, 10)).toBe('18446744073709551615'));
  it('makes two\'s complement bits', () => {
    expect(toBits(-1n, 8)).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(toBits(5n, 8)).toEqual([0, 0, 0, 0, 0, 1, 0, 1]);
    expect(toBits(256n, 8)).toBeNull();
    expect(toBits(-129n, 8)).toBeNull();
  });
  it('reads bits back signed or unsigned', () => {
    expect(fromBits([1, 1, 1, 1, 1, 1, 1, 1], true)).toBe(-1n);
    expect(fromBits([1, 1, 1, 1, 1, 1, 1, 1], false)).toBe(255n);
  });
  it('groups digits from the right', () => expect(group('1011111111', 4)).toBe('10 1111 1111'));
});

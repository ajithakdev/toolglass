import { describe, expect, it } from 'vitest';
import { decode, encode } from '../../src/tools/base64/base64';

describe('base64 encode/decode', () => {
  it('round-trips ASCII', () => {
    expect(decode(encode('Hello, world!'))).toBe('Hello, world!');
  });

  it('round-trips UTF-8 with diacritics', () => {
    expect(decode(encode('héllo'))).toBe('héllo');
  });

  it('round-trips emoji (4-byte codepoints)', () => {
    expect(decode(encode('héllo 🌍'))).toBe('héllo 🌍');
  });

  it('encodes to a string without line breaks', () => {
    const result = encode('a'.repeat(1000));
    expect(result).not.toContain('\n');
  });

  it('decodes with leading/trailing whitespace', () => {
    const encoded = encode('hello');
    expect(decode(`  ${encoded}  `)).toBe('hello');
  });

  it('empty string round-trips', () => {
    expect(decode(encode(''))).toBe('');
  });
});

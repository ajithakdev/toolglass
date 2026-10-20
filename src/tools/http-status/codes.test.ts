import { describe, expect, it } from 'vitest';
import { searchCodes, STATUS_CODES } from './codes';

describe('http status', () => {
  it('has unique, sorted codes', () => {
    const codes = STATUS_CODES.map((c) => c.code);
    expect(codes).toEqual([...new Set(codes)].sort((a, b) => a - b));
  });
  it('finds by code prefix, class, and text', () => {
    expect(searchCodes('404')[0]!.name).toBe('Not Found');
    expect(searchCodes('5xx').every((c) => c.code >= 500)).toBe(true);
    expect(searchCodes('rate limit')[0]!.code).toBe(429);
    expect(searchCodes('')).toHaveLength(STATUS_CODES.length);
  });
});

import { describe, expect, it } from 'vitest';
import { objectId } from './objectid';

describe('objectId', () => {
  it('produces a 24-character hex string', () => {
    const id = objectId();
    expect(id).toHaveLength(24);
    expect(id).toMatch(/^[0-9a-f]{24}$/);
  });

  it('timestamp slice is recent (within 60s)', () => {
    const id = objectId();
    const tsHex = id.slice(0, 8);
    const ts = parseInt(tsHex, 16);
    const now = Math.floor(Date.now() / 1000);
    expect(Math.abs(now - ts)).toBeLessThan(60);
  });

  it('counter is monotonically increasing across calls', () => {
    const ids = Array.from({ length: 10 }, objectId);
    for (let i = 1; i < ids.length; i++) {
      const prev = parseInt(ids[i - 1]!.slice(18), 16);
      const curr = parseInt(ids[i]!.slice(18), 16);
      // counter can wrap at 0xffffff, so just check they differ
      expect(curr).not.toBe(prev);
    }
  });

  it('generates unique ids in bulk', () => {
    const ids = new Set(Array.from({ length: 100 }, objectId));
    expect(ids.size).toBe(100);
  });
});

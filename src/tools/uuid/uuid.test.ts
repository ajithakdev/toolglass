import { describe, expect, it } from 'vitest';
import { inspectUuid, uuidv4, uuidv7 } from './uuid';

const V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuid', () => {
  it('makes RFC 9562 v7 ids that carry the timestamp', () => {
    const t = Date.UTC(2026, 9, 20, 12, 0, 0, 123);
    const id = uuidv7(t);
    expect(id).toMatch(V7);
    expect(inspectUuid(id)).toEqual({ version: 7, variant: 'RFC 9562', date: new Date(t) });
  });

  it('keeps ids from the same millisecond in creation order', () => {
    const t = Date.UTC(2030, 0, 1);
    const ids = Array.from({ length: 5000 }, () => uuidv7(t));
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(V7));
  });

  it('inspects v4 and rejects junk', () => {
    expect(inspectUuid(uuidv4())).toEqual({ version: 4, variant: 'RFC 9562' });
    expect(inspectUuid('{6BA7B810-9DAD-11D1-80B4-00C04FD430C8}')).toEqual({ version: 1, variant: 'RFC 9562' });
    expect(inspectUuid('not-a-uuid')).toBeNull();
    expect(inspectUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c')).toBeNull();
  });
});

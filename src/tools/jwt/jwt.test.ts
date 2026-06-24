import { describe, expect, it } from 'vitest';
import { signHS256 } from './jwt';

describe('JWT signHS256', () => {
  it('produces a token with exactly 3 dot-separated parts', async () => {
    const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const payload = JSON.stringify({ sub: '123', iat: 1700000000 });
    const token = await signHS256(payload, 'secret', header);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('header part decodes to valid JSON with alg: HS256', async () => {
    const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const payload = JSON.stringify({ sub: '123' });
    const token = await signHS256(payload, 'secret', header);
    const [headerB64] = token.split('.');
    // base64url → base64 padding
    const padded = headerB64!.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      headerB64!.length + (4 - (headerB64!.length % 4)) % 4,
      '=',
    );
    const decoded = JSON.parse(atob(padded)) as { alg: string; typ: string };
    expect(decoded.alg).toBe('HS256');
    expect(decoded.typ).toBe('JWT');
  });

  it('signature changes when secret changes', async () => {
    const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const payload = JSON.stringify({ sub: '123' });
    const t1 = await signHS256(payload, 'secret-a', header);
    const t2 = await signHS256(payload, 'secret-b', header);
    expect(t1).not.toBe(t2);
    // Only the signature (3rd segment) should differ
    const [, , sig1] = t1.split('.');
    const [, , sig2] = t2.split('.');
    expect(sig1).not.toBe(sig2);
  });

  it('produces URL-safe base64 (no +, /, =)', async () => {
    // Run many times to statistically hit padding chars
    for (let i = 0; i < 20; i++) {
      const token = await signHS256(
        JSON.stringify({ i }),
        `secret-${i}`,
        JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
      );
      expect(token).not.toMatch(/[+/=]/);
    }
  });
});

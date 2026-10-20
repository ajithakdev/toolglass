import { describe, expect, it } from 'vitest';
import { generateKeyPair, signHS256, signJwt } from './jwt';

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

describe('JWT signJwt (asymmetric)', () => {
  const header = (alg: string) => JSON.stringify({ alg, typ: 'JWT' });
  const payload = JSON.stringify({ sub: '123' });

  function b64urlToBytes(s: string) {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '='));
    return new Uint8Array(Array.from(bin, (c) => c.charCodeAt(0)));
  }

  it.each([
    ['RS256', { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, { name: 'RSASSA-PKCS1-v1_5' }, 256],
    ['ES256', { name: 'ECDSA', namedCurve: 'P-256' }, { name: 'ECDSA', hash: 'SHA-256' }, 64],
  ] as const)('%s token verifies with the generated public key', async (alg, importParams, verifyParams, sigLen) => {
    const { privateKey, publicKey } = await generateKeyPair(alg);
    expect(privateKey).toMatch(/^-----BEGIN PRIVATE KEY-----\n/);
    expect(publicKey).toMatch(/^-----BEGIN PUBLIC KEY-----\n/);

    const token = await signJwt(alg, payload, privateKey, header(alg));
    const [h, p, s] = token.split('.');
    const sig = b64urlToBytes(s!);
    expect(sig.length).toBe(sigLen);

    const der = b64urlToBytes(publicKey.replace(/-----[^-]+-----|\s/g, ''));
    const pub = await crypto.subtle.importKey('spki', der, importParams, false, ['verify']);
    const ok = await crypto.subtle.verify(verifyParams, pub, sig, new TextEncoder().encode(`${h}.${p}`));
    expect(ok).toBe(true);
  });

  it('HS256 through signJwt matches signHS256', async () => {
    expect(await signJwt('HS256', payload, 'k', header('HS256'))).toBe(await signHS256(payload, 'k', header('HS256')));
  });

  it('rejects a malformed PEM', async () => {
    await expect(signJwt('RS256', payload, 'not a key', header('RS256'))).rejects.toThrow();
  });
});

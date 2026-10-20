import { describe, expect, it } from 'vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { hashFile, hashText, keccak } from './hash';

// Known-answer vectors from NIST (FIPS 202 examples) and the Ethereum Keccak-256 spec
describe('hash', () => {
  it('matches SHA-3 vectors for the empty string and "abc"', async () => {
    expect(await hashText('', 'SHA3-256')).toBe('a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a');
    expect(await hashText('abc', 'SHA3-224')).toBe('e642824c3f8cf24ad09234ee7d3c766fc9a3a5168d0c94ad73b46fdf');
    expect(await hashText('abc', 'SHA3-256')).toBe('3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532');
    expect(await hashText('abc', 'SHA3-384')).toBe('ec01498288516fc926459f58e2c6ad8df9b473cb0fc08c2596da7cf0e49be4b298d88cea927ac7f539f1edf228376d25');
    expect(await hashText('abc', 'SHA3-512')).toBe('b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0');
  });

  it('matches Keccak-256 (Ethereum) for the empty string', async () => {
    expect(await hashText('', 'Keccak-256')).toBe('c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470');
  });

  it('crosses block boundaries the same whether fed at once or in pieces', async () => {
    const text = 'a'.repeat(1000);
    const k = keccak(256, 0x06);
    const bytes = new TextEncoder().encode(text);
    for (let i = 0; i < bytes.length; i += 7) k.update(bytes.subarray(i, i + 7));
    expect(k.digest()).toBe(await hashText(text, 'SHA3-256'));
    // Many blocks; reference values from Python's hashlib
    expect(await hashText('a'.repeat(1_000_000), 'SHA3-256')).toBe('5c8875ae474a3634ba4fd55ec85bffd661f32aca75c6d699d0cdcb6c115891c1');
    expect(await hashText('a'.repeat(200), 'SHA3-512')).toBe('eae6c85c6904f11075de9f9d5e1064371d000510fa3d2d79d40cf9be34892fb01859d0a0234e138bcb0ad5c84f6c0dca226a414b0c9a2897cb695f5185fe36ec');
  });

  // jsdom's Blob has no stream(); Node's matches the browser API
  it('hashes a file with every algorithm and reports progress', async () => {
    const seen: number[] = [];
    const out = await hashFile(new NodeBlob(['abc']) as unknown as Blob, { onProgress: (f) => seen.push(f) });
    expect(out['SHA-256']).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(out['SHA3-256']).toBe(await hashText('abc', 'SHA3-256'));
    expect(seen.at(-1)).toBe(1);
  });

  it('stops when aborted', async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    await expect(hashFile(new NodeBlob(['abc']) as unknown as Blob, { signal: ctrl.signal })).rejects.toThrow();
  });
});

/**
 * Pure base64url helpers (no DOM required — pure JS).
 */
export function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function strToB64Url(s: string): string {
  return b64url(new TextEncoder().encode(s));
}

/**
 * Sign a JWT with HS256. Returns the full token string.
 */
export async function signHS256(
  payload: string,
  secret: string,
  header: string,
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const data = `${strToB64Url(header)}.${strToB64Url(payload)}`;
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return `${data}.${b64url(new Uint8Array(sig))}`;
}

export type JwtAlg = 'HS256' | 'RS256' | 'ES256';

const ASYM = {
  RS256: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  ES256: { name: 'ECDSA', namedCurve: 'P-256' },
} as const;

function pemToDer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function derToPem(der: ArrayBuffer, label: string): string {
  let bin = '';
  for (const b of new Uint8Array(der)) bin += String.fromCharCode(b);
  const lines = btoa(bin).match(/.{1,64}/g)!.join('\n');
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

/**
 * Sign a JWT. `key` is the shared secret for HS256, or a PKCS#8 PEM private key for RS256/ES256.
 * ES256 signatures from WebCrypto are already raw r||s, which is what JWS expects.
 */
export async function signJwt(alg: JwtAlg, payload: string, key: string, header: string): Promise<string> {
  if (alg === 'HS256') return signHS256(payload, key, header);
  const k = await crypto.subtle.importKey('pkcs8', pemToDer(key), ASYM[alg], false, ['sign']);
  const data = `${strToB64Url(header)}.${strToB64Url(payload)}`;
  const params = alg === 'ES256' ? { name: 'ECDSA', hash: 'SHA-256' } : ASYM.RS256;
  const sig = await crypto.subtle.sign(params, k, new TextEncoder().encode(data));
  return `${data}.${b64url(new Uint8Array(sig))}`;
}

/** Fresh RSA-2048 or EC P-256 key pair as PEM strings. */
export async function generateKeyPair(alg: 'RS256' | 'ES256'): Promise<{ privateKey: string; publicKey: string }> {
  const params =
    alg === 'RS256'
      ? { ...ASYM.RS256, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }
      : ASYM.ES256;
  const pair = (await crypto.subtle.generateKey(params, true, ['sign', 'verify'])) as CryptoKeyPair;
  return {
    privateKey: derToPem(await crypto.subtle.exportKey('pkcs8', pair.privateKey), 'PRIVATE KEY'),
    publicKey: derToPem(await crypto.subtle.exportKey('spki', pair.publicKey), 'PUBLIC KEY'),
  };
}

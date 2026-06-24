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

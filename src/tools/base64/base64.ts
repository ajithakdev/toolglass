/** Unicode-safe base64 encode */
export function encode(s: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(s)));
}

/** Unicode-safe base64 decode */
export function decode(s: string): string {
  const bin = atob(s.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

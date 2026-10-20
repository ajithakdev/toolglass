const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const format = (h: string) => `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;

export function uuidv4(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  return format(hex(b));
}

let lastMs = 0;
let seq = 0;

/**
 * RFC 9562 v7: 48-bit Unix ms timestamp, then random bits. IDs made in the same
 * millisecond put a counter in the 12-bit rand_a field (RFC 9562 §6.2 method 1),
 * so a bulk batch still sorts in creation order.
 */
export function uuidv7(now = Date.now()): string {
  if (now > lastMs) {
    lastMs = now;
    seq = 0;
  } else if (++seq > 0xfff) {
    // Counter full: borrow the next millisecond
    lastMs++;
    seq = 0;
  }
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  let ms = lastMs;
  for (let i = 5; i >= 0; i--) {
    b[i] = ms % 256;
    ms = Math.floor(ms / 256);
  }
  b[6] = 0x70 | (seq >> 8);
  b[7] = seq & 0xff;
  b[8] = (b[8]! & 0x3f) | 0x80;
  return format(hex(b));
}

export interface UuidInfo {
  version: number;
  variant: 'RFC 9562' | 'NCS' | 'Microsoft' | 'Reserved';
  /** Embedded timestamp, v7 only */
  date?: Date;
}

/** Version, variant, and (for v7) the embedded time of a UUID string, or null if it isn't one. */
export function inspectUuid(input: string): UuidInfo | null {
  const h = input.trim().replace(/^urn:uuid:/i, '').replace(/^\{(.*)\}$/, '$1').toLowerCase();
  // All four hyphens or none: half-hyphenated strings are not UUIDs
  if (!/^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/.test(h)) return null;
  const s = h.replace(/-/g, '');
  const version = parseInt(s[12]!, 16);
  const v = parseInt(s[16]!, 16);
  const variant = v < 8 ? 'NCS' : v < 12 ? 'RFC 9562' : v < 14 ? 'Microsoft' : 'Reserved';
  const info: UuidInfo = { version, variant };
  if (version === 7) info.date = new Date(parseInt(s.slice(0, 12), 16));
  return info;
}

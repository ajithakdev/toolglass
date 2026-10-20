const PREFIX: Record<string, number> = { '0x': 16, '0b': 2, '0o': 8 };
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Parse an integer of any size in base 2-36. Accepts 0x/0b/0o prefixes, a leading minus, and _ or space separators. */
export function parseBig(input: string, base: number): bigint | null {
  let s = input.trim().toLowerCase().replace(/[_\s]/g, '');
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  const p = PREFIX[s.slice(0, 2)];
  if (p) {
    base = p;
    s = s.slice(2);
  }
  if (!s) return null;
  let n = 0n;
  const b = BigInt(base);
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    n = n * b + BigInt(d);
  }
  return neg ? -n : n;
}

export const toBase = (n: bigint, base: number) => (n < 0n ? '-' + (-n).toString(base) : n.toString(base));

/** Two's complement bits, most significant first. Null if n does not fit in `width` bits. */
export function toBits(n: bigint, width: number): number[] | null {
  const w = BigInt(width);
  if (n >= 1n << w || n < -(1n << (w - 1n))) return null;
  const u = BigInt.asUintN(width, n);
  return Array.from({ length: width }, (_, i) => Number((u >> BigInt(width - 1 - i)) & 1n));
}

/** Read bits back, unsigned or as two's complement signed. */
export function fromBits(bits: number[], signed: boolean): bigint {
  const u = bits.reduce((acc, b) => (acc << 1n) | BigInt(b), 0n);
  return signed ? BigInt.asIntN(bits.length, u) : u;
}

/** "11111111" -> "1111 1111" */
export const group = (s: string, size: number) => s.replace(new RegExp(`\\B(?=(.{${size}})+$)`, 'g'), ' ');

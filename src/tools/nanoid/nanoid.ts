export const DEFAULT_ALPHABET =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

/** Unique characters of the alphabet (by code point), so duplicates don't skew the odds. */
export function uniqueChars(alphabet: string): string[] {
  return [...new Set(alphabet)];
}

/** Uniform random id via 32-bit values and rejection sampling; works for any alphabet size. */
export function nanoid(size: number, alphabet: string): string {
  const chars = uniqueChars(alphabet);
  const n = chars.length;
  if (n === 0) return '';
  const limit = 2 ** 32 - (2 ** 32 % n);
  const id: string[] = [];
  const buf = new Uint32Array(size);
  while (id.length < size) {
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length && id.length < size; i++) {
      if (buf[i]! < limit) id.push(chars[buf[i]! % n]!);
    }
  }
  return id.join('');
}

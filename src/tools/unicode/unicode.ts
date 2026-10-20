/** Characters that are invisible or look like a normal space, with a short name. */
const SUSPECT: Record<number, string> = {
  0x00a0: 'NO-BREAK SPACE', 0x00ad: 'SOFT HYPHEN', 0x034f: 'COMBINING GRAPHEME JOINER', 0x061c: 'ARABIC LETTER MARK',
  0x115f: 'HANGUL CHOSEONG FILLER', 0x1160: 'HANGUL JUNGSEONG FILLER', 0x17b4: 'KHMER VOWEL INHERENT AQ', 0x17b5: 'KHMER VOWEL INHERENT AA',
  0x180e: 'MONGOLIAN VOWEL SEPARATOR', 0x2000: 'EN QUAD', 0x2001: 'EM QUAD', 0x2002: 'EN SPACE', 0x2003: 'EM SPACE',
  0x2004: 'THREE-PER-EM SPACE', 0x2005: 'FOUR-PER-EM SPACE', 0x2006: 'SIX-PER-EM SPACE', 0x2007: 'FIGURE SPACE',
  0x2008: 'PUNCTUATION SPACE', 0x2009: 'THIN SPACE', 0x200a: 'HAIR SPACE', 0x200b: 'ZERO WIDTH SPACE',
  0x200c: 'ZERO WIDTH NON-JOINER', 0x200d: 'ZERO WIDTH JOINER', 0x200e: 'LEFT-TO-RIGHT MARK', 0x200f: 'RIGHT-TO-LEFT MARK',
  0x2028: 'LINE SEPARATOR', 0x2029: 'PARAGRAPH SEPARATOR', 0x202a: 'LEFT-TO-RIGHT EMBEDDING', 0x202b: 'RIGHT-TO-LEFT EMBEDDING',
  0x202c: 'POP DIRECTIONAL FORMATTING', 0x202d: 'LEFT-TO-RIGHT OVERRIDE', 0x202e: 'RIGHT-TO-LEFT OVERRIDE',
  0x202f: 'NARROW NO-BREAK SPACE', 0x205f: 'MEDIUM MATHEMATICAL SPACE', 0x2060: 'WORD JOINER', 0x2061: 'FUNCTION APPLICATION',
  0x2062: 'INVISIBLE TIMES', 0x2063: 'INVISIBLE SEPARATOR', 0x2064: 'INVISIBLE PLUS', 0x2066: 'LEFT-TO-RIGHT ISOLATE',
  0x2067: 'RIGHT-TO-LEFT ISOLATE', 0x2068: 'FIRST STRONG ISOLATE', 0x2069: 'POP DIRECTIONAL ISOLATE', 0x3000: 'IDEOGRAPHIC SPACE',
  0x3164: 'HANGUL FILLER', 0xfeff: 'ZERO WIDTH NO-BREAK SPACE (BOM)', 0xffa0: 'HALFWIDTH HANGUL FILLER',
};

const CATEGORIES: [RegExp, string][] = [
  [/\p{L}/u, 'Letter'], [/\p{M}/u, 'Mark'], [/\p{N}/u, 'Number'], [/\p{P}/u, 'Punctuation'], [/\p{S}/u, 'Symbol'],
  [/\p{Zs}/u, 'Space'], [/\p{Cc}/u, 'Control'], [/\p{Cf}/u, 'Format'], [/\p{Co}/u, 'Private use'],
];

export interface CharInfo {
  char: string;
  codePoint: number;
  hex: string;
  category: string;
  /** Set for invisible, look-alike, or control characters */
  warning?: string;
}

const isTag = (cp: number) => cp >= 0xe0000 && cp <= 0xe007f;
const isVariation = (cp: number) => (cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef);

export function inspect(text: string): CharInfo[] {
  return [...text].map((char) => {
    const cp = char.codePointAt(0)!;
    const category = CATEGORIES.find(([re]) => re.test(char))?.[1] ?? 'Other';
    const hex = `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
    let warning = SUSPECT[cp];
    if (!warning && isTag(cp)) warning = 'TAG CHARACTER (can hide text)';
    if (!warning && isVariation(cp)) warning = 'VARIATION SELECTOR';
    if (!warning && category === 'Control' && !'\n\r\t'.includes(char)) warning = 'CONTROL CHARACTER';
    return { char, codePoint: cp, hex, category, warning };
  });
}

/**
 * Remove invisible characters and turn look-alike spaces into normal spaces.
 * Keeps ZWJ inside emoji sequences and variation selectors after emoji, so 👨‍👩‍👧 and ❤️ survive.
 */
export function clean(text: string): string {
  const chars = [...text];
  return chars
    .map((ch, i) => {
      const cp = ch.codePointAt(0)!;
      const prevEmoji = i > 0 && /\p{Extended_Pictographic}/u.test(chars[i - 1]!);
      if (cp === 0x200d && prevEmoji && /\p{Extended_Pictographic}/u.test(chars[i + 1] ?? '')) return ch;
      if (isVariation(cp)) return prevEmoji ? ch : '';
      if (/\p{Zs}/u.test(ch)) return ' ';
      if (cp === 0x2028 || cp === 0x2029) return '\n';
      if (SUSPECT[cp] || isTag(cp)) return '';
      if (/\p{Cc}/u.test(ch) && !'\n\r\t'.includes(ch)) return '';
      return ch;
    })
    .join('');
}

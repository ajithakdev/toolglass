export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  /** Minutes, at 238 words per minute (silent reading average). */
  readingMinutes: number;
  /** Minutes, at 150 words per minute. */
  speakingMinutes: number;
}

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const wordSeg = new Intl.Segmenter(undefined, { granularity: 'word' });
const sentenceSeg = new Intl.Segmenter(undefined, { granularity: 'sentence' });

const count = <T>(it: Iterable<T>, keep: (x: T) => boolean = () => true) => {
  let n = 0;
  for (const x of it) if (keep(x)) n++;
  return n;
};

/** Unicode-aware counts: emoji count as one character, CJK text splits into words. */
export function textStats(text: string): TextStats {
  const words = count(wordSeg.segment(text), (s) => !!s.isWordLike);
  return {
    words,
    characters: count(graphemes.segment(text)),
    charactersNoSpaces: count(graphemes.segment(text), (s) => !/\s/.test(s.segment)),
    sentences: count(sentenceSeg.segment(text), (s) => /\p{L}|\p{N}/u.test(s.segment)),
    paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim()).length,
    readingMinutes: words / 238,
    speakingMinutes: words / 150,
  };
}

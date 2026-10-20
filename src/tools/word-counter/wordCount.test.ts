import { describe, expect, it } from 'vitest';
import { textStats } from './wordCount';

describe('textStats', () => {
  it('counts an empty string as zero', () => {
    expect(textStats('')).toMatchObject({ words: 0, characters: 0, sentences: 0, paragraphs: 0 });
  });

  it('counts words, sentences, and paragraphs', () => {
    const s = textStats("Hello world. It's a test!\n\nSecond paragraph here.");
    expect(s.words).toBe(8);
    expect(s.sentences).toBe(3);
    expect(s.paragraphs).toBe(2);
  });

  it('counts an emoji as one character', () => {
    expect(textStats('a 👍🏽').characters).toBe(3);
    expect(textStats('a 👍🏽').charactersNoSpaces).toBe(2);
  });

  it('gives reading time from word count', () => {
    expect(textStats('word '.repeat(476)).readingMinutes).toBe(2);
  });
});

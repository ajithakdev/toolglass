import { describe, expect, it } from 'vitest';
import { decodeEntities, encodeEntities } from './entities';

describe('entities', () => {
  it('escapes the HTML special characters', () => {
    expect(encodeEntities(`<a href="x">Tom & 'Jerry'</a>`, 'named', false)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;');
  });
  it('encodes non-ASCII in each style', () => {
    expect(encodeEntities('© é 😀', 'named', true)).toBe('&copy; &#233; &#128512;');
    expect(encodeEntities('é😀', 'hex', true)).toBe('&#xE9;&#x1F600;');
    expect(encodeEntities('é', 'decimal', false)).toBe('é');
  });
  it('decodes named, decimal, and hex entities', () => {
    expect(decodeEntities('&lt;b&gt; &copy; &#233; &#x1F600; &hellip;')).toBe('<b> © é 😀 …');
  });
  it('treats tags in the input as text', () => {
    expect(decodeEntities('<img src=x onerror=alert(1)>&amp;')).toBe('<img src=x onerror=alert(1)>&');
  });
});

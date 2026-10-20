import { describe, expect, it } from 'vitest';
import { extFor, pickMime } from './recorder';

describe('pickMime', () => {
  it('prefers MP4 when supported', () => expect(pickMime(() => true)).toBe('video/mp4;codecs=avc1'));
  it('falls back to WebM', () => expect(pickMime((t) => t.startsWith('video/webm'))).toBe('video/webm;codecs=vp9,opus'));
  it('returns empty when nothing matches', () => expect(pickMime(() => false)).toBe(''));
  it('maps the file extension', () => {
    expect(extFor('video/mp4;codecs=avc1')).toBe('mp4');
    expect(extFor('')).toBe('webm');
  });
});

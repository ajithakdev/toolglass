import { describe, expect, it } from 'vitest';
import { detect, search } from './mime';

const bytes = (hex: string) => Uint8Array.from(hex.match(/../g)!.map((h) => parseInt(h, 16)));

describe('mime', () => {
  it('detects files by signature', () => {
    expect(detect(bytes('89504E470D0A1A0A0000'))[0]!.mime).toBe('image/png');
    expect(detect(bytes('255044462D312E37'))[0]!.mime).toBe('application/pdf');
    expect(detect(bytes('52494646AABBCCDD57454250'))[0]!.mime).toBe('image/webp');
    expect(detect(bytes('0000001C6674797061766966'))[0]!.mime).toBe('image/avif');
  });
  it('lists every ZIP-based format for a ZIP signature', () => {
    expect(detect(bytes('504B030414000000')).map((e) => e.ext[0])).toEqual(expect.arrayContaining(['zip', 'docx', 'epub']));
  });
  it('returns nothing for unknown or short input', () => {
    expect(detect(bytes('DEADBEEF'))).toEqual([]);
    expect(detect(new Uint8Array())).toEqual([]);
  });
  it('searches by extension, MIME type, or name', () => {
    expect(search('.jpg')[0]!.mime).toBe('image/jpeg');
    expect(search('application/pdf')[0]!.ext).toContain('pdf');
    expect(search('photoshop')[0]!.ext).toContain('psd');
  });
});

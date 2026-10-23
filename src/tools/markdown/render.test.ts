import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './render';

describe('renderMarkdown', () => {
  it('drops remote image sources in the preview', () => {
    const html = renderMarkdown('![pixel](https://example.com/p.png) <img src="//x.io/a.gif" srcset="https://x.io/b.gif 2x">');
    expect(html).not.toMatch(/example\.com|x\.io/);
    expect(html).toContain('alt="pixel (remote image not loaded)"');
  });

  it('keeps inline images', () => {
    expect(renderMarkdown('![dot](data:image/png;base64,AAAA)')).toContain('src="data:image/png;base64,AAAA"');
  });

  it('keeps remote images for exports, still sanitized', () => {
    const html = renderMarkdown('![a](https://example.com/p.png)<script>alert(1)</script>', true);
    expect(html).toContain('src="https://example.com/p.png"');
    expect(html).not.toContain('<script');
  });
});

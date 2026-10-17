import { describe, it, expect } from 'vitest';
import { applyMeta, allPages, sitemapXml, SITE_URL } from './seo';

const SHELL = `<title>Old</title>
<meta name="description" content="old" />
<meta property="og:title" content="old" />
<meta property="og:description" content="old" />
<meta property="og:url" content="old" />
<meta name="twitter:title" content="old" />
<meta name="twitter:description" content="old" />
<link rel="canonical" href="old" />`;

describe('seo', () => {
  it('rewrites every meta tag for a page', () => {
    const out = applyMeta(SHELL, { path: '/tools/json', title: 'JSON & "more"', description: 'Costs $1 <b>' });
    expect(out).not.toContain('old');
    expect(out).toContain('<title>JSON &amp; &quot;more&quot;</title>');
    expect(out).toContain('content="Costs $1 &lt;b&gt;"');
    expect(out).toContain(`href="${SITE_URL}/tools/json"`);
  });

  it('lists the home page and every tool in the sitemap', () => {
    const pages = allPages();
    expect(pages[0]!.path).toBe('/');
    const xml = sitemapXml(pages);
    expect(xml.match(/<url>/g)).toHaveLength(pages.length);
    expect(xml).toContain(`${SITE_URL}/tools/json</loc>`);
  });
});

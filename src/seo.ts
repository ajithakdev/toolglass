// Page metadata for the prerendered HTML files and the sitemap.
// Pure functions, no DOM or Node APIs, so both the app and vite.config.ts can use them.
import { catalog, type ToolInfo } from './tools/catalog';

export const SITE_URL = 'https://toolglass.ajithakdev.com';

export interface PageMeta {
  path: string;
  title: string;
  description: string;
}

export const HOME: PageMeta = {
  path: '/',
  title: 'Toolglass — free, private tools for everything you do in a browser',
  description:
    'Free tools that run entirely in your browser: passwords, QR codes, JSON, timestamps, and more. No sign-up, no uploads, no ads.',
};

export const toolPage = (t: ToolInfo): PageMeta => ({
  path: `/tools/${t.slug}`,
  title: `${t.title} — free and private | Toolglass`,
  description: `${t.description} Runs in your browser; nothing is uploaded.`,
});

/** Every page that gets its own HTML file and sitemap entry. */
export const allPages = (): PageMeta[] => [HOME, ...catalog.map(toolPage)];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Rewrites title, description, social tags, and canonical URL in the built index.html. */
export function applyMeta(html: string, m: PageMeta): string {
  const url = SITE_URL + m.path;
  const set = (re: RegExp, value: string) => (h: string) => h.replace(re, (_, pre: string) => pre + esc(value));
  return [
    set(/(<title>)[^<]*/, m.title),
    set(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*/g, m.description),
    set(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*/g, m.title),
    set(/(<meta property="og:url" content=")[^"]*/, url),
    set(/(<link rel="canonical" href=")[^"]*/, url),
  ].reduce((h, f) => f(h), html);
}

/** Same tags as applyMeta, updated on the live document after client-side navigation. */
export function applyMetaToDocument(m: PageMeta, doc: Document = document) {
  const url = SITE_URL + m.path;
  doc.title = m.title;
  const set = (selector: string, attr: string, value: string) =>
    doc.querySelectorAll(selector).forEach((el) => el.setAttribute(attr, value));
  set('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]', 'content', m.description);
  set('meta[property="og:title"], meta[name="twitter:title"]', 'content', m.title);
  set('meta[property="og:url"]', 'content', url);
  set('link[rel="canonical"]', 'href', url);
}

export function sitemapXml(pages: PageMeta[]): string {
  const urls = pages.map((p) => `  <url><loc>${SITE_URL}${p.path}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

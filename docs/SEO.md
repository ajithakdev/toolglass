# SEO guide

How search and link previews work on `toolglass.ajithakdev.com`, what to set up once, and what to check on every release.

## How the site handles SEO

- `src/seo.ts` holds the title and description for every page: home, `/tools/`, `/about`, and one per tool built from `src/tools/catalog.ts`.
  - Tool titles read `<Tool>: free online, no upload | Toolglass`.
  - Tool descriptions are the catalog description, then "Runs in your browser, nothing is uploaded." (skipped when the description already says it), then "A private alternative to <replaces>." when the tool has a `replaces` field.
- The `seoPages` plugin in `vite.config.ts` writes one HTML file per page after the build (`tools/<slug>.html`), so crawlers get the right title, description, Open Graph tags and canonical URL without running JavaScript. It also writes `404.html` (with `noindex`) and `sitemap.xml`.
- `applyMetaToDocument` updates the same tags after in-app navigation.
- `index.html` holds the default tags, one JSON-LD block, and `og-image.png` (shared by every page for now).
- `public/robots.txt` allows everything and points to the sitemap.
- The site is served by GitHub Pages. DNS for `ajithakdev.com` is on Cloudflare, not proxied for this subdomain.
- `src/seo.test.ts` fails the build if a title or description has an em or en dash, or repeats the privacy line.

## One-time setup

Tick these off here when done.

- [ ] Google Search Console: at https://search.google.com/search-console add a **Domain** property for `ajithakdev.com` (not just the subdomain). Verify it with the DNS TXT record it shows; Claude can add the record in Cloudflare. One Domain property covers the portfolio, Toolglass and every other subdomain.
- [ ] Submit `https://toolglass.ajithakdev.com/sitemap.xml` under Sitemaps.
- [ ] Bing Webmaster Tools: at https://www.bing.com/webmasters choose "Import from Google Search Console". Bing also feeds DuckDuckGo and Yahoo.
- [ ] URL Inspection on `https://toolglass.ajithakdev.com/` and the 5 most useful tools (image compressor, QR code, password, JSON, word counter), then "Request indexing" on each.

## Release checklist

A patch release needs only "Every release". A release that adds, removes or renames a tool needs both sections.

### Every release

- [ ] CI is green (`npm test` includes the SEO tests).
- [ ] After the tag deploys, the live pages return their own title:
  ```sh
  for p in "" tools/ about tools/json tools/image-compress; do curl -s https://toolglass.ajithakdev.com/$p | grep -o '<title>[^<]*</title>'; done
  ```
- [ ] Changed a tool's description in `catalog.ts`? Keep the full description under about 160 characters where you can, and say what the tool does in the words people search for.

### New, removed or renamed tool

- [ ] New tool: give it a `replaces` value in `catalog.ts` (the site or app people use today). Nothing else is needed for SEO: the page, sitemap entry and meta come from the catalog.
- [ ] Removed or renamed slug: GitHub Pages has no redirects. Keep the old slug working by leaving an alias route, or accept the 404 only if nobody linked to it.
- [ ] Resubmit the sitemap in Search Console and "Request indexing" on the new page. Google does not read IndexNow.
- [ ] Link preview: paste the URL into https://www.opengraph.xyz/ and check the title and image.
- [ ] Lighthouse SEO score is 100 on the new page, on mobile.

## Monthly check

Ten minutes in Search Console:

- Pages report: tools listed as "not indexed" that should be, and why.
- Performance: which searches bring people in. If people search for a word a tool's title or description doesn't use, add it.
- Core Web Vitals on mobile: anything "poor" or "needs improvement".
- Manual actions and Security issues: both empty.

## Ideas not done yet

- One Open Graph image per tool, generated at build time.
- A short "How to use" and "Is my file uploaded?" section on each tool page.
- "Alternative to iLovePDF / TinyPNG / Smallpdf" comparison pages.
- IndexNow ping after each deploy (Bing and others), like the portfolio does.

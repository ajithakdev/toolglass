# Toolglass redesign plan

Written 2026-10-17. Owner decisions are recorded at the bottom. Progress is tracked in `docs/STATE.md`; this file is the plan and changes only when the plan changes.

## Goal

One bookmark that replaces the small extensions, paid apps, and ad-heavy single-purpose sites people use every week. It should work for developers and for people who never open a terminal. Everything runs in the browser, nothing is uploaded, and it is free.

How we know it worked:

- A non-technical visitor finds the tool they came for in under 10 seconds from the home page or search.
- Every tool page is reachable by a clean URL, indexed on its own, and usable offline after the first visit.
- Tool pages stay fast: under 100 KB of JS (gzip) before the tool's own chunk, LCP under 1.5 s on a mid-range phone. The 3D home page loads its WebGL after first paint.
- Zero third-party requests. The home page proves it live.

## Design direction

This brief is self-authored under explicit creative delegation ("work completely to ur wish").

- **Vibe:** calm, precise, luminous. A lit glass workbench. References: Braun product photography, a laboratory bench under soft light, the refraction in a glass paperweight.
- **Aesthetic family:** premium-minimal with a playful edge. Glass layers, soft colored light, crisp type. No clay dioramas, no stock "AI" gradients.
- **Structure:** distinct scenes, not one continuous camera flight. The home page is a story; the tools hub and tool pages are quiet work surfaces.
- **Energy curve (home):** calm hero → a loud moment where clutter collapses → calm, useful catalog → confident ending.
- **The peak:** the scene where a pile of browser tabs, extension icons, and subscription receipts falls into the glass and comes out as one clean toolbar.
- **Tell-someone sentence:** "It's the site where all those little tools you pay for or install extensions for are just there, free, and nothing leaves your browser."
- **Signature move:** a live privacy meter. It counts requests this tab has made to other servers since load, using `PerformanceObserver`, and shows the real number: 0. It is a fact, not a claim.
- **Visuals:** made in code (three.js, SVG, CSS). Free stock footage only where it clearly earns its place and its license allows it. No paid generation.

### Theme

Three modes: Auto (follows the OS live), Light, Dark. The control is a three-way segmented switch. Auto is the default and is not stored, so a fresh visitor always follows the OS.

### Motion

- One motion scale (durations and easings as CSS variables and framer-motion presets).
- Animation is time-based (rAF delta or CSS), so it runs smoothly at 60, 90, 120, or 144 Hz without speeding up.
- `prefers-reduced-motion` gives a still composition that keeps depth, not a blank page.
- The WebGL scene pauses when off-screen or when the tab is hidden, and drops resolution on low-power devices.

## Information architecture

```
/                     Home (story + search + featured)
/tools                Tools hub (search, filters, favorites, recents)
/tools/<slug>         One tool
/about                What Toolglass is, privacy model, open source, how to contribute
*                     404 with tool suggestions
```

Tool metadata gains: `category`, `audience` (`everyone` | `developers` | `designers` | `writers` | `students`), `keywords` (for search and SEO), and `replaces` (what it saves you from, e.g. "TinyPNG", "a PDF-merge site"). Categories:

| Category | Examples |
|---|---|
| Images | compress, convert (JPG/PNG/WebP/AVIF), resize, crop, strip EXIF, favicon set, palette from image, Base64 image |
| PDF & Documents | merge, split, reorder, images → PDF, PDF → images |
| Text & Writing | word/character counter, case converter, slug, find & replace, diff, lorem, Markdown, notepad, text-to-speech |
| Everyday Calculators | units, percentages, age and date difference, loan/EMI, tip split, BMI |
| Time | world clock and time-zone converter, timestamp, stopwatch, timer, pomodoro, countdown |
| Media & Device | screen recorder, webcam/mic test, QR code, audio trim |
| Security & Privacy | password, passphrase, hash (text and file), JWT, X.509, encrypt a note (AES-GCM) |
| Developers | JSON, JSON→TS/Zod, YAML/TOML, CSV↔JSON↔SQL, regex, cron, URL, Base64, UUID v4/v7, NanoID, ObjectId, API tester, HTTP status, MIME types, CSP builder, chmod, subnet/CIDR, SQL formatter, number bases, keycode, HTML entities, Unicode inspector, SVG→JSX, Git helper |
| Design | color (incl. OKLCH), contrast checker, CSS units, gradient, shadow, Open Graph preview |

## Architecture changes

- **Routing:** `BrowserRouter`. GitHub Pages serves a generated `404.html` that restores the path. Old `/#/tools/<slug>` links redirect to `/tools/<slug>`.
- **Per-tool HTML:** a post-build script writes `dist/tools/<slug>/index.html` with that tool's title, description, canonical URL, and OG tags, so each page is indexed on its own. It also writes `sitemap.xml` from the registry.
- **Hosting:** `public/CNAME` = `toolglass.ajithakdev.com`, Vite `base: '/'`. Needs a DNS record from the owner (see Phase 6).
- **Registry:** stays the single source of truth. Landing categories, the hub, the palette, the sitemap, and prerendered pages all read it. No second slug list.
- **Tool shell:** `ToolLayout` grows into a shell with breadcrumbs, favorite button, share, "replaces" note, related tools, and a keyboard-shortcut hint. Tools keep their bodies.
- **Styling:** stays inline styles plus CSS variables (house rule). Shared style objects move to `src/styles/` to cut repetition (issue #69, without CSS modules).
- **Heavy dependencies** are lazy-loaded per tool, never in the main chunk: `three` (home only), `pdf-lib` (PDF tools), and image codecs if `canvas.toBlob` is not enough.
- **CurlTool split** (issue #64) into parser, request runner, history, and UI modules.

## Phases

Each phase is one branch and one PR. Each must pass lint, build, unit tests, and (from Phase 5) Playwright, before the next starts.

### Phase 0: Foundation (`redesign/foundation`)

1. This plan, plus updates to `AGENTS.md`/`CODEMAP.md` for new conventions.
2. Registry metadata: `category`, `audience`, `keywords`, `replaces`. A test that every tool has them.
3. Clean URLs: `BrowserRouter`, `404.html` fallback, legacy hash redirect, CNAME, `base: '/'`.
4. Post-build prerender of per-tool HTML and generated sitemap.
5. Three-mode theme (Auto/Light/Dark) with a test.

Done when: every existing tool opens at `/tools/<slug>`, old hash links redirect, `dist/tools/*/index.html` exist with correct meta, and theme modes work.

### Phase 1: Design system (`redesign/design-system`)

1. New tokens in `index.css`: surfaces (3 glass depths), ink scale, accent set, radii, shadows, blur, motion durations and easings. Light and dark both checked for WCAG AA contrast.
2. Rebuilt primitives: Button, Field, TextInput, TextArea, Select, Slider, Toggle, Output, CopyButton, Card, Segmented control, Kbd, Badge, Tabs.
3. New app shell: top bar with search trigger, theme switch, and nav (Home, Tools, About); mobile nav that does not squish (fixes #22). Footer with the privacy meter.
4. Motion presets and reduced-motion handling in one module.

### Phase 2: Home, Tools hub, About (`redesign/pages`)

1. Home, built with the scroll-craft method (brief, feeling curve, device variety, verification screenshots):
   - Act 1, hero: three.js glass prism refracting tool glyphs; headline; a working search field.
   - Act 2, the problem: tabs, extension icons, and subscription receipts pile up on scroll.
   - Act 3, the peak: the pile falls into the glass and becomes one toolbar.
   - Act 4, for everyone: role switcher (Everyone, Developers, Designers, Writers, Students) shows real tools for each.
   - Act 5, proof: the live privacy meter and an offline badge.
   - Act 6, ending: "Bookmark it" with the shortcut for the visitor's OS, and install as an app.
2. Tools hub: instant search (title, keywords, "replaces"), category and audience filters, favorites with drag-to-reorder (#35), recents, usage counts (#36).
3. About page, including the privacy model and a list of everything stored locally (a separate /privacy page was folded in here).
4. Command palette: same search as the hub, screen-reader fixes (#68), shortcut cheatsheet (#34), global "copy last output" (#43).

### Phase 3: Migrate existing tools (`redesign/tools-migrate`)

1. All 17 tools onto the new shell and primitives.
2. Fix mobile layout bugs in the API Tester (#23, #24) and split `CurlTool.tsx` (#64).
3. Small requested upgrades: timestamp all formats (#39), bulk passwords (#38), file hashing (#42), SHA-3 (#25), URL batch mode (#28), JSON schema validation (#27), JWT RS256/ES256 (#37), UUID v7 (#60).

### Phase 4: New tools in waves (`tools/wave-N`)

- **Wave 1, everyday (biggest reach):** image compress/convert/resize, strip EXIF, PDF merge/split, word counter, case converter (#76), unit converter, percentage calculator, world clock and time zones, stopwatch/timer/pomodoro, screen recorder, text diff (#58), notepad.
- **Wave 2, developer staples:** cron explainer (#57), CSV↔JSON↔SQL (#85), YAML/TOML (#70), SQL formatter (#77), HTTP status (#71), number bases (#96), HTML entities (#98), list transformer (#97), keycode inspector (#101), Unicode inspector (#83), chmod (#82), subnet (#78), MIME types (#99), JSON→Zod (#62).
- **Wave 3, design and more:** OKLCH and contrast (#61), CSS units (#74), SVG→JSX (#73), favicon generator (#81), Base64 image (#103, #26), Markdown table (#104), OG preview (#84), CSP builder (#102), X.509 (#80), Git helper (#100), mock data (#59), token counter (#63).

Each new tool ships with a unit test for its logic and a registry entry with metadata.

### Phase 5: Quality (`quality/ci`)

1. Playwright end-to-end tests for core flows (#66): home search → tool, theme modes, offline reload, one test per category.
2. CI: Node 20/22 matrix and a Lighthouse budget (#67, #32).
3. CHANGELOG and release notes (#75).
4. Accessibility pass: keyboard-only run through every page, axe in Playwright.

### Phase 6: Launch

1. Owner adds DNS: `CNAME toolglass → ajithakdev.github.io`, then sets the custom domain in the repo's Pages settings and enables "Enforce HTTPS".
2. Verify the site at `https://toolglass.ajithakdev.com/`, sitemap submitted, old `ajithakdev.github.io/toolglass/` redirects.
3. Close finished issues with a link to the PR; close duplicates; v1.0.0 release.

### Later

Browser extension (#105) once the site is stable.

## Issue housekeeping

Duplicates to close in favor of the newer, fuller issue: #29 → #57, #30 → #58, #31 → #59, #32 → #67, #26 → #103. Already fixed: #41 (ErrorBoundary shipped in `31ca1ef`). Each issue is closed by the PR that resolves it, with a comment.

## Owner decisions (2026-10-17)

- three.js allowed, lazy-loaded, home page only.
- Visuals: code-made, plus free stock or libraries where useful. No paid generation.
- `fix/known-issues` goes up as a PR (#109) for the owner to merge.
- Clean URLs and the custom domain `toolglass.ajithakdev.com`.
- Creative direction delegated to the implementer. GitHub issues may be managed (closed, commented) by the implementer.

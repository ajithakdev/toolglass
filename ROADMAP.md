# Toolglass — 10-Day Enhancement Plan

One small, shippable feature per day. Each day = single commit, single PR, ≤ ~150 LOC, no new heavy deps. Ship 1 feature → 10 features → noticeably better product in 10 days.

Recommended order: low-risk visual wins first, then UX, then content, then power-user features. Resist scope creep.

---

## Day 1 — Cmd-K command palette

**What:** Press `⌘K` / `Ctrl+K` anywhere → search box → jump to any tool by name. Arrow keys + enter to select.

**Why:** Single biggest UX upgrade for a multi-tool site. Power users never use the landing page again.

**Where:**
- New `src/components/CommandPalette.tsx`.
- Mount once in `src/App.tsx`.
- Driven by `tools/registry.ts` (already the source of truth).
- Global `keydown` listener for `(meta|ctrl)+k`.

**Acceptance:**
- Opens/closes with `⌘K`, `Esc`, click-outside.
- Filters tools as you type (substring match on title + short).
- Up/Down moves selection, Enter navigates, mouse hover updates selection.
- Animated with framer-motion (scale + fade), backdrop blur.
- Focus trap; restores focus on close.

**Skip:** Recent items, fuzzy ranking — just substring. Add later if needed.

---

## Day 2 — Persisted dark mode toggle

**What:** Sun/moon toggle in nav. Stores preference in `localStorage`. Defaults to `prefers-color-scheme`.

**Why:** Devs expect dark mode. Repo already has design tokens — flipping them is mechanical.

**Where:**
- Extend `src/index.css`: define `:root[data-theme="dark"]` overrides for every existing token (`--bg-*`, `--ink*`, `--glass-*`, `--line`).
- New `src/hooks/useTheme.ts` — reads `localStorage` once, syncs `data-theme` on `<html>`, listens for OS change while no manual override.
- New `src/components/ui/ThemeToggle.tsx` — small icon button in `App.tsx` nav.

**Acceptance:**
- Toggle flips instantly (CSS variables, no remount).
- Survives reload.
- Respects OS until user toggles, then sticks.

**Skip:** Auto-schedule (sunset/sunrise), per-tool themes.

---

## Day 3 — URL-shareable tool state

**What:** Tool options serialize to query string. Paste a Toolglass URL and the tool opens with the exact settings. Example:
`/#/tools/password?len=32&u=1&l=1&n=1&s=0`

**Why:** Tiny implementation, massive product moment — "share my password preset", "share this exact JWT payload", "send this JSON to a coworker pre-formatted".

**Where:**
- New `src/hooks/useUrlState.ts` — `useUrlState<T>(key, defaultVal, parse, stringify)`. Wraps `useSearchParams` from react-router.
- Migrate `PasswordTool`, `NanoIdTool`, `HashTool`, `Base64Tool` to read initial state from URL, write back on change (debounced).
- Add a "Share" button next to Reset → copies the current URL with state.

**Acceptance:**
- Refresh keeps state.
- Back button works.
- Sensitive fields (JWT secret, hash input contents) **excluded** — explicit allowlist of which keys serialize.

**Skip:** Compression / base64-encoded blob. Plain query string is fine for now.

---

## Day 4 — Vitest unit tests for the security-critical paths

**What:** Real tests for password CSPRNG + base64 round-trip + JWT signature shape + objectid format. Wire into CI.

**Why:** Without tests, the next refactor silently breaks crypto. These four are the cheap, high-value ones.

**Where:**
- Add devDeps: `vitest`, `@vitest/coverage-v8`, `jsdom`.
- Add `test` and `test:coverage` scripts in `package.json`.
- Add Vitest block to `vite.config.ts` (`environment: 'jsdom'`).
- New `src/tools/password/password.test.ts` — length bounds, class coverage, no `Math.random`, distribution sanity (10k samples, every charset char appears).
- New `src/tools/base64/base64.test.ts` — UTF-8 round-trip ("héllo 🌍").
- New `src/tools/jwt/jwt.test.ts` — output has 3 dot-separated parts, header decodes to valid JSON with `alg: HS256`.
- New `src/tools/objectid/objectid.test.ts` — 24 hex chars, timestamp slice is recent, counter monotonic.
- Extend `.github/workflows/ci.yml`: add `- run: npm test`.

**Acceptance:** Tests pass locally and in CI. Coverage badge optional.

**Skip:** Component tests, e2e.

---

## Day 5 — A11y pass + keyboard polish

**What:** Make every tool actually usable without a mouse and announce to screen readers.

**Why:** A11y is two hours of work for a permanent quality signal. Most tools are 80% there already.

**Where:**
- Add `<main>` landmark with `id="main"` in `App.tsx`. Add `Skip to content` link at top of `Shell`.
- Tool pages: ensure each has exactly one `<h1>` and visually grouped controls use `<fieldset>` / `<legend>` (toggles in password tool).
- `Output` component: wrap value in `<output role="status" aria-live="polite">` so generated results are announced.
- `Toggle` already `role="switch" aria-checked`. Verify rest of switches/sliders have visible focus rings (`:focus-visible` already in tokens — audit overrides).
- Run `axe-core` (browser extension or `@axe-core/playwright` if testing) — log issues, fix the easy ones.

**Acceptance:** Tab through every tool with keyboard only. Generated output announces. Lighthouse a11y ≥ 95.

**Skip:** RTL support, i18n.

---

## Day 6 — Recent tools row on the landing page

**What:** Top of `Landing.tsx`, show the last 3 tools the user opened. Stored in `localStorage`.

**Why:** Brings the most-used utilities to a single click on return visits. Small change, visible every session.

**Where:**
- New `src/hooks/useRecentTools.ts` — array of slugs, capped at 3, push-on-visit (newest first, dedupe).
- Call it inside `ToolPage.tsx` on mount.
- New section above the main grid in `Landing.tsx` — only renders if `recents.length > 0`. Reuse the existing card component (extract one if not already).

**Acceptance:**
- Visiting a tool moves it to position 0.
- Refreshing the landing shows the row.
- Hidden on first-ever visit.

**Skip:** Server sync, multi-device.

---

## Day 7 — Three new high-value tools

**What:** Add three small tools that complete the dev-utility set:
1. **JWT Decoder** — paste a JWT, see header + payload + expiry pretty-printed, with red highlight if `exp` is past.
2. **URL Encoder/Decoder** — `encodeURIComponent` ⇄ `decodeURIComponent`. Same UX shape as the Base64 tool.
3. **Color Converter** — hex ⇄ rgb ⇄ hsl, single input, live three-way preview.

**Why:** Highest-frequency missing tools. Each is genuinely ~30 lines of logic. Registry-driven architecture rewards this — three folders + three registry lines and you're done.

**Where:**
- `src/tools/jwt-decode/JwtDecodeTool.tsx`
- `src/tools/url/UrlTool.tsx`
- `src/tools/color/ColorTool.tsx`
- Three entries in `src/tools/registry.ts`.

**Acceptance:** All three tools follow the existing `ToolLayout` + `Output` patterns. Lazy-loaded.

**Skip:** Anything more exotic (regex tester, JSON-to-TS — save for later).

---

## Day 8 — PWA + offline support

**What:** Installable as an app on phone/desktop. Works fully offline after first visit.

**Why:** The whole product is already client-side — making it offline-installable is a free 10x credibility boost and the user-visible "Install" prompt is a marketing moment.

**Where:**
- Add dev dep `vite-plugin-pwa`.
- Configure in `vite.config.ts` with `registerType: 'autoUpdate'`, manifest (name, short_name "Toolglass", theme_color from current pastel, icons generated from `favicon.svg`).
- Generate 192/512 PNG icons in `public/`.
- Verify `npm run build` outputs `manifest.webmanifest` + `sw.js`.
- Add an "Install" prompt button in nav that shows when `beforeinstallprompt` fires.

**Acceptance:** Lighthouse PWA check passes. Plane mode → site still loads.

**Skip:** Push notifications, background sync.

---

## Day 9 — OG image + SEO basics

**What:** Social preview card, JSON-LD structured data, sitemap.

**Why:** Currently sharing a Toolglass link in Slack/Twitter shows nothing. One image + ten lines of `<meta>` and you get a branded card every time.

**Where:**
- Generate `public/og-image.png` (1200×630) — Toolglass wordmark on the pastel gradient. Can hand-design once in Figma or generate with a Vite plugin.
- Extend `index.html` `<head>`: full Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type=website`) + Twitter cards (`twitter:card=summary_large_image`).
- JSON-LD `WebApplication` schema in `<head>` (name, description, url, applicationCategory: DeveloperApplication, offers: free).
- `public/sitemap.xml` listing landing + each tool URL.
- `public/robots.txt` allowing all, pointing to sitemap.

**Acceptance:** Paste URL into Slack / X — preview card shows. Lighthouse SEO ≥ 95.

**Skip:** Per-tool dynamic OG images (later, with @vercel/og style approach).

---

## Day 10 — Tool-specific telemetry-free analytics

**What:** Tiny in-memory + localStorage counter: "your password generator has produced 42 passwords." Show as a quiet stat at the bottom of each tool.

**Why:** No external analytics (the whole pitch is "no data leaves your browser"), but a personal usage counter is a delightful touch that costs nothing and reinforces the privacy story.

**Where:**
- New `src/hooks/useToolStats.ts` — `{ count, increment }` keyed by tool slug, persisted in localStorage.
- Tool components call `increment()` on every successful generate/encode/format.
- Add a minimal footer line inside `ToolLayout`: "You've used this tool N times — all on your device."
- Settings link (optional) to clear stats.

**Acceptance:**
- Counter persists across reloads.
- Reflects only locally; no network calls (verify via DevTools Network tab).

**Skip:** Cross-device sync, "most used tool" dashboard.

---

## Operating principle

- One PR per day. Squash-merge.
- If a feature won't fit a day, scope it down — never roll it over.
- Don't refactor while adding features. If something needs a rewrite, file a separate issue.
- Update this file as you ship: prefix each day with ✅ when merged.

---

## After day 10 — parking lot (pick whichever feels exciting next)

- Regex tester with live highlighting
- cURL → fetch converter
- JSON-to-TypeScript type generator
- Lorem ipsum generator
- QR code generator
- Markdown ⇄ HTML
- CSS unit converter
- Cron expression explainer
- diff viewer (text/JSON)
- bcrypt / argon2 cost estimator
- API mock data generator
- Per-tool dynamic OG images
- E2E tests with Playwright
- i18n (Spanish / Hindi / Tamil)

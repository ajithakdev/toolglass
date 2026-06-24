# Toolglass — 20-Day Enhancement Plan

One small, shippable feature per day. Each day = single commit, single PR, ≤ ~150 LOC, no heavy deps unless explicitly noted.

**Days 1–10** build the platform: UX polish, theme, URL state, tests, a11y, recents, three core utilities, PWA, SEO, local stats.
**Days 11–20** scale the product: six new high-value tools, then perf/CI guardrails, then a real v1.0.0 launch.

Recommended order: low-risk visual wins first, then UX, then content, then power-user features. Resist scope creep.

---

## ✅ Day 1 — Cmd-K command palette

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

## ✅ Day 2 — Persisted dark mode toggle

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

## ✅ Day 3 — URL-shareable tool state

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

## ✅ Day 4 — Vitest unit tests for the security-critical paths

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

## ✅ Day 5 — A11y pass + keyboard polish

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

## Day 11 — Regex tester

**What:** Paste a regex + flags + test string → highlighted matches + capture groups table + per-match index.

**Why:** Top-3 most-Googled dev utility. Pure client-side with `RegExp` — zero dependencies.

**Where:**
- `src/tools/regex/RegexTool.tsx`
- Inputs: pattern, flags (`g`, `i`, `m`, `s`, `u`), test string.
- Render the test string with `<mark>` wrapping each match; below it a table of `[match, index, ...groups]`.
- Try/catch on `new RegExp(...)`; show error in red under the pattern input.
- Registry entry; icon `🔍`.

**Acceptance:** Invalid regex never crashes the page. Global flag actually shows all matches.

**Skip:** PCRE features (lookbehind workarounds), replace mode (Day 12).

---

## Day 12 — JSON ⇄ TypeScript type generator

**What:** Paste JSON → emit a TypeScript `interface` / `type` for it. Toggle interface-vs-type, optional-undefined detection from arrays.

**Why:** Devs paste API responses into this kind of tool daily. Saves a lot of typing.

**Where:**
- `src/tools/json-to-ts/JsonToTsTool.tsx`
- Pure function `inferType(value, name)` recursive:
  - primitives → `string | number | boolean | null`
  - array → union of element types, deduped
  - object → nested interface, name from key (PascalCase)
- Sub-types emitted above the root with sane names; collision suffixes (`User`, `User2`).
- Registry entry; icon `🧾`.

**Acceptance:** Round-trips a moderately nested JSON sample. Produces compilable TS (test by pasting into TS playground).

**Skip:** Zod / Yup output (parking lot).

---

## Day 13 — cURL → fetch converter

**What:** Paste a `curl …` command → emit a JS `fetch(…)` snippet (and a Node `fetch` variant). Handles `-X`, `-H`, `-d`/`--data`, `--data-raw`, `-u`, `--form`, single-line and backslash-wrapped multi-line input.

**Why:** Every API doc page on the planet ships curl examples; devs translate them into fetch all day.

**Where:**
- `src/tools/curl-to-fetch/CurlTool.tsx`
- Small tokenizer that respects single/double quotes, line continuations, and `\$` escapes. Then build the fetch options object.
- Registry entry; icon `📡`.

**Acceptance:** Round-trip a Stripe-docs-style curl example correctly.

**Skip:** curl flags like `--compressed`, `--cookie-jar`, certificate options.

---

## Day 14 — QR code generator

**What:** Text/URL → live SVG QR with size + error-correction-level controls. Download as SVG/PNG.

**Why:** Common utility, visible/photographable result — great social-share moment.

**Where:**
- `src/tools/qr/QrTool.tsx`
- Add one tiny dep: [`qrcode`](https://www.npmjs.com/package/qrcode) (no extra runtime cost, ~13 KB gz, no deps).
- Render to `<canvas>` + offer SVG variant for export.
- Registry entry; icon `▦`.

**Acceptance:** Generated QR scans correctly with a phone camera at default size.

**Skip:** Logo overlay, gradient colors (parking lot).

---

## Day 15 — Markdown ⇄ HTML preview

**What:** Split view: Markdown on the left, rendered HTML on the right, synced scroll. "Copy HTML" button.

**Why:** Useful and shows off the glass aesthetic well (two frosted panels side by side).

**Where:**
- `src/tools/markdown/MarkdownTool.tsx`
- Add dep: [`marked`](https://www.npmjs.com/package/marked) + [`dompurify`](https://www.npmjs.com/package/dompurify) for safe HTML output (XSS sanitization).
- On mobile, stack vertically instead of split.
- Registry entry; icon `📝`.

**Acceptance:** Pasting an arbitrary `README.md` renders correctly. `<script>` tags from input are stripped (verify).

**Skip:** GFM tables/checkboxes if `marked` defaults don't cover; live HTML→MD direction.

---

## Day 16 — Cron expression explainer

**What:** Paste `*/5 * * * *` → human description ("Every 5 minutes") + next 5 fire times in user's timezone. Validate on type.

**Why:** Cron is universally hated; this tool gets bookmarked instantly.

**Where:**
- `src/tools/cron/CronTool.tsx`
- Add dep: [`cron-parser`](https://www.npmjs.com/package/cron-parser) and [`cronstrue`](https://www.npmjs.com/package/cronstrue).
- Inputs: cron string, optional timezone select (default = browser TZ).
- Outputs: human string, table of next 5 ISO timestamps.
- Registry entry; icon `🗓️`.

**Acceptance:** Handles 5-field and 6-field (with seconds) variants. Invalid input → red error, no crash.

**Skip:** Quartz-specific syntax beyond what `cron-parser` supports.

---

## Day 17 — Diff viewer (text / JSON)

**What:** Two text panels (Original / Modified) → unified or side-by-side diff with line additions/removals highlighted.

**Why:** Saves trips to diffchecker.com. A "JSON diff" mode that pre-formats both sides before diffing is the killer feature.

**Where:**
- `src/tools/diff/DiffTool.tsx`
- Add dep: [`diff`](https://www.npmjs.com/package/diff) (`diffLines`).
- Toggle: Plain Text / JSON (latter `JSON.parse` + `JSON.stringify(_, null, 2)` both inputs before diffing).
- Custom renderer using existing pale palette (green tint for adds, red tint for removes, both soft).
- Registry entry; icon `🪞`.

**Acceptance:** Empty inputs handled. JSON mode catches structural diffs even when key order differs (because of canonicalization).

**Skip:** Inline char-level diff, word-level diff.

---

## Day 18 — Lorem ipsum + mock data generator

**What:** Two modes in one tool:
1. **Lorem** — generate N paragraphs / sentences / words, classic or "hipster" set.
2. **Mock data** — pick a JSON schema (`{ name, email, avatar, address, company }`), generate N rows, copy as JSON / CSV / TS array.

**Why:** Frontend devs use mocks constantly; bundling lorem in one tool keeps the registry tight.

**Where:**
- `src/tools/mock/MockTool.tsx`
- Add dep: [`@faker-js/faker`](https://www.npmjs.com/package/@faker-js/faker) (tree-shakable; only import the modules used to keep bundle small).
- Tab UI inside the tool; CSV serializer ~20 lines.
- Registry entry; icon `🧪`.

**Acceptance:** N=100 rows generates in <100ms. Same seed (URL state from Day 3 if landed) gives same output.

**Skip:** Schema editor UI — hardcode a few useful schemas; user can request more later.

---

## Day 19 — CI matrix + Lighthouse budget

**What:** Tighten CI:
- Build/test on Node 20 *and* 22.
- After build, run Lighthouse (via `treosh/lighthouse-ci-action`) against `npm run preview` and fail PR if performance < 90 or a11y < 95.
- Cache `node_modules` more aggressively.

**Why:** Prevents perf regressions silently shipping. Locks in the work from Days 4 and 5.

**Where:**
- Update `.github/workflows/ci.yml`:
  - `strategy.matrix.node: [20, 22]`.
  - New job `lighthouse` that depends on `verify`, boots `vite preview` on a port, runs `lhci autorun`.
- New `lighthouserc.json` at repo root with the budgets.

**Acceptance:** PR with deliberately broken perf (huge image) fails the lighthouse job. Two Node versions both pass.

**Skip:** Multi-browser e2e (parking lot).

---

## Day 20 — Polish pass + v1.0.0 release

**What:** Spend the day on small visible quality wins, then cut a real release.

**Includes:**
- 404 page with the same glass aesthetic + "Back to tools".
- Loading skeletons in tool `Suspense` fallbacks (replace the plain "Loading…" text).
- Custom scrollbars on `Output` (webkit + firefox).
- Hover gradient sweep on the landing cards (subtle).
- Footer: link to ROADMAP.md, GitHub stars badge, version number from `package.json`.
- Tag `v1.0.0`, write a `CHANGELOG.md` covering days 1–20, draft a GitHub Release with screenshot / video.
- Post launch: "Show HN", `r/webdev`, Twitter/X, Product Hunt scheduled.

**Acceptance:**
- `v1.0.0` tag exists; release page reads as a real announcement.
- README badges all green.

**Skip:** Anything new. Day 20 is consolidation, not features.

---

## Beyond 20 — parking lot

Pick freely whenever inspiration strikes:

- Zod / Yup schema output from JSON (Day 12 extension)
- bcrypt / argon2 cost estimator (WASM)
- HTTP status code lookup
- IP / CIDR calculator
- JWT signature verifier (HS256 + RS256 with public key)
- HMAC generator (extends hash tool)
- Image → base64 data URI
- URL parser (split into protocol/host/path/query)
- CSS unit converter (px/rem/em/%)
- Color palette generator (extract from image, generate shades)
- SVG → JSX converter
- TOML ⇄ YAML ⇄ JSON converter
- Per-tool dynamic OG images (@vercel/og style)
- E2E tests with Playwright
- i18n (Spanish / Hindi / Tamil)
- Command palette: fuzzy search + recent boost
- "Pinned tools" — drag to reorder on landing
- Keyboard shortcut cheatsheet modal (`?` to open)
- Shareable workspaces — multiple tool states bundled in one URL
- WebAuthn passkey playground
- HTTP request runner (CORS-restricted; useful inside extension)

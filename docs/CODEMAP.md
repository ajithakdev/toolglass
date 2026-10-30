# Toolglass code map

Mapped at commit: `2a3c43b` (tool sidebar and layout route, 2026-10-31). Earlier note: `511327b` plus branch `test/138-timestamp-json-to-ts` (2026-10-26). Sections not touched by that branch were last checked at `6811fb6`. Timestamp and JSON-to-TS sections updated at `41d6999` (#196, 2026-10-31).

Check for drift before trusting this file: `git diff --stat c7cd085..HEAD -- src`

Numbers in parentheses are line counts. Use them to judge read cost.

## Architecture in one screen

```
index.html
  src/main.tsx (17)            legacy /#/ redirect, StrictMode > BrowserRouter > App
    src/App.tsx                MotionConfig > ToastProvider > Shell (header, main, footer) > ErrorBoundary > Routes
      /                        pages/Home.tsx
      /tools                   components/ToolsLayout.tsx (layout route: ToolRail + Suspense > Outlet)
        index                  pages/ToolsHub.tsx
        :slug                  pages/ToolPage.tsx  -> toolBySlug(slug) -> lazy Component
      /about                   pages/About.tsx
      *                        pages/NotFound.tsx
    CommandPalette             sibling of Shell, opened by Ctrl/Cmd+K
```

- Routing is `BrowserRouter` with clean URLs (`/tools/<slug>`). `main.tsx` rewrites old `/#/...` links. Hosting is GitHub Pages on `toolglass.ajithakdev.com` (`public/CNAME`); the build writes `tools/<slug>.html` per tool and a `404.html` SPA fallback.
- Tool data lives in `src/tools/catalog.ts` (plain data: title, description, category, audience, keywords, replaces, optional `wide`). `src/tools/registry.tsx` adds icon, tint, and lazy component per slug. Everything (pages, palette, build-time SEO pages, sitemap) reads these; there is no other slug list.
- Every tool is a default-export component loaded with `React.lazy`. Each tool wraps its own body in `<ToolLayout>`, which reads the slug from the route and renders breadcrumb, title, description, icon, favorite and Share actions, a privacy note, usage count, and related tools.
- Theme: modes Auto/Light/Dark. `data-theme="light|dark"` on `<html>`, set first by an inline script in `index.html` (no flash), then by the shared store in `useTheme`. All colors are CSS variables in `src/index.css`.

## Files

### Root

| File | Notes |
|---|---|
| `package.json` | Scripts: dev, build, preview, lint, test, test:coverage. `"type": "module"`. Deploys only through CI. |
| `vite.config.ts` | `base: '/'`. PWA plugin (autoUpdate, precaches woff2). `seoPages` plugin writes per-page HTML, `404.html`, and `sitemap.xml` from `src/seo.ts` after build. Vitest config: jsdom, globals, `src/**/*.test.{ts,tsx}`. |
| `tsconfig.json` | strict, noUnusedLocals, noUnusedParameters, `include: ["src"]`. |
| `eslint.config.js` (26) | Flat config. Several `react-hooks/*` rules turned off (set-state-in-effect, purity, refs, error-boundaries, set-state-in-render). |
| `index.html` | Content-Security-Policy meta, meta, OG tags, JSON-LD, pre-paint theme script. Fonts are self-hosted Geist and Geist Mono (see `index.css`). |
| `.github/ISSUE_TEMPLATE/` | Issue forms: `bug_report.yml`, `feature_request.yml`; `config.yml` turns off blank issues and links Discussions, SECURITY.md, and the site. Tool-request links in `ToolsHub.tsx` and `About.tsx` open `feature_request.yml` with `template=`. |
| `.github/workflows/ci-cd.yml` | `verify` job: `npm ci`, lint, build, test, upload Pages artifact. `deploy` job: Pages, only on a `v*` tag push or a manual run; it alone has `pages`/`id-token` write. |
| `scripts/gen-keccak-permute.py` | Prints the unrolled Keccak `permute` for `src/tools/hash/hash.ts`. Only needed if that function is ever regenerated. |
| `public/` | favicon.svg, icon-192.png, icon-512.png, og-image.png, robots.txt, sitemap.xml. |
| `README.md` (112), `ROADMAP.md` (442), `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/CONTRIBUTING.md` (96) | Human docs. ROADMAP is a 20-day plan; days 1-15 done, 16-20 open. |

### src core

| File | Exports | Notes |
|---|---|---|
| `App.tsx` | `default App` | Meta effect on navigation, Ctrl/Cmd+K handler, routes (`/`, `/tools` layout with index and `:slug` children, `/about`, `*`). `MotionConfig reducedMotion="user"`. |
| `main.tsx` (17) | none | Mount point. Redirects legacy hash URLs. |
| `seo.ts` | `SITE_URL`, `HOME`, `toolPage`, `allPages`, `applyMeta`, `applyMetaToDocument`, `sitemapXml` | Page-meta helpers. `applyMeta` rewrites HTML at build time; `applyMetaToDocument` updates title, description, social tags, and canonical on client-side navigation (App effect). Has a test. |
| `index.css` | none | Design tokens (canvas, ink, one accent, status, 3 glass surfaces, 3 elevations, type scale, 4px space scale, radii, motion), dark overrides, legacy aliases for old token names, base styles, ambient light (`body::before`) and grain (`body::after`), focus, scrollbars, `.glass`, `.container` (max `--container-max`, 1200px, 1440px on /tools via `Shell`), `.rail-item`, `.status-dot` (pulsing live dot, color via `--dot`), `.lift`, shell classes (`.nav-link`, `.nav-btn`, `.hide-sm`, `.skip-link`). |
| `lib/cn.ts` (3) | `cn(...parts)` | Joins truthy class names. |
| `lib/motionFeatures.ts` | default `domMax` | framer-motion features, loaded async by `LazyMotion` in `App.tsx`. |
| `lib/stored.ts` | `STORED` | Every storage key the About page lists and clears. `stored.test.ts` checks it against the storage table below. |
| `lib/motion.ts` | `EASE_OUT`, `spring`, `fadeUp`, `fade`, `stagger()` | Shared framer-motion presets. |
| `lib/platform.ts` | `IS_MAC`, `shortcut(key)` | Shortcut labels per OS. |
| `lib/search.ts` | `searchTools(tools, query)` | Word-AND ranking over title, keywords, replaces, description; accent-insensitive. Used by hub, hero search, and command palette. Has a test. |
| `lib/listStore.ts` | `createListStore(key, max)` | Shared localStorage-backed string list (`useSyncExternalStore`). Backs recents and favorites. Has a test. |
| `lib/privacy.ts` | `countThirdParty` | Used by `PrivacyMeter`. Has a test. |
| `view-transitions.d.ts` (10) | none | Types for `document.startViewTransition`. |

### src/pages

| File | Notes |
|---|---|
| `Home.tsx` | Six acts: `Hero` (copy, `HeroSearch`, lazy `GlassScene` with a logo poster until the first frame; module flag `sceneShown` skips the poster on return visits), `Collapse` (pinned 340vh scene: clutter cards pulled into the glass, then a real toolbar; `CollapseStill` for reduced motion), `ForEveryone` (audience switch + tool cards), `Proof` (live third-party request count), `Ending`. Scroll maps use `useRange` (JS-computed; see Gotchas). |
| `ToolsHub.tsx` | `/tools`. Search, category chips, audience switch (all in the URL: `q`, `cat`, `for`), favorites rail (drag to reorder), recents rail, grouped grid, empty state linking to a tool request. Has a test. |
| `About.tsx` | `/about`. Privacy model, live meter, table of everything stored (from `lib/stored.ts`) with a "clear all" button, open source links. |
| `ToolPage.tsx` (55) | `Loader` L9-30 (skeleton Suspense fallback). `ToolPage` L32-55: unknown slug renders `NotFound`, else `ErrorBoundary > Suspense > Component`. Calls `addRecent(slug)`. |
| `NotFound.tsx` (377) | Props `attemptedSlug`, `isToolNotFound`. Suggests tools; default suggestions hardcoded at L60 (`timestamp`, `jwt`, `password`). Has a test. |

### src/components

| File | Notes |
|---|---|
| `home/GlassScene.tsx` | Lazy three.js scene: two `MeshPhysicalMaterial` panes (transmission, dispersion) refracting a ring of glyph tiles and a light disc. Time-based animation, pointer parallax, scroll progress prop, pauses offscreen/hidden, one static frame for reduced motion, lower DPR on modest hardware. The built world is kept in a module variable between visits: a return visit attaches and draws it in a layout effect, before paint. The refracted plate sits inside the front pane so its edges never show. |
| `home/HeroSearch.tsx` | ARIA combobox over `searchTools`; Enter opens the highlighted tool. |
| `Shell.tsx` | `Shell`, `Kbd`. Sticky glass header (logo, Home/Tools nav with sliding indicator, search, install, theme switch), footer (privacy meter, usage-count opt-out, GitHub). |
| `ToolsLayout.tsx` | `ToolsLayout`. Layout route for `/tools` and `/tools/:slug`: renders `ToolRail` on >= 1024px, a `Suspense` (min-height 100vh fallback) around the `Outlet`, and idle-preloads favorites and recents. Router navigations are transitions, so the old page stays until the new chunk arrives. |
| `ToolRail.tsx` | `ToolRail`. Desktop sidebar (240px, 56px collapsed, state in `toolglass_rail_collapsed`): filter via `searchTools`, Favorites, Recent, collapsible categories. Category click also scrolls to `#cat-<id>` on `/tools`. Hover/focus preloads a tool's chunk. Has a test. |
| `Logo.tsx` | Two-pane glass mark; mirrors `public/favicon.svg`. |
| `PrivacyMeter.tsx` | Live count of requests to other origins via `PerformanceObserver` (Resource Timing), with a pulsing `.status-dot`. |
| `ToolLayout.tsx` (121) | Wraps every tool. Takes only `children`. Column is capped at 820px unless the tool's catalog entry has `wide: true`. Breadcrumb, Favorite and Share (copies `currentUrl()`), privacy note (API Tester gets its own wording), related tools. Backspace outside a text field navigates to `/tools`. |
| `CommandPalette.tsx` (463) | Props `open`, `onClose`. Filters `tools` from registry. Arrow keys, Enter, Escape. |
| `ErrorBoundary.tsx` (344) | Class component. Optional prop `toolTitle`. Has a test. |
| `ui/Button.tsx` (92) | `variant`: primary, ghost, soft. `size`: sm, md, lg. `full`. |
| `ui/Field.tsx` (327) | `Field` L4, `TextInput` L33, `TextArea` L53, `Select` L76, `Dropdown` L115, `Toggle` L236, `Slider` L300. |
| `ui/Output.tsx` (64) | Props `value`, `multiline`, `placeholder`, `trailing`, `label`. Result box with copy. |
| `ui/CopyButton.tsx` (55) | Props `value`, `label`, `size`, `disabled`. Copies, toasts, and calls `increment()` for the current slug. |
| `ui/GlassCard.tsx` (21) | `m.div` with `.glass` or `.glass-strong` (`strong` prop), `padding`. |
| `ui/Toast.tsx` (105) | `ToastProvider`, `useToast()` returns `{ push(message, kind?, id?) }`. Kinds: success, error, info. Passing an existing id updates that toast. |
| `ui/ToolCard.tsx` | Card for one `ToolMeta`: icon, title, short, "Instead of …" (`replaces`), usage count, favorite star (stretched link + separate button). `compact` variant. |
| `ui/ThemeToggle.tsx` | Auto / Light / Dark segmented switch. Circle reveal from the clicked button via View Transitions (skipped for reduced motion). |
| `ui/Segmented.tsx` | Generic radio-group pill with sliding indicator and arrow-key navigation. |

### src/hooks

| File | Signature | Notes |
|---|---|---|
| `useClipboard.ts` (34) | `useClipboard(resetMs = 1500)` returns `{ copy, copied }` | Falls back to `execCommand('copy')`. |
| `useTheme.ts` | `useTheme()` returns `{ mode, theme, setMode }`; `setThemeMode(mode)` | Module-level store (`useSyncExternalStore`). Auto is not stored and follows the OS live. Syncs across tabs. Has a test. |
| `useRecentTools.ts` (30) | returns `{ recents, addRecent }` | Keeps last 3 slugs. |
| `useToolStats.ts` (74) | `useToolStats(slug?)` returns `{ count, allStats, increment, enabled, toggleTelemetry }` | When disabled, counts are hidden and `increment` does nothing; stored counts are kept. Syncs across components with a `toolglass-telemetry` window event. |
| `useUrlState.ts` (~100) | `useUrlState(key, default, parse, stringify)` returns `[value, setValue]`; `intParam(min, max, fallback)`; `currentUrl()` (page URL plus every non-default value of mounted hooks, for Share) | Reads its param once on mount, then strips it from the address bar (one batched `replace` navigation). The URL is never written while editing; values live in an in-memory registry (no storage) that `currentUrl()` reads. A param arriving later (pasted link) is adopted and cleaned again. Use `intParam` as `parse` for numeric params so crafted links are clamped. Has a test. |

### src/tools

Catalog: `catalog.ts` exports `CategoryId`, `Audience`, `CATEGORIES`, `AUDIENCES`, `ToolInfo`, `catalog`. Registry: `registry.tsx` exports `ToolMeta` (ToolInfo + `icon`, `Component`, `preload`), `tools`, `toolBySlug`, `preloadTool`, `preloadWhenIdle`. `registry.test.ts` checks slugs, metadata, and that every catalog entry has visuals.

17 tools. Slug is the route and the registry key. Folder name differs from slug for one tool (`api-tester` lives in `curl-to-fetch/`).

| Slug | Component file | Logic file | Test | Notes |
|---|---|---|---|---|
| `password` | `password/PasswordTool.tsx` (134) | `password/password.ts` (71): `CHARSETS`, `PwdOptions`, `generatePassword`, `Strength`, `estimateStrength` | yes | URL state: `len`, `u`, `l`, `n`, `s`, `c` (count, 1-100). Bulk mode adds Download .txt. |
| `jwt` | `jwt/JwtTool.tsx` (130) | `jwt/jwt.ts` (81): `b64url`, `strToB64Url`, `signHS256`, `signJwt`, `generateKeyPair` | yes | HS256, RS256, ES256 via Web Crypto. Private keys live in component state only. |
| `uuid` | `uuid/UuidTool.tsx` (77) | `uuid/uuid.ts` (61) | yes | v4 and v7 (monotonic within a ms), inspector. Version in URL as `?v=7`. |
| `objectid` | `objectid/ObjectIdTool.tsx` (39) | `objectid/objectid.ts` (26): `MACHINE_ID`, `counter`, `objectId` | yes | |
| `nanoid` | `nanoid/NanoIdTool.tsx` (69) | `nanoid.ts` | yes | URL state: `size`, `count` (clamped). Generator uses 32-bit values with rejection sampling and ignores duplicate alphabet characters. |
| `hash` | `hash/HashTool.tsx` (173) | `hash/hash.ts` (198) | yes | Text and File modes. SHA-1/2 via `crypto.subtle`; SHA-3 and Keccak-256 in pure JS (`permute` is generated by `scripts/gen-keccak-permute.py`, ~50 MB/s). Files stream once, all algorithms, capped at 1 GB (`MAX_FILE_BYTES`), cancellable via `AbortSignal`. |
| `base64` | `base64/Base64Tool.tsx` (63) | `base64/base64.ts` (12): `encode`, `decode` | yes | Smallest complete tool. Use as the template. |
| `timestamp` | `timestamp/TimestampTool.tsx` (1012) | `timestamp.ts` (167): `isoWithOffset`, `rfc2822`, cron, `parseSmartDate`, `getDurationDescription`, `OFFSET_REGEX`, `applyOffset` | yes | Multi-mode. URL state: `mode`, `batch`, `cron`, `diffMode`, `d1`, `d2`, `db`, `do`. History in localStorage. `getRelativeTime` and `formatLocal` stay in the component. Section map below. |
| `json` | `json/JsonTool.tsx` (108) | `json/json.ts`: `errorLocation`, `validateSchema` (common JSON Schema keywords, no `$ref`) | yes | Format, minify, error line/column, schema validation. |
| `jwt-decode` | `jwt-decode/JwtDecodeTool.tsx` (75) | inline | no | |
| `url` | `url/UrlTool.tsx` (64) | inline | no | URL state: `mode`, `input`, `batch` (line-by-line). |
| `color` | `color/ColorTool.tsx` (222) | inline | no | Hex, RGB, HSL. |
| `regex` | `regex/RegexTool.tsx` (165) | inline | no | |
| `json-to-ts` | `json-to-ts/JsonToTsTool.tsx` (58) | `jsonToTs.ts` (80): `toPascalCase`, `inferType`, `jsonToTs` | yes | |
| `api-tester` | `curl-to-fetch/CurlTool.tsx` (35) + parts | `curl-to-fetch/curlSecurity.ts` (252) | yes (286) | HTTP client, cURL import, saved workflows, history. Split into several files; map below. |
| `qr` | `qr/QrTool.tsx` (109) | `qrcode` package | no | PNG and SVG export. |
| `markdown` | `markdown/MarkdownTool.tsx` | `render.ts`: `renderMarkdown(md, keepRemoteImages)` (`marked` + `dompurify`) | yes | Output is sanitized. The preview and print window drop remote image `src`; Copy and Download keep them. |
| `chmod` | `chmod/ChmodTool.tsx` | `chmod.ts` | yes | URL state: `v` (octal). Shell-escapes filenames in the copied command. From PR #93. |
| `case-converter` | `case-converter/CaseConverterTool.tsx` | `caseConverter.ts` | yes | URL state: `t`. Unicode-aware word splitting. From PR #94. |
| `word-counter` | `word-counter/WordCounterTool.tsx` | `wordCount.ts`: `textStats` (Intl.Segmenter) | yes | |
| `text-diff` | `text-diff/TextDiffTool.tsx` | `diff.ts`: `diffLines` (LCS, capped at `MAX_CELLS`) | yes | Unified view. |
| `notepad` | `notepad/NotepadTool.tsx` | reuses `textStats` | no | Autosaves to `toolglass_notepad`. |
| `unit-converter` | `unit-converter/UnitConverterTool.tsx` | `units.ts`: `UNITS`, `convert`, `formatNumber` | yes | URL state: `cat`, `from`, `to`, `v`. |
| `percentage` | `percentage/PercentageTool.tsx` | `percentage.ts` | yes | Four calculators on one page. |
| `world-clock` | `world-clock/WorldClockTool.tsx` | reuses `timestamp.ts` `isoWithOffset` | no | Zones in `toolglass_world_clock` via `createListStore`. |
| `timer` | `timer/TimerTool.tsx` | `timer.ts`: `formatDuration` | yes | Stopwatch, countdown, pomodoro. Elapsed time from `performance.now()`, beep via Web Audio. |
| `image-compress` | `image-compress/ImageCompressTool.tsx` | `image.ts`: `fitSize`, `formatBytes`, `renameFor` | yes | Canvas re-encode, which also strips EXIF. Errors if the browser cannot encode the chosen format. |
| `screen-recorder` | `screen-recorder/ScreenRecorderTool.tsx` | `recorder.ts`: `pickMime`, `extFor` | yes | `getDisplayMedia` + `MediaRecorder`. Desktop only. |
| `csv-json` | `csv-json/CsvJsonTool.tsx` | `csv.ts`: `parseCsv` (RFC 4180), `sniffDelimiter`, `csvToObjects`, `objectsToCsv`, `toSqlInsert` | yes | |
| `yaml-toml` | `yaml-toml/YamlTomlTool.tsx` | `convert.ts`, using `js-yaml` (JSON schema only) and `smol-toml` | yes | Only tool with format libraries; they stay in its lazy chunk. |
| `sql-format` | `sql-format/SqlFormatTool.tsx` | `sqlFormat.ts`: `formatSql` (tokenizer plus layout rules, no dialects) | yes | |
| `http-status` | `http-status/HttpStatusTool.tsx` | `codes.ts`: `STATUS_CODES`, `searchCodes` | yes | |
| `number-base` | `number-base/NumberBaseTool.tsx` | `numberBase.ts`: `parseBig`, `toBase`, `toBits`, `fromBits` (BigInt) | yes | |
| `html-entities` | `html-entities/HtmlEntitiesTool.tsx` | `entities.ts`: `encodeEntities`, `decodeEntities` (detached textarea, never runs markup) | yes | |
| `list-transform` | `list-transform/ListTransformTool.tsx` | `list.ts`: `transformList` | yes | |
| `keycode` | `keycode/KeycodeTool.tsx` | inline | no | Window keydown listener; Tab and Escape keep default behavior. |
| `unicode` | `unicode/UnicodeTool.tsx` | `unicode.ts`: `inspect`, `clean` | yes | Keeps ZWJ and variation selectors inside emoji. |
| `subnet` | `subnet/SubnetTool.tsx` | `subnet.ts`: `subnet`, `fmtV6` (RFC 5952) | yes | URL state: `ip`. |
| `mime-types` | `mime-types/MimeTypesTool.tsx` | `mime.ts`: `MIME_TYPES`, `detect`, `search` | yes | Reads only the first 32 KB of a file. |
| `json-to-zod` | `json-to-zod/JsonToZodTool.tsx` | `zod.ts`: `jsonToZod` | yes | |

`curlSecurity.ts` exports: types `HeaderParam`, `SavedRequest`, `HistoryItem`, `SessionAuthData`; `isSensitiveHeader`, `sanitizeHeaders`, `hasAuthCredentials`, `sanitizeSavedRequest`, `sanitizeHistoryItem`, `saveSessionAuth`, `getSessionAuth`, `clearSessionAuth`, `scrubStorageAuth`.

Tests: 44 files, each `*.test.ts(x)` next to the code it tests. Find them with `find src -name '*.test.*'`.

## Adding a tool

1. Create `src/tools/<slug>/<Name>Tool.tsx`, default export, body wrapped in `<ToolLayout>`. Copy `base64/Base64Tool.tsx`.
2. Put pure logic in `src/tools/<slug>/<slug>.ts` and test it in `<slug>.test.ts`.
3. Add an entry to `catalog` in `src/tools/catalog.ts` (category, audience, keywords, and `replaces` if it saves people an app, extension, or site).
4. Add the same slug to `visuals` in `src/tools/registry.tsx` (icon from `lucide-react`, `size={22} strokeWidth={1.5} color="var(--ink)"`).
5. The page HTML, sitemap entry, and landing placement follow from the catalog. Update the tool table in `README.md` and the tool rows in this file by hand.

## Conventions

- Inline styles with CSS variables. New code uses the design tokens: `--canvas`, `--ink`, `--ink-soft`, `--ink-mute`, `--accent`, `--accent-ink`, `--accent-soft`, `--accent-ring`, `--status-*`, `--surface-1/2/3`, `--border`, `--glass-border`, `--edge`, `--e1/2/3`, `--blur`, `--t-*`, `--s-*`, `--radius*`, `--ease-out`, `--dur-*`. Older names (`--glass-bg`, `--surface-input`, `--divider`, ...) are aliases kept for existing tools. Never hard-code hex colors.
- Design rules: one accent (cobalt), no gradient text, no emoji as icons (use `lucide-react`), no em dashes in visible copy, motion under 300 ms with `--ease-out`.
- Tool body layout: `<div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>` with `Field`, `Button`, `Output`.
- Errors go to `useToast().push(message, 'error')`.
- Usage count: `CopyButton` increments automatically. Tools with other primary actions call `useToolStats(slug).increment()` themselves (color, timestamp, api-tester).
- Shareable settings use `useUrlState` with short keys.

## Browser storage keys

| Key | Store | Owner |
|---|---|---|
| `toolglass-theme` | local | `hooks/useTheme.ts` (absent = Auto) |
| `toolglass_recent_tools` | local | `hooks/useRecentTools.ts:3` |
| `toolglass_rail_collapsed` | local | `components/ToolRail.tsx` (`1` = icons only) |
| `toolglass_stats` | local | `hooks/useToolStats.ts:3` |
| `toolglass_telemetry_enabled` | local | `hooks/useToolStats.ts:4` |
| `toolglass_favorites` | local | `hooks/useFavorites.ts` |
| `toolglass_notepad` | local | `tools/notepad/NotepadTool.tsx` |
| `toolglass_world_clock` | local | `tools/world-clock/WorldClockTool.tsx` |
| `toolglass_saved_requests` | local | `tools/curl-to-fetch/curlSecurity.ts:56`, also literal in `useApiTester.ts` |
| `toolglass_request_history` | local | `tools/curl-to-fetch/curlSecurity.ts:57`, also literal in `useApiTester.ts` |
| `tg_ts_history` | local | `tools/timestamp/TimestampTool.tsx:277` |
| `toolglass_session_credentials` | session | `tools/curl-to-fetch/curlSecurity.ts:58` |

Note the mixed naming: one hyphenated key, one `tg_` prefix, the rest `toolglass_` with underscores.

## Global keyboard shortcuts

| Keys | Where | Action |
|---|---|---|
| Ctrl/Cmd+K | `App.tsx:202` | Toggle command palette |
| Backspace | `components/ToolLayout.tsx:32` | Go to `/tools` when focus is not in INPUT or TEXTAREA |
| Alt+Z | `tools/curl-to-fetch/useApiTester.ts:123` | API Tester shortcut |

## Network

Only `fetch` calls in the app: `tools/curl-to-fetch/useApiTester.ts:447` and `:646`, both user-initiated requests in the API Tester. Fonts are self-hosted in `src/assets/fonts/` (latin subset) and precached by the service worker.

## Gotchas

- `index.html` has a CSP. The inline theme script is allowed by its sha256 hash: change the script and the hash must be recomputed, or the theme flashes and the console shows a CSP error. `img-src` and `media-src` allow only self, `data:` and `blob:`; `connect-src *` is for the API Tester. A new tool that needs anything else must update the policy.
- `npm run dev` and `vite preview` fall back to `index.html` for any path. GitHub Pages does not: it needs the `tools/<slug>.html` and `404.html` files the build writes. Check the built `dist/` when changing routes.
- `ToolLayout` Backspace goes to `/tools` unless focus is in an input, textarea, select, or contenteditable, or a modifier key is held.
- Use `m.*` from framer-motion, not `motion.*`: `App.tsx` wraps everything in `LazyMotion` so the animation code loads after first paint. A `motion.*` component still works but pulls the full library into its chunk (`Reorder` in `ToolsHub.tsx` does this on purpose).
- `html` has `scrollbar-gutter: stable`. Without it, a short page (one filtered category) drops the scrollbar and the centered layout slides about 5px sideways.
- framer-motion 13 hands plain `useTransform(scrollYProgress, ...)` opacity maps to the browser's native scroll timeline, which maps pinned sections wrongly (elements fade back out). Use `useRange` in `Home.tsx` (function-form `useTransform`) for scroll-linked values.
- Transmissive three.js materials only refract opaque objects; use `alphaTest` instead of `transparent` for anything that should show through the glass.
- ESLint ignores only `dist` and `node_modules`, and its TS rules apply to `**/*.{ts,tsx}`.

## Section maps for large files

Read a range with offset and limit instead of the whole file.

### `src/tools/curl-to-fetch/` — slug `api-tester`

Split in Phase 3 (#64). `CurlTool.tsx` (35) only wires the pieces together.

- `curl.ts` (111, tested in `curl.test.ts`): `QueryParam`, `parseCurl`, `getNestedValue`, `getJsonLeafPaths`, `getMethodColor`
- `useApiTester.ts` (816): all state and handlers, returns `ApiTester`. Alt+Z handler L123; `fetch` at L447 (quick-run a saved workflow) and L646 (`handleSend`)
- `RequestPanel.tsx` (282): URL bar, cURL import, params/auth/headers/body tabs, response
- `WorkflowsPanel.tsx` (99), `HistoryPanel.tsx` (50), `SaveWorkflowDialog.tsx` (85)
- `parts.tsx` (56): `MethodBadge`, `Notice`, `panelStyle`

Every `localStorage.setItem` for saved requests and history in `useApiTester.ts` passes through `sanitizeSavedRequest` or `sanitizeHistoryItem`. Keep that when adding a write.

### `src/tools/curl-to-fetch/curlSecurity.ts` (252)

- L1-46: interfaces `HeaderParam`, `SavedRequest`, `HistoryItem`, `SessionAuthData`
- L48-58: `SENSITIVE_HEADER_NAMES`, storage key constants
- L64-78: `isSensitiveHeader`, `sanitizeHeaders`
- L80-101: `hasAuthCredentials`
- L107-130: `sanitizeSavedRequest`, `sanitizeHistoryItem`
- L136-182: `saveSessionAuth`, `getSessionAuth`, `clearSessionAuth` (sessionStorage, keyed by workflow id)
- L189-252: `scrubStorageAuth` (one-time cleanup of legacy stored credentials)

### `src/tools/timestamp/timestamp.ts` (167)

- L2-23: `isoWithOffset`, `rfc2822`
- L27-108: cron. `parseCronField`, `parseCron`, `getNextCronRuns(cron, count, from)`, `describeCron`
- L111-120: `parseSmartDate`
- L122-142: `getDurationDescription`
- L144-167: `OFFSET_REGEX`, `applyOffset`

### `src/tools/timestamp/TimestampTool.tsx` (1012) — slug `timestamp`

- L13-19: `DEFAULT_TZS`, `POPULAR_TZS`
- L31: `HistoryItem`
- L41-65: `getRelativeTime`
- L67-101: `formatLocal`
- L103: `TimestampTool`
- L110-126: URL state. `activeMode`, `convertInput`, `batchInput`, `cronInput`, `diffMode`, `diffDate1`, `diffDate2`, `diffBase`, `diffOffset`
- L128-149: local state. `selectedTz`, `customTzs`, history, flyout, `nowTs`
- L167: `addHistory`, L184: `handleCopy`, L193: `handleCopySnippet`, L203: `openCodeFlyout`
- L211-246: values derived per mode
- L251-276: `lastLoggedRef` history effect
- L278-947: JSX. Mode switch L366 convert, L465 batch, L564 diff, L691 cron. History drawer L794. Code flyout L864
- L949-1012: `ValueRow`

### `src/components/CommandPalette.tsx` (463)

- L7-38: `PALETTE_STYLES`, `InjectStyles`
- L40: `SearchIcon`
- L62-91: `useFocusTrap(ref, active)`
- L99-160: `CommandPalette`. State `query`, `selected`. `navigateTo` L141, key handling L147-157
- L161-463: JSX (animated modal, result list)

### `src/components/ErrorBoundary.tsx` (344)

- L5-18: props and state interfaces
- L20-42: class, error lifecycle (console logging only in development)
- L44-81: `resetError`, `handleCopyDebugInfo` (builds a markdown report for the clipboard)
- L83-344: `render` and fallback UI

### `src/pages/NotFound.tsx` (377)

- L13-35: `scoreToolMatch(query, tool)` fuzzy score
- L37-44: component setup
- L46-74: `suggestedTools`, `searchResults` memos
- L76-377: JSX

### `src/tools/color/ColorTool.tsx` (222)

- L8-13: `PRESET_COLORS`
- L15-63: `ColorTool`, `parsed` memo. Parses any CSS color by assigning it to a detached `div` style (L20), then derives hex, RGB, HSL
- L65-189: JSX
- L191-222: `CopyRow` (calls `increment`)

### `src/tools/regex/RegexTool.tsx` (165)

- L7-13: state `pattern`, `flags`, `testString`, `toggleFlag`
- L15-67: memo that runs the regex in try/catch and builds highlighted React nodes (no `innerHTML`)
- L69-164: JSX

### `src/tools/json-to-ts/jsonToTs.ts` (80)

- L3-5: `toPascalCase`
- L7-60: `inferType` (recursive, dedupes interface names)
- L62-80: `jsonToTs`

### `src/tools/json-to-ts/JsonToTsTool.tsx` (58)

- L8-58: component. State `input`, `useInterface`, `rootName`. Calls `jsonToTs`.

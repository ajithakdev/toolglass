# Toolglass code map

Mapped at commit: `5e804dc` plus branch `feat/phase3-finish` (2026-10-21, end of Phase 3 of `docs/PLAN.md`).

Check for drift before trusting this file: `git diff --stat c7cd085..HEAD -- src`

Numbers in parentheses are line counts. Use them to judge read cost.

## Architecture in one screen

```
index.html
  src/main.tsx (17)            legacy /#/ redirect, StrictMode > BrowserRouter > App
    src/App.tsx                MotionConfig > ToastProvider > Shell (header, main, footer) > ErrorBoundary > Routes
      /                        pages/Home.tsx
      /tools                   pages/ToolsHub.tsx
      /about                   pages/About.tsx
      /tools/:slug             pages/ToolPage.tsx  -> toolBySlug(slug) -> lazy Component
      *                        pages/NotFound.tsx
    CommandPalette             sibling of Shell, opened by Ctrl/Cmd+K
```

- Routing is `BrowserRouter` with clean URLs (`/tools/<slug>`). `main.tsx` rewrites old `/#/...` links. Hosting is GitHub Pages on `toolglass.ajithakdev.com` (`public/CNAME`); the build writes `tools/<slug>.html` per tool and a `404.html` SPA fallback.
- Tool data lives in `src/tools/catalog.ts` (plain data: title, description, category, audience, keywords, replaces). `src/tools/registry.tsx` adds icon, tint, and lazy component per slug. Everything (pages, palette, build-time SEO pages, sitemap) reads these; there is no other slug list.
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
| `index.html` | Meta, OG tags, JSON-LD, pre-paint theme script. Fonts are self-hosted Geist and Geist Mono (see `index.css`). |
| `.github/ISSUE_TEMPLATE/` | Issue forms: `bug_report.yml`, `feature_request.yml`; `config.yml` turns off blank issues and links Discussions, SECURITY.md, and the site. Tool-request links in `ToolsHub.tsx` and `About.tsx` open `feature_request.yml` with `template=`. |
| `.github/workflows/ci-cd.yml` | `verify` job: `npm ci`, lint, build, test, upload Pages artifact. `deploy` job: Pages, main only; it alone has `pages`/`id-token` write. |
| `scripts/gen-keccak-permute.py` | Prints the unrolled Keccak `permute` for `src/tools/hash/hash.ts`. Only needed if that function is ever regenerated. |
| `public/` | favicon.svg, icon-192.png, icon-512.png, og-image.png, robots.txt, sitemap.xml. |
| `README.md` (112), `ROADMAP.md` (442), `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/CONTRIBUTING.md` (96) | Human docs. ROADMAP is a 20-day plan; days 1-15 done, 16-20 open. |

### src core

| File | Exports | Notes |
|---|---|---|
| `App.tsx` | `default App` | Meta effect on navigation, Ctrl/Cmd+K handler, routes (`/`, `/tools`, `/tools/:slug`, `*`). `MotionConfig reducedMotion="user"`. |
| `main.tsx` (17) | none | Mount point. Redirects legacy hash URLs. |
| `seo.ts` | `SITE_URL`, `HOME`, `toolPage`, `allPages`, `applyMeta`, `applyMetaToDocument`, `sitemapXml` | Page-meta helpers. `applyMeta` rewrites HTML at build time; `applyMetaToDocument` updates title, description, social tags, and canonical on client-side navigation (App effect). Has a test. |
| `index.css` | none | Design tokens (canvas, ink, one accent, status, 3 glass surfaces, 3 elevations, type scale, 4px space scale, radii, motion), dark overrides, legacy aliases for old token names, base styles, ambient light (`body::before`) and grain (`body::after`), focus, scrollbars, `.glass`, `.container`, `.lift`, shell classes (`.nav-link`, `.nav-btn`, `.hide-sm`, `.skip-link`). |
| `lib/cn.ts` (3) | `cn(...parts)` | Joins truthy class names. |
| `lib/motion.ts` | `EASE_OUT`, `spring`, `fadeUp`, `fade`, `stagger()` | Shared framer-motion presets. |
| `lib/platform.ts` | `IS_MAC`, `shortcut(key)` | Shortcut labels per OS. |
| `lib/search.ts` | `searchTools(tools, query)` | Word-AND ranking over title, keywords, replaces, description; accent-insensitive. Used by hub, hero search, and command palette. Has a test. |
| `lib/listStore.ts` | `createListStore(key, max)` | Shared localStorage-backed string list (`useSyncExternalStore`). Backs recents and favorites. Has a test. |
| `lib/privacy.ts` | `countThirdParty` | Used by `PrivacyMeter`. Has a test. |
| `view-transitions.d.ts` (10) | none | Types for `document.startViewTransition`. |

### src/pages

| File | Notes |
|---|---|
| `Home.tsx` | Six acts: `Hero` (copy, `HeroSearch`, lazy `GlassScene` with a logo poster until the first frame), `Collapse` (pinned 340vh scene: clutter cards pulled into the glass, then a real toolbar; `CollapseStill` for reduced motion), `ForEveryone` (audience switch + tool cards), `Proof` (live third-party request count), `Ending`. Scroll maps use `useRange` (JS-computed; see Gotchas). |
| `ToolsHub.tsx` | `/tools`. Search, category chips, audience switch (all in the URL: `q`, `cat`, `for`), favorites rail (drag to reorder), recents rail, grouped grid, empty state linking to a tool request. Has a test. |
| `About.tsx` | `/about`. Privacy model, live meter, table of everything stored locally with a "clear all" button, open source links. |
| `ToolPage.tsx` (55) | `Loader` L9-30 (skeleton Suspense fallback). `ToolPage` L32-55: unknown slug renders `NotFound`, else `ErrorBoundary > Suspense > Component`. Calls `addRecent(slug)`. |
| `NotFound.tsx` (377) | Props `attemptedSlug`, `isToolNotFound`. Suggests tools; default suggestions hardcoded at L60 (`timestamp`, `jwt`, `password`). Has a test. |

### src/components

| File | Notes |
|---|---|
| `home/GlassScene.tsx` | Lazy three.js scene: two `MeshPhysicalMaterial` panes (transmission, dispersion) refracting a ring of glyph tiles and a light disc. Time-based animation, pointer parallax, scroll progress prop, pauses offscreen/hidden, one static frame for reduced motion, lower DPR on modest hardware, disposes everything on unmount. |
| `home/HeroSearch.tsx` | ARIA combobox over `searchTools`; Enter opens the highlighted tool. |
| `Shell.tsx` | `Shell`, `Kbd`. Sticky glass header (logo, Home/Tools nav with sliding indicator, search, install, theme switch), footer (privacy meter, usage-count opt-out, GitHub). |
| `Logo.tsx` | Two-pane glass mark; mirrors `public/favicon.svg`. |
| `PrivacyMeter.tsx` | Live count of requests to other origins via `PerformanceObserver` (Resource Timing). |
| `ToolLayout.tsx` (121) | Wraps every tool. Takes only `children`. Breadcrumb, Favorite and Share (copies `currentUrl()`), privacy note (API Tester gets its own wording), related tools. Backspace outside a text field navigates to `/tools`. |
| `CommandPalette.tsx` (463) | Props `open`, `onClose`. Filters `tools` from registry. Arrow keys, Enter, Escape. |
| `ErrorBoundary.tsx` (344) | Class component. Optional prop `toolTitle`. Has a test. |
| `ui/Button.tsx` (92) | `variant`: primary, ghost, soft. `size`: sm, md, lg. `full`. |
| `ui/Field.tsx` (327) | `Field` L4, `TextInput` L33, `TextArea` L53, `Select` L76, `Dropdown` L115, `Toggle` L236, `Slider` L300. |
| `ui/Output.tsx` (64) | Props `value`, `multiline`, `placeholder`, `trailing`, `label`. Result box with copy. |
| `ui/CopyButton.tsx` (55) | Props `value`, `label`, `size`, `disabled`. Copies, toasts, and calls `increment()` for the current slug. |
| `ui/GlassCard.tsx` (21) | `motion.div` with `.glass` or `.glass-strong` (`strong` prop), `padding`. |
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
| `useUrlState.ts` (99) | `useUrlState(key, default, parse, stringify)` returns `[value, setValue]`; `intParam(min, max, fallback)`; `currentUrl()` (page URL with pending writes applied, for Share) | Local state updates at once; the URL write is debounced 200 ms with `replace: true`. Re-syncs on external URL changes. Use `intParam` as `parse` for numeric params so crafted links are clamped. Has a test. |

### src/tools

Catalog: `catalog.ts` exports `CategoryId`, `Audience`, `CATEGORIES`, `AUDIENCES`, `ToolInfo`, `catalog`. Registry: `registry.tsx` exports `ToolMeta` (ToolInfo + `icon`, `tint`, `Component`), `tools`, `toolBySlug`. `registry.test.ts` checks slugs, metadata, and that every catalog entry has visuals.

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
| `timestamp` | `timestamp/TimestampTool.tsx` (1155) | inline, plus `timestamp.ts`: `isoWithOffset`, `rfc2822` | no | Multi-mode. URL state: `mode`, `batch`, `cron`, `diffMode`, `d1`, `d2`, `db`, `do`. History in localStorage. Section map below. |
| `json` | `json/JsonTool.tsx` (108) | `json/json.ts`: `errorLocation`, `validateSchema` (common JSON Schema keywords, no `$ref`) | yes | Format, minify, error line/column, schema validation. |
| `jwt-decode` | `jwt-decode/JwtDecodeTool.tsx` (75) | inline | no | |
| `url` | `url/UrlTool.tsx` (64) | inline | no | URL state: `mode`, `input`, `batch` (line-by-line). |
| `color` | `color/ColorTool.tsx` (222) | inline | no | Hex, RGB, HSL. |
| `regex` | `regex/RegexTool.tsx` (165) | inline | no | |
| `json-to-ts` | `json-to-ts/JsonToTsTool.tsx` (136) | inline, converter above L86 | no | |
| `api-tester` | `curl-to-fetch/CurlTool.tsx` (35) + parts | `curl-to-fetch/curlSecurity.ts` (252) | yes (286) | HTTP client, cURL import, saved workflows, history. Split into several files; map below. |
| `qr` | `qr/QrTool.tsx` (109) | `qrcode` package | no | PNG and SVG export. |
| `markdown` | `markdown/MarkdownTool.tsx` (104) | `marked` + `dompurify` | no | Output is sanitized before render and before "Copy HTML". |
| `chmod` | `chmod/ChmodTool.tsx` | `chmod.ts` | yes | URL state: `v` (octal). Shell-escapes filenames in the copied command. From PR #93. |
| `case-converter` | `case-converter/CaseConverterTool.tsx` | `caseConverter.ts` | yes | URL state: `t`. Unicode-aware word splitting. From PR #94. |

`curlSecurity.ts` exports: types `HeaderParam`, `SavedRequest`, `HistoryItem`, `SessionAuthData`; `isSensitiveHeader`, `sanitizeHeaders`, `hasAuthCredentials`, `sanitizeSavedRequest`, `sanitizeHistoryItem`, `saveSessionAuth`, `getSessionAuth`, `clearSessionAuth`, `scrubStorageAuth`.

Tests: 26 files, each `*.test.ts(x)` next to the code it tests. Find them with `find src -name '*.test.*'`.

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
| `toolglass_stats` | local | `hooks/useToolStats.ts:3` |
| `toolglass_telemetry_enabled` | local | `hooks/useToolStats.ts:4` |
| `toolglass_favorites` | local | `hooks/useFavorites.ts` |
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

- `npm run dev` and `vite preview` fall back to `index.html` for any path. GitHub Pages does not: it needs the `tools/<slug>.html` and `404.html` files the build writes. Check the built `dist/` when changing routes.
- `ToolLayout` Backspace goes to `/tools` unless focus is in an input, textarea, select, or contenteditable, or a modifier key is held.
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

### `src/tools/timestamp/TimestampTool.tsx` (1155) — slug `timestamp`

Module helpers:

- L13-19: `DEFAULT_TZS`, `POPULAR_TZS`
- L21: `HistoryItem` interface
- L31-55: `getRelativeTime`
- L57-66: `parseSmartDate`
- L68-101: `formatLocal(date, timeZone, type)`
- L104-181: `getNextCronRuns(cron, count)`, with inner `parseField` L109
- L183-194: `describeCron`
- L196-217: `getDurationDescription`
- L219-242: `OFFSET_REGEX`, `applyOffset(base, offsetStr)`
- L1088-1151: `ValueRow` subcomponent

Component `TimestampTool` starts L244:

- L251-267: URL state. `activeMode` (`convert`, `batch`, `diff`, `cron`), `convertInput`, `batchInput`, `cronInput`, `diffMode` (`range`, `offset`), `diffDate1`, `diffDate2`, `diffBase`, `diffOffset`
- L270-290: local state. `selectedTz`, `customTzs`, `historyOpen`, `historyList` (from `tg_ts_history`), `flyoutValue`, `flyoutDate`, `copiedSnippetIndex`, `flyoutRef`, `nowTs` (1 s interval clock)
- L308: `addHistory`, L325: `handleCopy`, L334: `handleCopySnippet`, L344: `openCodeFlyout`
- L353-390: values derived per mode (parsed date, batch rows, diff dates, cron runs)
- L392-417: `lastLoggedRef` and the effect that writes history without duplicates

JSX, L420-1084:

- L434-488: mode selector and history toggle
- L507-602: `convert` mode (raw, standard, and localized groups; timezone picker L549)
- L604-701: `batch` mode
- L703-828: `diff` mode (`range` or `offset`)
- L830-913: `cron` mode (presets L844)
- L914-1000: history sidebar
- L1001-1084: code-snippet flyout

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

### `src/tools/json-to-ts/JsonToTsTool.tsx` (136)

- L7-9: `toPascalCase`
- L11-64: `inferType` (recursive)
- L66-84: `jsonToTs`
- L86-136: component. State `input`, `useInterface`, `rootName`

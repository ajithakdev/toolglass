# Toolglass code map

Mapped at commit: `18d4d8d` (2026-10-10). 81 tracked files, about 9,500 lines of source.

Check for drift before trusting this file: `git diff --stat 18d4d8d..HEAD -- src`

Numbers in parentheses are line counts. Use them to judge read cost.

## Architecture in one screen

```
index.html
  src/main.tsx (13)            StrictMode > HashRouter > App
    src/App.tsx (225)          ToastProvider > Shell (nav, main, footer) > ErrorBoundary > Routes
      /                        pages/Landing.tsx
      /tools/:slug             pages/ToolPage.tsx  -> toolBySlug(slug) -> lazy Component
      *                        pages/NotFound.tsx
    CommandPalette             sibling of Shell, opened by Ctrl/Cmd+K
```

- Routing is `HashRouter`. URLs look like `/#/tools/<slug>`. Query params live inside the hash.
- `src/tools/registry.tsx` is the single source of truth for tools. Landing, CommandPalette, ToolPage, and NotFound all read it.
- Every tool is a default-export component loaded with `React.lazy`. Each tool wraps its own body in `<ToolLayout>`, which reads the slug from the route and renders title, description, icon, back link, and usage count.
- Theme: `data-theme="light|dark"` on `<html>`, set by `useTheme`. All colors are CSS variables in `src/index.css`.

## Files

### Root

| File | Notes |
|---|---|
| `package.json` | Scripts: dev, build, preview, lint, test, test:coverage, deploy. `"type": "module"`. |
| `vite.config.ts` (45) | `base` is `/toolglass/` only when `GITHUB_ACTIONS` is set, else `/`. PWA plugin (autoUpdate). Vitest config: jsdom, globals, `src/**/*.test.{ts,tsx}`. |
| `tsconfig.json` | strict, noUnusedLocals, noUnusedParameters, `include: ["src"]`. |
| `eslint.config.js` (26) | Flat config. Several `react-hooks/*` rules turned off (set-state-in-effect, purity, refs, error-boundaries, set-state-in-render). |
| `index.html` (42) | Meta, OG tags, JSON-LD, Google Fonts (Inter, JetBrains Mono). |
| `.github/workflows/ci-cd.yml` (60) | `verify` job: install, lint, build, test, upload Pages artifact. `deploy` job: Pages, main only. |
| `patch.js` (37), `update_tools.js` (38) | Dead one-off codemod scripts. See Gotchas. |
| `public/` | favicon.svg, icon-192.png, icon-512.png, og-image.png, robots.txt, sitemap.xml. |
| `README.md` (112), `ROADMAP.md` (442), `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/CONTRIBUTING.md` (96) | Human docs. ROADMAP is a 20-day plan; days 1-15 done, 16-20 open. |

### src core

| File | Exports | Notes |
|---|---|---|
| `App.tsx` (225) | `default App` | `InstallPwaButton` L14-54, `Shell` L56-193 (skip link, nav, footer with "Local Usage Stats" checkbox), `App` L195-225 (Ctrl/Cmd+K handler, routes). |
| `main.tsx` (13) | none | Mount point. |
| `index.css` (281) | none | `:root` light tokens L1-47, dark tokens L49-88, view transitions L108-117, `.bg-orb`, `.glass`, `.glass-strong`, `.mono`, `.gradient-text`, `.sr-only`, focus rings, reduced-motion block L223. |
| `lib/cn.ts` (3) | `cn(...parts)` | Joins truthy class names. |
| `view-transitions.d.ts` (10) | none | Types for `document.startViewTransition`. |

### src/pages

| File | Notes |
|---|---|
| `Landing.tsx` (268) | `CATEGORIES` L9-16 maps category name to slugs (hardcoded, must be edited per new tool). `RecentPill` L18-42. Category filter persisted in localStorage. |
| `ToolPage.tsx` (154) | `Loader` L19-128 (Suspense fallback). `ToolPage` L131-154: unknown slug renders `NotFound`, else `ErrorBoundary > Suspense > Component`. Calls `addRecent(slug)`. |
| `NotFound.tsx` (377) | Props `attemptedSlug`, `isToolNotFound`. Suggests tools; default suggestions hardcoded at L60 (`timestamp`, `jwt`, `password`). Has a test. |

### src/components

| File | Notes |
|---|---|
| `ToolLayout.tsx` (129) | Wraps every tool. Takes only `children`. Backspace outside INPUT/TEXTAREA navigates to `/` (L19-31). |
| `CommandPalette.tsx` (463) | Props `open`, `onClose`. Filters `tools` from registry. Arrow keys, Enter, Escape. |
| `ErrorBoundary.tsx` (344) | Class component. Optional prop `toolTitle`. Has a test. |
| `ui/Button.tsx` (92) | `variant`: primary, ghost, soft. `size`: sm, md, lg. `full`. |
| `ui/Field.tsx` (327) | `Field` L4, `TextInput` L33, `TextArea` L53, `Select` L76, `Dropdown` L115, `Toggle` L236, `Slider` L300. |
| `ui/Output.tsx` (64) | Props `value`, `multiline`, `placeholder`, `trailing`, `label`. Result box with copy. |
| `ui/CopyButton.tsx` (55) | Props `value`, `label`, `size`, `disabled`. Copies, toasts, and calls `increment()` for the current slug. |
| `ui/GlassCard.tsx` (21) | `motion.div` with `.glass` or `.glass-strong` (`strong` prop), `padding`. |
| `ui/Toast.tsx` (105) | `ToastProvider`, `useToast()` returns `{ push(message, kind?, id?) }`. Kinds: success, error, info. Passing an existing id updates that toast. |
| `ui/ToolCard.tsx` (88) | Landing card for one `ToolMeta`. Shows usage count when stats are enabled. |
| `ui/ThemeToggle.tsx` (82) | Uses View Transitions API when available. |

### src/hooks

| File | Signature | Notes |
|---|---|---|
| `useClipboard.ts` (34) | `useClipboard(resetMs = 1500)` returns `{ copy, copied }` | Falls back to `execCommand('copy')`. |
| `useTheme.ts` (39) | returns `{ theme, toggle }` | Writes theme to localStorage on every mount, so the OS-change listener at L25-29 never fires after first load. |
| `useRecentTools.ts` (30) | returns `{ recents, addRecent }` | Keeps last 3 slugs. |
| `useToolStats.ts` (75) | `useToolStats(slug?)` returns `{ count, allStats, increment, enabled, toggleTelemetry }` | `enabled` only hides the UI. `increment` always writes. Syncs across components with a `toolglass-telemetry` window event. |
| `useUrlState.ts` (60) | `useUrlState(key, default, parse, stringify)` returns `[value, setValue]` | Value is derived from the URL. Writes are debounced 200 ms with `replace: true`. No local state. See Gotchas. |

### src/tools

Registry: `registry.tsx` (189). `ToolMeta` L22-30: `slug`, `title`, `short`, `description`, `icon`, `tint`, `Component`. `tools` array L32-186. `toolBySlug` L188.

17 tools. Slug is the route and the registry key. Folder name differs from slug for one tool (`api-tester` lives in `curl-to-fetch/`).

| Slug | Component file | Logic file | Test | Notes |
|---|---|---|---|---|
| `password` | `password/PasswordTool.tsx` (129) | `password/password.ts` (71): `CHARSETS`, `PwdOptions`, `generatePassword`, `Strength`, `estimateStrength` | yes | URL state: `len`, `u`, `l`, `n`, `s`. |
| `jwt` | `jwt/JwtTool.tsx` (65) | `jwt/jwt.ts` (33): `b64url`, `strToB64Url`, `signHS256` | yes | HS256 only, Web Crypto. |
| `uuid` | `uuid/UuidTool.tsx` (48) | inline | no | v4. |
| `objectid` | `objectid/ObjectIdTool.tsx` (39) | `objectid/objectid.ts` (26): `MACHINE_ID`, `counter`, `objectId` | yes | |
| `nanoid` | `nanoid/NanoIdTool.tsx` (90) | inline | no | URL state: `size`, `count`. |
| `hash` | `hash/HashTool.tsx` (57) | inline | no | SHA-1/256/384/512 via `crypto.subtle`. |
| `base64` | `base64/Base64Tool.tsx` (63) | `base64/base64.ts` (12): `encode`, `decode` | yes | Smallest complete tool. Use as the template. |
| `timestamp` | `timestamp/TimestampTool.tsx` (1151) | inline | no | Multi-mode. URL state: `mode`, `batch`, `cron`, `diffMode`, `d1`, `d2`, `db`, `do`. History in localStorage. Section map below. |
| `json` | `json/JsonTool.tsx` (56) | inline | no | Format, minify, validate. |
| `jwt-decode` | `jwt-decode/JwtDecodeTool.tsx` (75) | inline | no | |
| `url` | `url/UrlTool.tsx` (61) | inline | no | URL state: `mode`, `input`. |
| `color` | `color/ColorTool.tsx` (222) | inline | no | Hex, RGB, HSL. |
| `regex` | `regex/RegexTool.tsx` (165) | inline | no | |
| `json-to-ts` | `json-to-ts/JsonToTsTool.tsx` (136) | inline, converter above L86 | no | |
| `api-tester` | `curl-to-fetch/CurlTool.tsx` (2083) | `curl-to-fetch/curlSecurity.ts` (252) | yes (286) | Largest file. HTTP client, cURL import, saved workflows, history. Section map below. |
| `qr` | `qr/QrTool.tsx` (109) | `qrcode` package | no | PNG and SVG export. |
| `markdown` | `markdown/MarkdownTool.tsx` (106) | `marked` + `dompurify` | no | Output is sanitized before render. |

`curlSecurity.ts` exports: types `HeaderParam`, `SavedRequest`, `HistoryItem`, `SessionAuthData`; `isSensitiveHeader`, `sanitizeHeaders`, `hasAuthCredentials`, `sanitizeSavedRequest`, `sanitizeHistoryItem`, `saveSessionAuth`, `getSessionAuth`, `clearSessionAuth`, `scrubStorageAuth`.

Tests (7 files): `components/ErrorBoundary.test.tsx`, `pages/NotFound.test.tsx`, `tools/base64/base64.test.ts`, `tools/curl-to-fetch/curlSecurity.test.ts`, `tools/jwt/jwt.test.ts`, `tools/objectid/objectid.test.ts`, `tools/password/password.test.ts`.

## Adding a tool

1. Create `src/tools/<slug>/<Name>Tool.tsx`, default export, body wrapped in `<ToolLayout>`. Copy `base64/Base64Tool.tsx`.
2. Put pure logic in `src/tools/<slug>/<slug>.ts` and test it in `<slug>.test.ts`.
3. Append an entry to `tools` in `src/tools/registry.tsx` (icon from `lucide-react`, `size={22} strokeWidth={1.5} color="var(--ink)"`).
4. Add the slug to a category in `CATEGORIES`, `src/pages/Landing.tsx` L9-16. The landing grid iterates `CATEGORIES` (L236-238), so a tool missing from every category is not shown on the landing page at all. It stays reachable by URL and command palette.
5. Also update by hand: `public/sitemap.xml`, the tool table in `README.md`, and the tool rows in this file.

## Conventions

- Inline styles with CSS variables. Common tokens: `--ink`, `--ink-soft`, `--ink-mute`, `--accent`, `--grad`, `--grad-soft`, `--glass-bg`, `--glass-border`, `--surface-input`, `--surface-button-off`, `--surface-nav-item`, `--divider`, `--kbd-bg`, `--kbd-border`, `--font-sans`, `--font-mono`, `--radius`, `--radius-sm`, `--radius-lg`.
- Tool body layout: `<div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>` with `Field`, `Button`, `Output`.
- Errors go to `useToast().push(message, 'error')`.
- Usage count: `CopyButton` increments automatically. Tools with other primary actions call `useToolStats(slug).increment()` themselves (color, timestamp, api-tester).
- Shareable settings use `useUrlState` with short keys.

## Browser storage keys

| Key | Store | Owner |
|---|---|---|
| `toolglass-theme` | local | `hooks/useTheme.ts:7` |
| `toolglass_recent_tools` | local | `hooks/useRecentTools.ts:3` |
| `toolglass_stats` | local | `hooks/useToolStats.ts:3` |
| `toolglass_telemetry_enabled` | local | `hooks/useToolStats.ts:4` |
| `toolglass_active_category` | local | `pages/Landing.tsx:58` |
| `toolglass_saved_requests` | local | `tools/curl-to-fetch/curlSecurity.ts:56`, also literal in `CurlTool.tsx` |
| `toolglass_request_history` | local | `tools/curl-to-fetch/curlSecurity.ts:57`, also literal in `CurlTool.tsx` |
| `tg_ts_history` | local | `tools/timestamp/TimestampTool.tsx:277` |
| `toolglass_session_credentials` | session | `tools/curl-to-fetch/curlSecurity.ts:58` |

Note the mixed naming: one hyphenated key, one `tg_` prefix, the rest `toolglass_` with underscores.

## Global keyboard shortcuts

| Keys | Where | Action |
|---|---|---|
| Ctrl/Cmd+K | `App.tsx:202` | Toggle command palette |
| Backspace | `components/ToolLayout.tsx:21` | Go to `/` when focus is not in INPUT or TEXTAREA |
| Alt+Z | `tools/curl-to-fetch/CurlTool.tsx:233` | API Tester shortcut |

## Network

Only `fetch` calls in the app: `tools/curl-to-fetch/CurlTool.tsx:558` and `:754`, both user-initiated requests in the API Tester. `index.html` loads Google Fonts.

## Gotchas

- `npm run deploy` (gh-pages) builds with `base: '/'` because `GITHUB_ACTIONS` is unset locally. The site is served from `/toolglass/`, so a local deploy would break asset paths. Deploy through CI.
- `patch.js` and `update_tools.js` use `require` in an ESM package, `update_tools.js` requires `glob` (not a dependency), and `patch.js` injects a `useToolAction` hook that does not exist in `src/hooks/`. Neither can run. Neither is referenced anywhere.
- `useUrlState` has no local state. `setValue` only schedules a URL write 200 ms later, so the returned value does not change until then. Text inputs bound directly to it (`url/UrlTool.tsx:10`, several in `timestamp/TimestampTool.tsx:251-267`) drop keystrokes. Reproduced in jsdom; see issue 1 in `docs/KNOWN-ISSUES.md`.
- `ToolLayout` Backspace handler checks only INPUT and TEXTAREA. Focus in a `<select>` or a contenteditable element still triggers navigation.
- `useToolStats.increment` writes even when the "Local Usage Stats" box is unchecked. The toggle hides counts; it does not stop counting. This is intentional per the comment at `hooks/useToolStats.ts:57`.
- `CATEGORIES` in `Landing.tsx` is a second list of slugs. A registered tool left out of it silently disappears from the landing page.
- ESLint ignores only `dist` and `node_modules`, and its TS rules apply to `**/*.{ts,tsx}`. Root `.js` files get base JS rules; both codemod scripts opt out with `/* eslint-disable */`.

## Section maps for large files

Read a range with offset and limit instead of the whole file.

### `src/tools/curl-to-fetch/CurlTool.tsx` (2083) — slug `api-tester`

Module helpers:

- L29: `QueryParam` interface
- L37-85: `parseCurl(curlString)`
- L87-100: `getNestedValue(obj, path)`
- L102-124: `getJsonLeafPaths(obj, parentKey)`
- L126-135: `getMethodColor(m)`

Component `CurlTool` starts L137:

- L138-140: `slug` (defaults to `api-tester`), `increment`, `toast`
- L142-215: state. In order: `method` 142, `url`, `mainTab` 146, `activeTab` 149, `queryParams`, `authType` 155, `bearerToken`, `basicUser`, `basicPass`, `headers` 161, `bodyText`, `curlInput` 170, `isCurlFocused`, `isCopiedResponse`, `response` 174, `loading`, `error`, `lineWrap`, `savedRequests` 188, `requestHistory` 199, `showSaveModal` 210, `saveName`, `saveDescription`, `autoCopyPath`, `saveToSession`, `editingWorkflowId` 215
- L217-256: effects. `scrubStorageAuth()` on mount L219, Alt+Z key handler L233
- L258: `handlePasteCurl`
- L301: `loadRequestConfig` (restores session credentials, L307)
- L327: `addHistoryItem`, L352: `handleClearHistory`
- L358: `handleForgetActiveCredentials`, L370: `handleForgetAllSavedCredentials`
- L395: `handleSaveRequest`, L468: `handleEditWorkflow`, L476: `handleDeleteRequest`, L486: `handleSaveFromHistory`
- L495-636: `handleQuickRun` (runs a saved workflow, `fetch` at L558, auto-copies a JSON field via `autoCopyPath` near L580)
- L638: `handleExportWorkflows`, L650: `handleImportWorkflows`
- L675-792: `handleSend` (URL checks: max 2048 chars and `http(s)://` only, near L687; `fetch` at L754)
- L794: `addQueryParamRow`, L798: `addHeaderRow`, L802: `handleCopyResponse`, L811: `handleInlineSaveClick`

JSX, L820-2083:

- L822-882: main tab bar. `mainTab` is `testing`, `workflows`, or `history`
- L884-1457: `testing` tab
  - L886: URL bar
  - L924: cURL import bar
  - L987-1354: request detail tabs. `activeTab`: `params` L1059, `auth` L1171, `headers` L1277, `body` L1341
  - L1355-1457: response area
- L1459-1698: `workflows` tab. Card list L1518, stats badge L1573
- L1700-1815: `history` tab
- L1816-2083: save/edit workflow modal

Every `localStorage.setItem` for saved requests and history passes through `sanitizeSavedRequest` or `sanitizeHistoryItem`. Keep that when adding a write.

### `src/tools/curl-to-fetch/curlSecurity.ts` (252)

- L1-46: interfaces `HeaderParam`, `SavedRequest`, `HistoryItem`, `SessionAuthData`
- L48-58: `SENSITIVE_HEADER_NAMES`, storage key constants
- L64-78: `isSensitiveHeader`, `sanitizeHeaders`
- L80-101: `hasAuthCredentials`
- L107-130: `sanitizeSavedRequest`, `sanitizeHistoryItem`
- L136-182: `saveSessionAuth`, `getSessionAuth`, `clearSessionAuth` (sessionStorage, keyed by workflow id)
- L189-252: `scrubStorageAuth` (one-time cleanup of legacy stored credentials)

### `src/tools/timestamp/TimestampTool.tsx` (1151) — slug `timestamp`

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

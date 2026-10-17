# Toolglass known issues

Found on 2026-10-10 at commit `18d4d8d` while mapping the repo. This was not a full audit: the two largest files (`CurlTool.tsx`, `TimestampTool.tsx`) were mapped, not reviewed line by line.

Baseline at that commit, Node 24.21.0: `npm run lint` clean, `npm run build` passes, `npm test` passes (7 files, 41 tests).

Nothing here is fixed yet. Remove an entry when its fix is merged.

Status meanings:

- **Reproduced**: observed in a test run.
- **Confirmed**: follows directly from the code or files; not run.
- **Suspected**: likely from reading the code; needs a browser check.

| ID | Severity | Status | Summary |
|---|---|---|---|
| 1 | High | Reproduced | `useUrlState` drops keystrokes in text inputs |
| 2 | Medium | Suspected | URL parameters are not validated; a crafted link can freeze the NanoID tool |
| 3 | Medium | Confirmed | Backspace navigates away while a `<select>` or contenteditable has focus |
| 4 | Medium | Confirmed | Privacy claims do not match behavior (Google Fonts, usage stats toggle) |
| 5 | Medium | Confirmed | `npm run deploy` publishes a build with the wrong base path |
| 6 | Medium | Confirmed | A tool left out of `CATEGORIES` is invisible on the landing page |
| 7 | Low | Confirmed | OS theme listener never fires; `color-scheme` and `theme-color` are fixed to light |
| 8 | Low | Confirmed | Sitemap is missing 5 tools and uses hash URLs |
| 9 | Low | Confirmed | Tool count is stale in `package.json` and `index.html` |
| 10 | Low | Confirmed | Dead scripts at repo root |
| 11 | Low | Confirmed | CI uses `npm install` and grants deploy permissions to the verify job |
| 12 | Low | Confirmed | Markdown "Copy HTML" copies unsanitized HTML |
| 13 | Low | Confirmed | Clipboard writes that bypass `useClipboard` have no error handling |
| 14 | Low | Confirmed | NanoID ignores alphabet characters past index 255 |
| 15 | Low | Confirmed | `Math.random()` is used for two ids, against the README claim |
| 16 | Low | Confirmed | Dependency leftovers |
| 17 | Low | Confirmed | Docs and issue tracker drift |
| 18 | Low | Confirmed | Test coverage gaps |

## 1. `useUrlState` drops keystrokes in text inputs

- Where: `src/hooks/useUrlState.ts:33-50`
- The hook has no local state. `setValue` only schedules a URL write 200 ms later. The returned value does not change until then, so React resets the controlled input to its old value after every keystroke. Each new keystroke also cancels the previous timer.
- Reproduced with a temporary Vitest test (jsdom, React 19): an `<input>` bound to the hook, three `input` events for "a", "b", "c". The input read `""` after each key. Final value was `"c"`, final hash `#/?input=c`.
- Affected text inputs: `src/tools/url/UrlTool.tsx:45`, and `src/tools/timestamp/TimestampTool.tsx` lines 513, 610, 730, 745, 783, 791, 835.
- Affected sliders (thumb snaps back until the user pauses): `src/tools/password/PasswordTool.tsx:96`, `src/tools/nanoid/NanoIdTool.tsx:62` and `:65`.
- Not yet checked in a real browser. Timing between real keystrokes may hide part of the effect when typing slowly.
- Fix: keep the value in `useState`, update it synchronously in `setValue`, debounce only the URL write, and re-sync from the URL when the param changes externally. Add a hook test.

## 2. URL parameters are not validated

- Where: `src/tools/nanoid/NanoIdTool.tsx:42-43` (`Number` as parser), `src/tools/password/PasswordTool.tsx:27`
- Slider `min` and `max` do not apply to values that arrive through the URL. `?count=100000000` reaches `Array.from({ length: count }, ...)` at `NanoIdTool.tsx:50`, and `?size=` reaches `new Uint8Array(step)` at `:16`. Either can freeze or crash the tab from a shared link. A non-numeric value gives `NaN` and an empty result.
- Password length is safe: `generatePassword` clamps to 4..128 (`src/tools/password/password.ts:33`).
- Fix: clamp and `Number.isFinite`-check in the `parse` function passed to `useUrlState`.

## 3. Backspace navigation fires in the wrong places

- Where: `src/components/ToolLayout.tsx:19-31`
- The handler skips only `INPUT` and `TEXTAREA`. Backspace with focus on a `<select>`, a contenteditable element, or a button navigates to `/` and discards the tool's in-memory state.
- Fix: also skip `SELECT`, `isContentEditable`, and events with modifier keys. Consider dropping the shortcut for tools with unsaved state.

## 4. Privacy claims do not match behavior

- `index.html:10-12` loads Inter and JetBrains Mono from `fonts.googleapis.com` on every visit. This sends the visitor's IP address to Google. README says "Zero Network Calls" and the footer says "No data leaves your browser" (`src/App.tsx:185`). The fonts are also not in the service worker precache, so offline use falls back to system fonts.
- The footer checkbox "Local Usage Stats" (`src/App.tsx:186-189`) only hides the counts. `increment` keeps writing to `localStorage` when it is unchecked (`src/hooks/useToolStats.ts:53-72`). The comment says this is intended, but a user who unchecks the box will expect counting to stop.
- Fix: self-host the fonts. Either stop counting when disabled or rename the control to "Show usage stats".

## 5. `npm run deploy` publishes a broken build

- Where: `package.json` scripts `predeploy` and `deploy`, `vite.config.ts:6`
- `base` is `/toolglass/` only when `GITHUB_ACTIONS` is set. A local `npm run deploy` builds with `base: '/'` and pushes it to `gh-pages`, where every asset path 404s.
- Fix: remove the `deploy` and `predeploy` scripts and the `gh-pages` dependency (CI already deploys), or set the base from a dedicated variable.

## 6. Tools missing from `CATEGORIES` are invisible

- Where: `src/pages/Landing.tsx:9-16` and `:236-238`
- The grid iterates `CATEGORIES`, not the registry. A registered tool whose slug is in no category does not render on the landing page, even under "all". `.github/CONTRIBUTING.md` says a new tool "will auto-appear".
- All 17 current tools are categorized, so nothing is hidden today. Open PRs #93 and #94 add tools and are at risk.
- Fix: add a `category` field to `ToolMeta` and derive the groups, or add a test that every registry slug is in exactly one category.

## 7. Theme details

- `src/hooks/useTheme.ts:17-20` writes the theme to `localStorage` on first mount. The OS-change listener at `:25-29` only acts when nothing is stored, so it never acts after the first load.
- `index.html:6` declares `color-scheme: light` permanently. In dark mode, native controls and scrollbars still render light.
- `index.html:7` `theme-color` is `#f3e7ff`; the PWA manifest in `vite.config.ts:16` uses `#f8fafc`. Neither changes in dark mode.

## 8. Sitemap

- `public/sitemap.xml` lists 12 tools. Missing: `regex`, `json-to-ts`, `api-tester`, `qr`, `markdown`.
- Every entry is a hash URL (`/#/tools/<slug>`). Crawlers drop the fragment, so all entries resolve to the same page. Per-tool indexing needs path routing or prerendered pages.

## 9. Stale tool count

- The registry has 17 tools. `package.json` `description` and `index.html:8` both say 9 and list only the original set.

## 10. Dead scripts

- `patch.js` and `update_tools.js` use `require` in an ESM package, so Node refuses to run them. `update_tools.js` requires `glob`, which is not a dependency. `patch.js` injects a `useToolAction` hook that does not exist. Nothing references either file.

## 11. CI

- `.github/workflows/ci-cd.yml:31` runs `npm install`, so CI does not enforce `package-lock.json`. Use `npm ci`.
- `pages: write` and `id-token: write` are set at workflow level (`:10-13`), so the `verify` job has them on pull requests too. Move them to the `deploy` job.
- CI tests Node 22 only. Issue #67 tracks a matrix.

## 12. Markdown "Copy HTML" is unsanitized

- Where: `src/tools/markdown/MarkdownTool.tsx:88`
- Preview, print, and download use the DOMPurify output. The copy button uses `rawHtml`, straight from `marked`. The preview is safe; the copied HTML can contain script from the input.
- Fix: copy `html`, or label the button as raw output.

## 13. Clipboard calls without error handling

- `src/tools/password/PasswordTool.tsx:13`, `src/tools/nanoid/NanoIdTool.tsx:29`, `src/tools/color/ColorTool.tsx:209`, `src/tools/curl-to-fetch/CurlTool.tsx:804` call `navigator.clipboard.writeText` directly. No fallback and no catch, so a denied permission gives an unhandled rejection and no feedback. `useClipboard` already handles both.

## 14. NanoID alphabet limits

- Where: `src/tools/nanoid/NanoIdTool.tsx:11-24`
- Random bytes are 0..255, so characters past index 255 of a custom alphabet are never chosen. Repeated characters in the alphabet are more likely than others. Neither case is flagged in the UI.

## 15. `Math.random()` use

- `src/tools/timestamp/TimestampTool.tsx:310` (history entry id) and `src/components/ui/Toast.tsx:23` (toast id). Neither is security-relevant. README states "We never use `Math.random()`".

## 16. Dependency leftovers

- `@types/dompurify` is a deprecated stub; `dompurify` ships its own types.
- `sharp` is a devDependency with no reference in the repo. It was likely used once to generate icons.
- `gh-pages` is only used by the broken `deploy` script (issue 5).

## 17. Docs and tracker drift

- `.github/PULL_REQUEST_TEMPLATE.md` refers to `src/tools/registry.ts`. The file is `registry.tsx`.
- `.github/CONTRIBUTING.md` asks for unit and component tests per tool. No tool has a component test.
- GitHub issue #41 ("No error boundary") is open, but `ErrorBoundary` shipped in commit `31ca1ef`.
- GitHub issue #64 says `CurlTool.tsx` is 1860 lines. It is 2083.
- Storage keys use three naming styles: `toolglass-theme`, `tg_ts_history`, and `toolglass_*`. Renaming needs a migration for existing users.
- The nav hint shows "Ctrl K" on every platform (`src/App.tsx:145`); the handler also accepts Cmd.

## 18. Test coverage gaps

- 12 of 17 tools have no tests. None of the 5 hooks has a test; a test for `useUrlState` would have caught issue 1.
- Untested logic worth extracting: cron parsing and date-offset parsing in `TimestampTool.tsx` (L104-242), `parseCurl` in `CurlTool.tsx` (L37-85), `inferType` in `JsonToTsTool.tsx` (L11-64), the NanoID generator.

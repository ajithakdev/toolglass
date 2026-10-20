# Toolglass known issues

First found on 2026-10-10 at commit `18d4d8d` while mapping the repo. Most of those findings were fixed on branch `fix/known-issues` (2026-10-17). This list holds what that branch left open. It was not a full audit: `CurlTool.tsx` and `TimestampTool.tsx` were mapped, not reviewed line by line.

Remove an entry when its fix is merged.

| ID | Severity | Summary |
|---|---|---|
| 2 | Low | CI tests one Node version |
| 4 | Low | Storage keys use three naming styles |
| 5 | Low | Test coverage gaps |
| 6 | Low | Some theme and font edge cases |

## 2. CI Node matrix

- `.github/workflows/ci-cd.yml` tests Node 22 only. Issue #67 tracks a matrix.

## 4. Storage key naming

- Keys use `toolglass-theme`, `tg_ts_history`, and `toolglass_*`. Renaming needs a migration so existing users keep their data.

## 5. Test coverage gaps

- 11 of 17 tools have no tests. Of the hooks, only `useUrlState` has a test.
- Untested logic worth extracting: cron parsing and date-offset parsing in `TimestampTool.tsx`, `parseCurl` in `CurlTool.tsx`, `inferType` in `JsonToTsTool.tsx`.

## 6. Theme and font edge cases

- Before the fix, `useTheme` stored the theme on first load. Visitors from that time still have a stored value, so they will not follow OS theme changes until they clear site data.
- The self-hosted fonts are the latin subset only. Other scripts fall back to system fonts.

# Toolglass working state

Last updated: 2026-10-17, on branch `fix/known-issues` (from `main` at `e176815`).

Update this file at the end of each work session. Keep it short. Delete entries once they are done and merged.

## In progress

- Branch `fix/known-issues`: fixes most findings from the 2026-10-10 list. Needs a PR and a browser check of typing in the URL and Timestamp tools, the theme toggle, and fonts.

## Last session

- 2026-10-17: Fixed `useUrlState` dropped keystrokes (with a test), clamped NanoID and password URL params, NanoID alphabet sampling, Backspace shortcut, theme persistence and `color-scheme`, self-hosted fonts, usage-stats toggle now stops counting, sanitized Markdown copy, clipboard error handling, `Math.random` ids, "Other" landing category, CI `npm ci` and job permissions, removed `deploy` script, dead scripts, and unused deps. Lint, build, and 51 tests pass.
- 2026-10-10: Added `AGENTS.md`, `CLAUDE.md`, `docs/CODEMAP.md`, `docs/STATE.md`. Added `docs/KNOWN-ISSUES.md`. No source changes. Baseline on Node 24.21.0: lint clean, build passes, 41 tests pass.

## Open pull requests (checked 2026-10-10)

| PR | Branch | Subject |
|---|---|---|
| #107 | `dependabot/npm_and_yarn/dompurify-3.4.16` | dompurify 3.4.14 to 3.4.16 |
| #106 | `dependabot/npm_and_yarn/undici-8.11.2` | undici 8.10.1 to 8.11.2 (dev) |
| #94 | `feat/text-case-converter` | Text case converter and slug generator (issue #76). 3 commits ahead of main, last commit 2026-09-08 |
| #93 | `feat/chmod-permissions-calculator` | chmod calculator (issue #82). 3 commits ahead, last commit 2026-09-08 |
| #92 | `test/comprehensive-app-coverage` | Centralized test architecture and coverage. 2 commits ahead, last commit 2026-09-06 |

PRs #92 to #94 are about a month old. #93 and #94 each add a tool, so both touch `src/tools/registry.tsx` and `src/pages/Landing.tsx` and will conflict with each other.

Refresh with `gh pr list` and `gh issue list`. About 40 issues are open, mostly `new tool` requests (#57 to #105).

## Roadmap position

`ROADMAP.md` days 1 to 15 are done. Remaining: day 16 cron explainer (#57; the timestamp tool already has a cron mode), day 17 diff viewer (#58), day 18 lorem and mock data (#59), day 19 CI matrix and Lighthouse budget (#67), day 20 polish and v1.0.0.

## Known issues

6 low-severity findings left in `docs/KNOWN-ISSUES.md`.

## Next steps

Open a PR for `fix/known-issues`. Then: close issue #41, review and rebase PRs #92 to #94, or continue the roadmap at day 17.

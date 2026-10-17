# Toolglass working state

Last updated: 2026-10-10, at commit `18d4d8d` on `main`. Working tree was clean before the context docs were added.

Update this file at the end of each work session. Keep it short. Delete entries once they are done and merged.

## In progress

Nothing.

## Last session

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

18 open findings, ranked, in `docs/KNOWN-ISSUES.md`. Highest: issue 1, `useUrlState` drops keystrokes (reproduced).

## Next steps

None chosen. Candidates: fix issue 1 and add a hook test, work down `docs/KNOWN-ISSUES.md`, review and rebase PRs #92 to #94, or continue the roadmap at day 17.

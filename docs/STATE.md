# Toolglass working state

Last updated: 2026-10-18, on branch `redesign/design-system` (Phases 1 and 2).

Update this file at the end of each work session. Keep it short. Delete entries once they are done and merged.

## In progress

Redesign, per `docs/PLAN.md`. Phase 0 merged (#115). Site live at https://toolglass.ajithakdev.com.

- Phases 1 and 2 together in PR #117 (`redesign/design-system`): design system, shell, home (3D hero, pinned clutter scene), tools hub, about.
- Next: Phase 3 (migrate the 19 tools onto the new primitives; clear hard-coded hex colors and emoji; API Tester mobile #23/#24; split CurlTool #64).
- Main JS bundle is 143 KB gzip, over the 100 KB target; look at framer-motion usage in Phase 5.

## Last session

- 2026-10-18: Merged #93, #94, #106-#109, #112-#115 after Devin review fixes; closed #92. Ruleset on `main` now needs 0 approvals (PR + `verify` still required). Custom domain live with HTTPS. Phase 1 design system built.

- 2026-10-17 (Phase 0): `catalog.ts` + slimmed `registry.tsx`, `seo.ts` and the build plugin, `BrowserRouter` with legacy hash redirect, CNAME, Auto/Light/Dark theme store. 59 tests pass. Checked in headless Chromium: hash redirect, tool titles, clamped URL params.

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

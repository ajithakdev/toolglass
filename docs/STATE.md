# Toolglass working state

Last updated: 2026-10-20, on branch `redesign/tools-migrate` (Phase 3).

Update this file at the end of each work session. Keep it short. Delete entries once they are done and merged.

## In progress

Redesign, per `docs/PLAN.md`. Phases 0 to 2 merged (#115, #117). Site live at https://toolglass.ajithakdev.com.

- Phase 3 steps 1 and 2 on `redesign/tools-migrate`: tool shell, tokens instead of hard-coded colors, emoji removed, API Tester split (#64) with mobile fixes (#23, #24). Lint, build, 124 tests pass.
- Next: Phase 3 step 3 upgrades, one small PR each: timestamp formats (#39), bulk passwords (#38), file hashing (#42), SHA-3 (#25), URL batch (#28), JSON schema (#27), JWT RS256/ES256 (#37), UUID v7 (#60).
- Then rebase dependabot #116 (20 npm bumps), then Phase 4 wave 1.
- Main JS bundle is 143 KB gzip, over the 100 KB target; look at framer-motion usage in Phase 5.

## Last session

- 2026-10-20: Phase 3 steps 1 and 2 committed (`54025b2`), CODEMAP updated for the API Tester split, PR opened.
- 2026-10-18: Merged #93, #94, #106-#109, #112-#115 after Devin review fixes; closed #92. Ruleset on `main` now needs 0 approvals (PR + `verify` still required). Custom domain live with HTTPS. Phase 1 design system built.
- 2026-10-17 (Phase 0): `catalog.ts` + slimmed `registry.tsx`, `seo.ts` and the build plugin, `BrowserRouter` with legacy hash redirect, CNAME, Auto/Light/Dark theme store.

## Open pull requests (checked 2026-10-20)

| PR | Branch | Subject |
|---|---|---|
| #116 | `dependabot/npm_and_yarn/npm-monthly-f0303364e5` | npm-monthly group, 20 updates |

Refresh with `gh pr list` and `gh issue list`. Most open issues are `new tool` requests, mapped to waves in `docs/PLAN.md` Phase 4.

## Known issues

See `docs/KNOWN-ISSUES.md`.

# Toolglass working state

Last updated: 2026-10-20, on `main` (Phase 3).

Update this file at the end of each work session. Keep it short. Delete entries once they are done and merged.

## In progress

Redesign, per `docs/PLAN.md`. Phases 0 to 2 merged (#115, #117). Site live at https://toolglass.ajithakdev.com.

- Phase 3 mostly done: tool shell and tokens (#118), UUID v7 (#119), SHA-3 and file hashing (#122), bulk passwords (#123).
- Left in Phase 3, one small PR each: timestamp formats (#39), URL batch (#28), JSON schema (#27), JWT RS256/ES256 (#37).
- Then Phase 4 wave 1 (new everyday tools).
- v1.0.0 released 2026-10-20 (tag on `9419fbe`). Issue forms, Discussions, and repo topics are set up for student contributors.
- Owner saw no home animations in their browser. The live site animates fine in headless Chromium; their screenshots match the reduced-motion and no-WebGL fallbacks (likely the Flatpak browser on Wayland). Waiting on their console check.
- Follow-ups: file hashing caps at 1 GB because SHA-1/2 go through WebCrypto, which can't stream (needs a streaming JS SHA-1/2 to lift); TypeScript held at 6.x in `dependabot.yml` until typescript-eslint supports 7.
- Main JS bundle is 143 KB gzip, over the 100 KB target; look at framer-motion usage in Phase 5.

## Last session

- 2026-10-20: Merged #118 to #120 and #122 to #124 (Devin review fixed on each). #120 replaced dependabot #116 (TypeScript 7 broke `npm ci`). Issue templates are now forms (#124).
- 2026-10-18: Merged #93, #94, #106-#109, #112-#115 after Devin review fixes; closed #92. Ruleset on `main` now needs 0 approvals (PR + `verify` still required). Custom domain live with HTTPS. Phase 1 design system built.
- 2026-10-17 (Phase 0): `catalog.ts` + slimmed `registry.tsx`, `seo.ts` and the build plugin, `BrowserRouter` with legacy hash redirect, CNAME, Auto/Light/Dark theme store.

## Open pull requests (checked 2026-10-20)

None.

Refresh with `gh pr list` and `gh issue list`. Most open issues are `new tool` requests, mapped to waves in `docs/PLAN.md` Phase 4.

## Known issues

See `docs/KNOWN-ISSUES.md`.

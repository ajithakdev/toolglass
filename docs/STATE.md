# Toolglass working state

Last updated: 2026-10-21, on `main` (Phase 4 waves 1 and 2 done, v1.1.0 released).

Update this file at the end of each work session. Keep it short. Delete entries once they are done and merged.

## In progress

Redesign, per `docs/PLAN.md`. Site live at https://toolglass.ajithakdev.com with 41 tools.

- Done: Phases 0 to 3, Phase 4 wave 1 (#129) and wave 2 (#130). v1.1.0 released 2026-10-21.
- Next session, in this order:
  1. Phase 5 first: bundle size (main JS is about 157 KB gzip against a 100 KB target; the catalog and framer-motion are the suspects), Playwright E2E (#66), Node 20/22 CI and Lighthouse budget (#67), CHANGELOG (#75).
  2. Phase 4 wave 3 (issues labelled `wave-3`). X.509 (#80) and token counter (#63) are the heavy ones.
  3. Small UX: #34 shortcut help modal, #43 copy-last-output shortcut, #68 command palette a11y.
- Partly done, left open on purpose: #58 (diff: side-by-side and JSON mode), #79 (images: batch and before/after slider), #77 (SQL dialects). PDF merge/split is #128 and needs a `pdf-lib` decision.
- Dependencies added with owner approval: `js-yaml` 4.1.0, `smol-toml` 1.9.0 (YAML/TOML tool chunk only). JSON schema validation and the SQL formatter are built in.
- Page container widened from 1200px to 1600px (#129). The API tester and timestamp layouts were not checked at that width.
- Owner saw no home animations in their browser; screenshots match the reduced-motion and no-WebGL fallbacks (likely the Flatpak browser on Wayland). Waiting on their console check.
- Follow-ups: file hashing caps at 1 GB (WebCrypto can't stream SHA-1/2); TypeScript held at 6.x in `dependabot.yml` until typescript-eslint supports 7.
- No bot review on PRs (Devin trial expired). agy cannot test in a browser headless; manual or local headless Chromium checks only.

## Last session

- 2026-10-24: Merged contributor PR #146 (Color tool aria-labels, closes #140), added changelog line.
- 2026-10-22: Issue triage. Closed #58, #75, #77, #79 (already shipped). Commented on #67 (drop the Node matrix, keep the Lighthouse budget). Opened #136 for #68 (palette a11y). Filed #137-#145 from a repo scan: cron bugs, clear-data keys, Markdown remote images and CSP, bundle size, docs drift, CI cancel on main.
- 2026-10-21 (later): Shipped wave 1 (#129, 9 tools plus 1600px layout) and wave 2 (#130, 12 tools), released v1.1.0.
- 2026-10-21: Merged #127 (end of Phase 3). Triaged all open issues: closed done or duplicate ones (#22, #26, #29-#32, #35, #36, #41, #57, #69), added `wave-2`, `wave-3`, `phase-5`, `later` labels, posted updated file pointers on tool issues, opened #128 for PDF. Devin review trial expired, so PRs get no bot review now.
- 2026-10-20: Merged #118 to #120 and #122 to #124 (Devin review fixed on each). #120 replaced dependabot #116 (TypeScript 7 broke `npm ci`). Issue templates are now forms (#124).
- 2026-10-18: Merged #93, #94, #106-#109, #112-#115 after Devin review fixes; closed #92. Ruleset on `main` now needs 0 approvals (PR + `verify` still required). Custom domain live with HTTPS. Phase 1 design system built.
- 2026-10-17 (Phase 0): `catalog.ts` + slimmed `registry.tsx`, `seo.ts` and the build plugin, `BrowserRouter` with legacy hash redirect, CNAME, Auto/Light/Dark theme store.

## Open pull requests (checked 2026-10-22)

- #136 `fix/palette-a11y` (closes #68): CI green, waiting for the owner to approve the merge.

Refresh with `gh pr list` and `gh issue list`. Most open issues are `new tool` requests, mapped to waves in `docs/PLAN.md` Phase 4.

## Known issues

See `docs/KNOWN-ISSUES.md`.

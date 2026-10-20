# Toolglass working state

Last updated: 2026-10-21, on `tools/wave-1` (Phase 4).

Update this file at the end of each work session. Keep it short. Delete entries once they are done and merged.

## In progress

Redesign, per `docs/PLAN.md`. Phases 0 to 2 merged (#115, #117). Site live at https://toolglass.ajithakdev.com.

- Phase 3 mostly done: tool shell and tokens (#118), UUID v7 (#119), SHA-3 and file hashing (#122), bulk passwords (#123).
- Phase 3 done (#127 merged 2026-10-21).
- Phase 4 wave 1 PR (branch `tools/wave-1`): word counter, text diff, notepad, unit converter, percentage, world clock, timer, image compressor (with EXIF strip), screen recorder. PDF merge/split moved to #128 (needs `pdf-lib` approval).
- Next: Phase 4 wave 2 (issues labelled `wave-2`).
- Small UX issues still open: #34 shortcut help modal, #43 copy-last-output shortcut, #68 command palette a11y.
- JSON schema uses a built-in subset validator; `ajv` would need maintainer approval as a new dependency.
- Owner saw no home animations in their browser. The live site animates fine in headless Chromium; their screenshots match the reduced-motion and no-WebGL fallbacks (likely the Flatpak browser on Wayland). Waiting on their console check.
- Follow-ups: file hashing caps at 1 GB because SHA-1/2 go through WebCrypto, which can't stream (needs a streaming JS SHA-1/2 to lift); TypeScript held at 6.x in `dependabot.yml` until typescript-eslint supports 7.
- Main JS bundle is 143 KB gzip, over the 100 KB target; look at framer-motion usage in Phase 5.

## Last session

- 2026-10-21: Merged #127 (end of Phase 3). Triaged all open issues: closed done or duplicate ones (#22, #26, #29-#32, #35, #36, #41, #57, #69), added `wave-2`, `wave-3`, `phase-5`, `later` labels, posted updated file pointers on tool issues, opened #128 for PDF. Devin review trial expired, so PRs get no bot review now.
- 2026-10-20: Merged #118 to #120 and #122 to #124 (Devin review fixed on each). #120 replaced dependabot #116 (TypeScript 7 broke `npm ci`). Issue templates are now forms (#124).
- 2026-10-18: Merged #93, #94, #106-#109, #112-#115 after Devin review fixes; closed #92. Ruleset on `main` now needs 0 approvals (PR + `verify` still required). Custom domain live with HTTPS. Phase 1 design system built.
- 2026-10-17 (Phase 0): `catalog.ts` + slimmed `registry.tsx`, `seo.ts` and the build plugin, `BrowserRouter` with legacy hash redirect, CNAME, Auto/Light/Dark theme store.

## Open pull requests (checked 2026-10-20)

None.

Refresh with `gh pr list` and `gh issue list`. Most open issues are `new tool` requests, mapped to waves in `docs/PLAN.md` Phase 4.

## Known issues

See `docs/KNOWN-ISSUES.md`.

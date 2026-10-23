# toolglass: resources and guide

Every link for Toolglass, what it is for, how to contribute, and how to run and release it. Passwords and keys are never written here.

## TL;DR

- Site: https://toolglass.ajithakdev.com
- Every tool runs entirely in the browser with zero tracking, no cookies, and no server calls.
- Merging to `main` only runs checks. The site deploys when a release tag (`vX.Y.Z`) is pushed: once a week on Sunday, or same day for a hotfix.
- Add tools by adding a folder in `src/tools/`, an entry in `src/tools/catalog.ts`, and visuals in `src/tools/registry.tsx`.
- Before opening a PR: run `npm run lint`, `npm test`, and `npm run build`.

## Links and what each one is for

### Public

| Link | Use it for |
| --- | --- |
| https://toolglass.ajithakdev.com | Home page and tool search |
| https://toolglass.ajithakdev.com/tools | Tools directory with category and audience filters |
| https://toolglass.ajithakdev.com/about | Privacy model, local storage breakdown, and project info |
| https://toolglass.ajithakdev.com/sitemap.xml | XML sitemap generated at build time |

### Behind the scenes

| Link | Use it for |
| --- | --- |
| https://github.com/ajithakdev/toolglass | Source code and discussions |
| https://github.com/ajithakdev/toolglass/issues | Bug reports, feature requests, and tool ideas |
| https://github.com/ajithakdev/toolglass/actions/workflows/ci-cd.yml | CI verify and GitHub Pages deploy workflow |
| https://github.com/ajithakdev/toolglass/releases | Published releases and release notes |

## Accounts

| Service | Account | Role |
| --- | --- | --- |
| GitHub | `ajithakdev` | Owner |

## Contributor guide

1. Pick an issue or tool request from https://github.com/ajithakdev/toolglass/issues.
2. Create `src/tools/<slug>/<Name>Tool.tsx` and place pure logic in `src/tools/<slug>/<slug>.ts`.
3. Register the metadata in `src/tools/catalog.ts` and add the icon and component to `src/tools/registry.tsx`.
4. Run `npm test`, `npm run lint`, and `npm run build` to verify tests, styles, and types.
5. Push to a branch and open a pull request against `main` using Conventional Commits.

## Run and release

| Job | How |
| --- | --- |
| Run locally | `npm install`, then `npm run dev` |
| Run tests | `npm test` or `npm test src/tools/<slug>/` |
| Check lint | `npm run lint` or `npm run lint -- --fix` |
| Build and type-check | `npm run build` |
| Preview build | `npm run preview` |
| Deploy | Push a `vX.Y.Z` tag (the release does this). Merges to `main` are checked but not deployed |
| Release (every Sunday) | Patch if the week had only fixes, minor if it added a tool or feature. Move `## [Unreleased]` in `CHANGELOG.md` under `## [X.Y.Z] - date`, bump `package.json`, commit `chore: release vX.Y.Z`, tag `vX.Y.Z`, push the tag, then `gh release create` with that changelog section |
| Hotfix (broken tool, security) | Same release steps the same day, as a patch |
| Redeploy without a release | Actions, CI/CD, "Run workflow" on `main` |

## When something goes wrong

| Problem | Fix |
| --- | --- |
| Merged change is not live | Expected: only release tags deploy. Cut a release, or run the workflow by hand for an urgent fix |
| Release tag did not deploy | Check that the `github-pages` environment allows tags `v*` (Settings, Environments) |
| Direct tool route 404s on GitHub Pages | Run `npm run build` to generate `tools/<slug>.html` and `404.html` via the `seoPages` plugin |
| Theme does not follow system changes | Clear localStorage `toolglass-theme` key if an older version set a permanent mode |
| Scroll animation fades out in pinned sections | Use `useRange` in `src/pages/Home.tsx` instead of plain `useTransform` |
| Three.js object invisible through glass | Use `alphaTest` instead of `transparent` on the material |
| File hashing fails on huge files | Files are capped at 1 GB because Web Crypto cannot stream SHA-1 or SHA-2 text |

## More detail

- `docs/CODEMAP.md`: architecture, file list, conventions, storage keys, and large file maps
- `docs/STATE.md`: current work, shipped phases, and next steps
- `docs/KNOWN-ISSUES.md`: open bugs, testing gaps, and edge cases
- `docs/PERFORMANCE.md`: Lighthouse scores and what to fix next
- `docs/PLAN.md`: roadmap, architecture decisions, and design principles
- `CHANGELOG.md`: version history and release notes
- `.github/CONTRIBUTING.md`: tool conventions, coding standards, and PR checklist

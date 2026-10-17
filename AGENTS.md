# Toolglass — agent instructions

Client-side developer tools SPA. React 19, TypeScript (strict), Vite 8, Vitest, framer-motion, lucide-react. No backend. Deployed to GitHub Pages by CI.

## Read this before exploring

Do not scan the repo. The map already exists.

1. `docs/CODEMAP.md` — every file, what it does, line counts, conventions, storage keys, gotchas, and section maps for the large files. Read it first, then open only the files the task needs.
2. `docs/STATE.md` — work in progress, open PRs and branches, next steps. Read it when resuming work.
3. `docs/KNOWN-ISSUES.md` — ranked bugs and cleanup items with file and line. Read it before fixing bugs, and remove an entry when its fix is merged.

Both files record the commit they were written at. To see what changed since, run:

```bash
git diff --stat <that-commit>..HEAD -- src
```

Read only the changed files, then update the map.

## Keep the map current

- Add, remove, rename, or restructure a file: update `docs/CODEMAP.md` in the same change, and bump its "Mapped at commit" line.
- End of a work session, or before context runs out: update `docs/STATE.md` (what was done, what is half-done, what is next).

## Commands

```bash
npm install          # node_modules is not committed
npm run dev          # Vite dev server
npm run lint         # ESLint
npm run build        # tsc -b, then vite build
npm test             # vitest run (jsdom)
npm test src/tools/<slug>/   # one tool
npm test -- -t "<test name>" # one test by name
```

CI runs lint, build, test in that order on Node 22. All three must pass.

## Rules

- 100% client-side. No network calls except the API Tester's user-initiated `fetch`. No analytics.
- Randomness: `crypto.getRandomValues` with rejection sampling. Never `Math.random()` for generated values.
- No new runtime dependency without maintainer approval. Prefer Web APIs.
- Styling: inline `style={{}}` objects plus CSS variables from `src/index.css`. No CSS modules, no Tailwind. Use the variables so dark mode works.
- New tool: follow "Adding a tool" in `docs/CODEMAP.md`.
- Never persist credentials to `localStorage`. See `src/tools/curl-to-fetch/curlSecurity.ts`.
- Commits: Conventional Commits, `type(scope): subject`.
- Tool data goes in `src/tools/catalog.ts`; icons and components in `src/tools/registry.tsx`. Never add a second slug list.
- Routes are clean paths (`/tools/<slug>`), not hash URLs. Site URL lives in `src/seo.ts`.
- Plan for the redesign: `docs/PLAN.md`.

# Contributing to Toolglass

Welcome! Toolglass is a React + TypeScript + Vite app with client-side developer utilities. Contributions of all sizes are welcome.

## Quick start

```bash
git clone https://github.com/ajithakdev/toolglass.git
cd toolglass
npm install
npm run dev
```

Requires **Node 20+** (or Node 22/26 via nvm).

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server with HMR |
| `npm run build` | Type-check + production build (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run lint -- --fix` | Auto-fix lint issues |
| `npm test` | Run all tests (Vitest) |
| `npm run test:coverage` | Tests with coverage report |

## Linting

ESLint is configured with TypeScript and React hooks/refresh plugins. Run `npm run lint` before committing. Many issues can be auto-fixed:

```bash
npm run lint -- --fix
```

## TypeScript

This project uses **strict TypeScript** (`strict: true` in `tsconfig.json`). All new code must pass `tsc` type-checking — the build script (`npm run build`) runs `tsc -b` before Vite. Avoid `any`; prefer precise types and `unknown` where needed.

## Testing

Tests use **Vitest** with `jsdom` environment. Test files live alongside source as `*.test.ts` / `*.test.tsx` (e.g. `src/tools/<name>/<name>.test.ts`).

```bash
npm test                        # run all tests once
npm test src/tools/password/    # run tests for a specific tool
npm run test:coverage           # coverage report
```

Zero/minimal external dependencies: Prefer native browser Web APIs (e.g. Web Crypto, URL, Canvas, DOMParser, regex). Introducing new runtime dependencies requires prior maintainer discussion and strong justification (as done for established standards like `marked`, `dompurify`, and `qrcode`).

## Adding a new tool

Tools follow a modular registry pattern:

1. Create `src/tools/<slug>/<Name>Tool.tsx` with a default-export component.
2. Put pure logic in `src/tools/<slug>/<slug>.ts` and unit-test it in `<slug>.test.ts`. Component tests (`<slug>Tool.test.tsx`) are welcome.
3. Add an entry to `catalog` in `src/tools/catalog.ts`:

```ts
{
  slug: 'my-tool',
  title: 'My Tool',
  short: 'Short description',
  description: 'One or two sentences for the card and the page meta.',
  category: 'text',              // see CATEGORIES in catalog.ts
  audience: ['everyone'],        // who it is for
  keywords: ['word', 'count'],   // extra search terms
  replaces: 'paid word-count apps', // optional: what it saves people from
},
```

4. Add the icon and component for the same slug to `visuals` in `src/tools/registry.tsx`:

```tsx
'my-tool': {
  icon: <MyIcon size={22} strokeWidth={1.5} color="var(--ink)" />,
  tint: 'linear-gradient(135deg, #hex, #hex)',
  Component: lazy(() => import('./my-tool/MyTool')),
},
```

5. The tool gets a page at `/tools/<slug>`, its own prerendered HTML, and a sitemap entry, all from the catalog entry.

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for all contributors. Please review and adhere to our [Code of Conduct](../CODE_OF_CONDUCT.md) in all project interactions.

## Branch and commit naming

Follow Conventional Commits:

- `feat(scope): add new tool` — new feature
- `fix(scope): correct hash output` — bug fix
- `chore(scope): update deps` — maintenance
- `docs(scope): improve README` — documentation
- `test(scope): add crypto tests` — tests

Scope is the area affected (e.g., `password`, `hash`, `ci`, `docs`).

## Pull request checklist

- [ ] `npm run lint` passes (no warnings or errors)
- [ ] `npm test` passes (all existing + new tests)
- [ ] `npm run build` passes (type-check + production build)
- [ ] No breaking changes (or clearly described if unavoidable)
- [ ] Related issues linked in the description (e.g., `Closes #12`)
- [ ] Testing instructions included for reviewers

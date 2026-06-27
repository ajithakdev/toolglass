# Contributing to Toolglass

Welcome! Toolglass is a React + TypeScript + Vite app with client-side developer utilities. Contributions of all sizes are welcome.

## Quick start

```bash
git clone https://github.com/ajithakdev/toolglass.git
cd toolglass
npm install
npm run dev
```

Requires **Node 20+**.

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

Tests use **Vitest** with `jsdom` environment. Test files live alongside source as `*.test.ts` / `*.test.tsx`.

```bash
npm test                        # run all tests once
npm test -- tests/crypto        # run a specific test file or path
npm run test:coverage           # coverage report
```

Crypto-related tools (password, hash, JWT, UUID, ObjectId, NanoID) have dedicated test suites — run those explicitly when touching crypto paths.

## Adding a new tool

Tools follow a registry pattern — no routing config to touch.

1. Create `src/tools/<slug>/<Name>Tool.tsx` with a default-export component.
2. Append an entry to `src/tools/registry.ts`:

```ts
{
  slug: 'my-tool',
  title: 'My Tool',
  short: 'Short description',
  description: 'Longer description for the landing card.',
  icon: <MyIcon size={22} strokeWidth={1.5} color="var(--ink)" />,
  tint: 'linear-gradient(135deg, #hex, #hex)',
  Component: lazy(() => import('./my-tool/MyTool')),
},
```

The tool auto-appears on the landing page and gets a route at `/#/tools/<slug>`.

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

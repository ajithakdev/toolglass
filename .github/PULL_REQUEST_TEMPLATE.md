## Summary

<!-- One-line description of what this PR does -->

## Checklist

- [ ] `npm run lint` passes
- [ ] `npm test` passes (all tests green)
- [ ] `npm run build` passes (type-check + production build)
- [ ] No breaking changes (or documented below)
- [ ] Related issues linked (e.g., `Closes #12`, `Fixes #8`)
- [ ] Testing instructions included below

## Testing instructions for reviewer

<!-- Steps to verify the change locally -->

```bash
npm install
npm run dev
# 1. Navigate to …
# 2. Enter …
# 3. Verify …
```

If this PR touches crypto paths (password, hash, JWT, UUID, ObjectId, NanoID), run:

```bash
npm test -- tests/crypto
```

## Breaking changes

<!-- If any, describe migration or rationale. Otherwise delete this section. -->

## Example

A good PR description is short, links context, and tells the reviewer exactly what to verify:

> Adds a new NanoID tool with configurable alphabet and length. Follows the
> registry pattern — only `src/tools/registry.ts` and the new `nanoid/` folder
> were touched. Closes #15.

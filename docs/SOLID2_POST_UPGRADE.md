# After upgrading Solid / Start packages

Use this as a checklist (or paste as an agent prompt) when bumping `solid-js`, `@solidjs/web`, `@solidjs/router`, `@solidjs/meta`, `@solidjs/start`, or `vite-plugin-solid`.

## Do

1. Install with force if peers conflict: `npm install --force`
2. Keep store APIs from `solid-js` only — never `solid-js/store` or a path-setter compat layer
3. Keep writes draft-first:
   - `setStore((d) => { d.foo = value; })`
   - graph mutators via `produceGraph(setGraph, (d) => { ... })`
4. Drop leftover `batch(...)` wrappers (Solid 2 batches by default)
5. Keep `tsconfig` `jsxImportSource` as `@solidjs/web`
6. Keep vite alias only if needed: `"solid-js/web": "@solidjs/web"`
7. Re-run codemods only if the bump reintroduces Solid 1 patterns:
   - `node scripts/solid2-codemod.mjs`
   - `node scripts/path-setters-to-draft.mjs`

## Verify

```bash
npm run test:graph
npx playwright test tests/smoke/auth-signin-logout.spec.ts --project=chromium
```

Skip production `npm run build` / `check-errors` unless you explicitly want a Start peer / export audit.

## Do not

- Restore `src/lib/solid-compat` or a `solid-js/store` shim
- Use `storePath(...)` path setters
- Convert vertex data out of Neo4j vertex shape (`vertex.P.*`)

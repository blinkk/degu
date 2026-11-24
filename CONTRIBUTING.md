# Developing Degu

## Prerequisites

- Node.js 18+ (20 or 22 recommended)

## Installation

```bash
npm install
```

## Common Development Commands

```bash
# Build compiled ESM library and .d.ts declarations into /lib
npm run build
npm run build-watch

# Run unit and component tests with Vitest
npm test
npm run test:watch
npm run coverage

# Typecheck, lint, and format (Biome)
npm run typecheck
npm run lint
npm run fix

# Run the examples dev server (Vite)
npm run dev

# Build static examples and API docs
npm run examples
npm run doc
```

## Development Guidelines

- Document public APIs with [TypeDoc](https://typedoc.org/guides/doccomments/) comments.
- When adding a new utility or component, add a focused example in `/examples`
  using vanilla JS where possible so it is easy to learn from.
- Use Conventional Commits for automated releases via `release-please`:
  - `feat: ...` (minor bump)
  - `fix: ...` (patch bump)
  - `chore: ...`, `docs: ...`, `refactor: ...`

## Releases

Releases are automated via GitHub Actions (`.github/workflows/release-please.yml`):

1. Merging conventional commits to `main` automatically opens or updates a
   Release Please PR with version bumps and `CHANGELOG.md` entries.
2. Merging the Release Please PR tags the release, creates a GitHub Release,
   builds and tests `@blinkk/degu`, and publishes to npm via OIDC Trusted
   Publishing (`--provenance --access public`).

## Project Structure

```text
/docs      -> Generated API docs (TypeDoc)
/examples  -> Interactive examples (Vite)
/lib       -> Compiled ESM library and type declarations (tsup)
/src       -> TypeScript source and Vitest tests
```

## Local npm Linking

```bash
# In the degu repo:
npm link

# In your target project:
npm link @blinkk/degu

# To unlink:
npm unlink --no-save @blinkk/degu
```

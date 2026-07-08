# Contributing

Thanks for your interest in contributing to Polyconv!

## Prerequisites

- Node.js 22+
- pnpm 11.9.0

## Getting started

```bash
git clone https://github.com/wingkwong/polyconv.git
cd polyconv
pnpm install
```

## Development workflow

Use these commands from the repository root:

```bash
pnpm build         # Build all packages
pnpm test          # Run all tests
pnpm lint          # Run lint checks
pnpm typecheck     # Run TypeScript checks
pnpm format:check  # Check formatting
pnpm format        # Format code
```

Run the full verification set before opening a pull request:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

## Project structure

- `packages/core` - shared types, errors, and validation helpers
- `packages/json` - JSON-focused data operations (convert/format/minify)
- `packages/cli` - command-line interface
- `packages/standard` - shared TypeScript config

## Pull request guidelines

1. Create a branch from `develop`.
2. Keep changes focused and atomic.
3. Update docs when behavior or commands change.
4. Add or update tests when behavior changes.
5. Ensure the full verification set passes locally.
6. Do not commit generated `dist/`, coverage, or package tarballs.
7. Open a PR with:
   - a clear summary of changes
   - rationale for the change
   - any migration or usage notes

## Documentation changes

When changing CLI behavior or public APIs, update the relevant README:

- root `README.md` for project-level usage and package overview
- `packages/cli/README.md` for command behavior
- `packages/json/README.md` for JSON API behavior
- `packages/core/README.md` for shared types and helper APIs

## Release checklist

The first published version for each public package is `0.1.0`. Packages are versioned and published independently, so release only the package whose public API or runtime behavior changed.

Maintainers should release from `main` after changes have landed through `develop` and passed CI. Verify the package contents before publishing:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
for package in packages/core packages/json packages/cli; do
  (cd "$package" && pnpm pack --dry-run)
done
```

Each published package should include `dist`, `README.md`, `LICENSE`, and `package.json`.

Use the `Publish` GitHub Actions workflow to deploy one package at a time. Select `core`, `json`, or `cli`; keep `dry_run` enabled to verify the tarball only, or disable it to publish from `main`.

Publishing requires the repository secret `NPM_TOKEN` with permission to publish the `@polyconv` packages. Publish dependency packages first:

1. `@polyconv/core`
2. `@polyconv/json`
3. `@polyconv/cli`

To publish one package manually outside GitHub Actions, use pnpm so `workspace:*` dependencies are rewritten to concrete package versions:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test

cd packages/json
pnpm pack --dry-run
pnpm publish --access public
```

Replace `packages/json` with `packages/core` or `packages/cli` as needed.

## Pull request description

Please include:

- a clear summary of changes
- rationale for the change
- any migration or usage notes

## Commit guidance

- Write clear, descriptive commit messages.
- Prefer small commits that are easy to review.

## Reporting issues

When opening an issue, please include:

- expected behavior
- actual behavior
- reproduction steps
- environment details, including OS, Node.js, and pnpm versions

# Contributing

Thanks for helping improve react-native-responsive-hook. Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

```bash
nvm use            # Node version from .nvmrc
npm install        # also builds lib/ via the prepare script
```

## Before opening a pull request

```bash
npm run lint           # ESLint (typescript-eslint, React Hooks rules)
npm test               # Jest; 100% coverage is enforced with --coverage
npm run typecheck      # src, tests and type-level assertions
npm run build          # react-native-builder-bob: ESM, CommonJS, .d.ts
npm run lint:package   # publint + are-the-types-wrong on the packed tarball
```

- Write the failing test first, then the fix. Behavioural tests live in `src/__tests__/`; type-level assertions in `src/__tests__/types.test.ts`.
- Keep changes backwards compatible. Deprecate rather than remove, and don't change the output of an existing function without a major version.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`fix:`, `feat:`, `docs:`, `chore:`), which drive the release notes.

## Releases

Add user-facing changes to the `[Unreleased]` section of `CHANGELOG.md` in the same pull request.

Maintainers publish from GitHub Actions with npm trusted publishing (no tokens):

```bash
gh workflow run release.yml -f ref=<full commit sha> -f dist-tag=latest
```

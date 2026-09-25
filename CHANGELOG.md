# Changelog

All notable changes to this package. Versions follow [Semantic Versioning](https://semver.org/); each release is also on [GitHub Releases](https://github.com/mz-real/react-native-responsive-hook/releases).

## [Unreleased]

### Added
- **`react-native-responsive-hook/testing`** with `MockWindowProvider`: renders everything below it at a chosen window size, for tests, Storybook and previews, without mocking `useWindowDimensions`.
- **`ssr: true`** on `ResponsiveProvider` (with `initialWindow`): renders with `initialWindow` until mounted, so server HTML and the client's first render match for every client.

### Repository
- ESLint (typescript-eslint, React Hooks rules) in CI.
- `examples/` replaced by a current Expo SDK 57 example app in `example/`, type-checked and bundled in CI.

## [1.5.0] — 2026-09-25

### Changed
- **An invalid `ResponsiveProvider` config no longer crashes production apps.** In development it still throws an error naming the offending keys. In production (`__DEV__` false, or `NODE_ENV=production` where `__DEV__` is not defined) it logs that error with `console.error` and uses the default config.

No other changes. Valid configs behave exactly as before.

## [1.4.0] — 2026-09-25

Backwards compatible. Return values are unchanged everywhere.

### Added
- **`initialWindow` on `ResponsiveProvider`**: `{ width, height, fontScale? }` is used while React Native reports an unmeasured 0×0 window, which happens during server-side rendering with react-native-web and in rare native first renders. Previously you got `xs` and zero sizes. It is ignored once the real window has a size. It only avoids hydration mismatches for clients whose window matches it; see the README.
- **Development warnings for invalid size inputs**: `''`, `'abc'`, `'50vw'` or `NaN` passed to any size helper logs a one-time warning when `__DEV__` is true, capped at 20 distinct inputs. **Return values are unchanged.** React Native's Jest preset sets `__DEV__`, so these warnings may show up in your test output. If your suite fails on console output, fix the inputs it reports.

### CI
- Every change is now type-checked as a React Native 0.81 consumer would see it, with both the default and the strict TypeScript API.

## [1.3.0] — 2026-09-25

Backwards compatible. With no provider, every existing output is unchanged.

### Added
- **`createResponsiveStyles(factory)`** defines styles once at module scope and returns a hook. The styles rebuild when the window size, font scale or provider config changes, so they follow rotation. Otherwise they keep the same identity. They are fully typed against React Native style types, including RN 0.80+'s strict TypeScript API.
  ```tsx
  const useStyles = createResponsiveStyles(({ wp, s, select, fontSize }) => ({
    card: { width: wp(90), padding: s(12), flexDirection: select({ xs: 'column', md: 'row', default: 'column' }) },
  }));
  ```
- **`s`, `vs` and `mvs`** are react-native-size-matters style scale helpers, alongside the existing `ms`. They come from the hook, so they update on rotation. The README has a migration table.
- **`isTablet`** is true when the window's shorter edge is at least 600dp (Android's `sw600dp` convention).

### Docs
- New README introduction with a quick start and a comparison against react-native-size-matters and react-native-responsive-screen.
- `fontSize()` applies the OS text scale itself. Use it with `<Text allowFontScaling={false}>` to avoid double scaling, or use `s()`/`ms()` with native scaling.

### Types
- `UseResponsiveReturn` gains the required members `s`, `vs`, `mvs` and `isTablet`. If you build this type by hand, for example in a Jest mock, add them.

### Repository
- Actions are pinned to commit SHAs. The release job refuses to republish an existing version and checks the packed package with publint and arethetypeswrong before publishing.
- Added Dependabot, a bug-report form and CONTRIBUTING.md.

## [1.2.1] — 2026-09-25

Patch release: bug fixes and type improvements. Backwards compatible.

### Fixed
- `fontSize` returned `NaN` when `fontScale` was missing (older react-native-web, custom mocks). It now treats it as 1.
- `listenOrientationChange` leaked the first listener when called twice.
- Legacy `remUnit` used a stale screen size after a dimension change.
- The type declarations now resolve under Node ESM (`moduleResolution: node16/nodenext`). `@arethetypeswrong/cli` reports no problems.

### Types
- With a `default` key, `select()` now returns `T` instead of `T | undefined`. The `Select` type is exported.
- `ResponsiveProvider` returns `ReactElement` and no longer exposes an internal type.

### Package
- Accurate npm description and keywords; README corrections.
- CI enforces 100% test coverage and checks the packed package with publint and arethetypeswrong.

## [1.2.0] — 2026-09-25

Backwards compatible. With no provider, every existing output is unchanged.

### Added
- **`ResponsiveProvider`**: optionally sets the base device and breakpoint thresholds for every `useResponsive()` below it. The config is validated, and invalid values throw an error naming the key. Inline `config={{...}}` objects are fine.
  ```tsx
  <ResponsiveProvider config={{ baseDevice: { width: 390, height: 844 }, breakpoints: { md: 640, lg: 1024 } }}>
  ```
- **`ms(size, factor = 0.5)`**: moderate scale. It uses the same formula as react-native-size-matters' `moderateScale`, against a 375dp baseline, rounded to the nearest pixel.

### Fixed
- Fractional widths such as `399.5`dp, which Android can report, fell between the integer breakpoint ranges and resolved to `xxl`. They now resolve to the lower breakpoint.

### Chore
- CI now uses `actions/checkout` and `setup-node` v7.

Published with npm provenance from GitHub Actions.

## [1.1.0] — 2026-09-25

TypeScript rewrite. Existing APIs are deprecated but still work, and nothing breaks.

### Added
- **`breakpoint`**: named breakpoints `xs | sm | md | lg | xl | xxl`, mapped onto the existing width groups.
- **`select(map)`**: picks a value by breakpoint, mobile-first. For example, `select({ sm: 12, lg: 20 })` gives 12 on `sm` and `md`, and 20 from `lg` up.
- **`fontSize(size)`**: scales with the screen size and respects the text size the user set in the OS.
- **Memoized `useResponsive()`**: the helper functions it returns keep the same identity until the width, height or font scale changes.
- Builds as ESM and CommonJS with generated TypeScript types and an `exports` map. The package is `sideEffects: false`.

### Deprecated (behaviour unchanged)
`rf` (use `fontSize`), `breakpointGroup` (use `breakpoint`), `widthPercentageToDP`, `heightPercentageToDP`, `listenOrientationChange`, `removeOrientationListener`, and the module-level `isLandscape`, `isPortrait` and `breakpointGroup` constants.

### Fixed
- `group6` returned `undefined` for widths above 8192dp. Its range now has no upper limit.

Published with npm provenance from GitHub Actions.

## [1.0.5] — 2026-09-25

Hotfix for 1.0.x. No API changes.

- **Fixed crash on import.** `base` was computed from `isLandscape` before it was declared. On Hermes this threw `ReferenceError: Cannot access 'isLandscape' before initialization` when the module loaded.
- **Fixed `removeOrientationListener()`.** It called `Dimensions.removeEventListener`, which was removed in RN 0.72, so it threw a `TypeError`. It also never removed the handler that had been registered. It now keeps the subscription and calls `.remove()` on it.
- **Smaller package.** The bundled Expo example apps are no longer published: 33 files / 802 kB went down to 8 files / 25.7 kB.

[Unreleased]: https://github.com/mz-real/react-native-responsive-hook/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.5.0
[1.4.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.4.0
[1.3.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.3.0
[1.2.1]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.2.1
[1.2.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.2.0
[1.1.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.1.0
[1.0.5]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.0.5

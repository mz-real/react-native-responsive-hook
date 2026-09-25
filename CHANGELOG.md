# Changelog

All notable changes to this package. Versions follow [Semantic Versioning](https://semver.org/); each release is also on [GitHub Releases](https://github.com/mz-real/react-native-responsive-hook/releases).

## [Unreleased]

## [1.6.3] - 2026-09-25

### Docs
- The README links to the updated Medium article with a clearer description, and the demo GIF is sharper. No code changes.

## [1.6.2] - 2026-09-25

### Docs
- The README shows the example app in action: a GIF of the layout going from one to three columns as the window widens, and iPhone screenshots in portrait and landscape. No code changes.

## [1.6.1] - 2026-09-25

A docs-only release. The README is rewritten in plainer language, and the code is unchanged.

## [1.6.0] - 2026-09-25

Backwards compatible.

### Added
- `react-native-responsive-hook/testing` exports `MockWindowProvider`, which makes everything inside it render at a window size you choose. Use it in tests, Storybook and previews without having to mock `useWindowDimensions`.
- `ResponsiveProvider` accepts `ssr: true` together with `initialWindow`. It renders with `initialWindow` until it has mounted, so the server HTML and the client's first render match for every visitor. It only applies on the web and only to the first page load (providers that mount later use the real window straight away), and it works under StrictMode. In production, `ssr` without an `initialWindow` is ignored and the rest of your config is kept.

### Fixed
- The ESM and CommonJS builds now share the same contexts, so the providers still work in an app that ends up loading both.
- `removeOrientationListener` is marked `@deprecated` in the published types again.

### Repository
- ESLint (typescript-eslint and the React Hooks rules) runs in CI.
- The old `examples/` folder is replaced by a current Expo SDK 57 app in `example/`, which CI type-checks and bundles.

## [1.5.0] - 2026-09-25

### Changed
- An invalid `ResponsiveProvider` config no longer crashes apps in production. In development it still throws an error that names the problem key. In production (`__DEV__` false, or `NODE_ENV=production` where `__DEV__` isn't defined) it logs that error with `console.error` and falls back to the default config.

Nothing else changed. Valid configs behave exactly as before.

## [1.4.0] - 2026-09-25

Backwards compatible. No function returns a different value.

### Added
- `ResponsiveProvider` accepts `initialWindow: { width, height, fontScale? }`. It's used while React Native reports an unmeasured 0×0 window, which happens during server-side rendering with react-native-web and occasionally on a native first render. Before, you'd get `xs` and zero sizes in that case. It stops being used once the real window has a size. On its own it only avoids a hydration mismatch for visitors whose window matches it; the README explains the details.
- Size helpers now warn in development about input they can't read properly, such as `''`, `'abc'`, `'50vw'` or `NaN`. The warning appears once per input when `__DEV__` is true, at most 20 times in total. The return values don't change. React Native's Jest preset sets `__DEV__`, so you may see these warnings in test output. If your test setup fails on console output, fix the inputs it points to.

### CI
- Every change is type-checked the way an app on React Native 0.81 would see it, with both the default and the strict TypeScript API.

## [1.3.0] - 2026-09-25

Backwards compatible. If you don't add a provider, every value is the same as before.

### Added
- `createResponsiveStyles(factory)` lets you define styles once at module level and gives you a hook to read them. The styles are rebuilt when the window size, font scale or provider config changes, so they follow rotation, and otherwise you get the same object back. They're type-checked against React Native's style types, including the strict TypeScript API in RN 0.80 and later.
  ```tsx
  const useStyles = createResponsiveStyles(({ wp, s, select, fontSize }) => ({
    card: { width: wp(90), padding: s(12), flexDirection: select({ xs: 'column', md: 'row', default: 'column' }) },
  }));
  ```
- `s`, `vs` and `mvs` join the existing `ms`, so you have the full set of react-native-size-matters style scale helpers. Because they come from the hook, they update on rotation. The README has a table for migrating from size-matters.
- `isTablet` is true when the shorter side of the window is at least 600dp, the same rule Android uses for `sw600dp`.

### Docs
- The README now opens with a quick start and a comparison with react-native-size-matters and react-native-responsive-screen.
- `fontSize()` applies the OS text size itself. Use it with `<Text allowFontScaling={false}>` so the text isn't scaled twice, or use `s()` or `ms()` if you want React Native's native scaling.

### Types
- `UseResponsiveReturn` has four new required members: `s`, `vs`, `mvs` and `isTablet`. If you build this type by hand, for example in a Jest mock, you'll need to add them.

### Repository
- Actions are pinned to commit SHAs. The release job won't publish a version that's already on npm, and it checks the packed package with publint and arethetypeswrong first.
- Added Dependabot, a bug report form and CONTRIBUTING.md.

## [1.2.1] - 2026-09-25

A patch release with bug fixes and better types. Backwards compatible.

### Fixed
- `fontSize` returned `NaN` when `fontScale` was missing, which happens with older react-native-web and some test mocks. A missing value is now treated as 1.
- Calling `listenOrientationChange` twice left the first listener behind.
- The legacy `remUnit` kept using the old screen size after the dimensions changed.
- The type declarations now resolve under Node ESM (`moduleResolution: node16` or `nodenext`). `@arethetypeswrong/cli` reports no problems.

### Types
- When you give `select()` a `default` key, it now returns `T` instead of `T | undefined`. The `Select` type is exported.
- `ResponsiveProvider` returns `ReactElement` and no longer leaks an internal type.

### Package
- The npm description and keywords are accurate now, and the README has a few corrections.
- CI requires 100% test coverage and checks the packed package with publint and arethetypeswrong.

## [1.2.0] - 2026-09-25

Backwards compatible. If you don't add the new provider, every value is the same as before.

### Added
- `ResponsiveProvider` lets you set your own base device and breakpoint thresholds for every `useResponsive()` inside it. The config is checked, and an invalid value throws an error that names the key. Passing an inline `config={{...}}` object is fine.
  ```tsx
  <ResponsiveProvider config={{ baseDevice: { width: 390, height: 844 }, breakpoints: { md: 640, lg: 1024 } }}>
  ```
- `ms(size, factor = 0.5)` is a moderate scale. It uses the same formula as `moderateScale` in react-native-size-matters, against a 375dp baseline, rounded to the nearest pixel.

### Fixed
- Fractional widths like `399.5`dp, which Android can report, fell between the whole-number breakpoint ranges and came out as `xxl`. They now go to the lower breakpoint.

### Other
- CI uses `actions/checkout` and `actions/setup-node` v7.

Published from GitHub Actions with npm provenance.

## [1.1.0] - 2026-09-25

The library is rewritten in TypeScript. Nothing breaks: the old APIs are deprecated but keep working exactly as before.

### Added
- `breakpoint` gives you a named breakpoint (`xs`, `sm`, `md`, `lg`, `xl` or `xxl`), mapped onto the existing width groups.
- `select(map)` picks a value for the current breakpoint, mobile-first. For example, `select({ sm: 12, lg: 20 })` returns 12 on `sm` and `md`, and 20 from `lg` up.
- `fontSize(size)` scales with the screen size and takes the user's OS text size into account.
- `useResponsive()` is memoized, so the functions it returns keep the same identity until the width, height or font scale changes.
- The package now ships ESM and CommonJS builds with generated TypeScript types, an `exports` map and `sideEffects: false`.

### Deprecated
These still work and return the same values as before: `rf` (use `fontSize`), `breakpointGroup` (use `breakpoint`), `widthPercentageToDP`, `heightPercentageToDP`, `listenOrientationChange`, `removeOrientationListener`, and the module-level `isLandscape`, `isPortrait` and `breakpointGroup` constants.

### Fixed
- `group6` returned `undefined` for widths above 8192dp. It now has no upper limit.

Published from GitHub Actions with npm provenance.

## [1.0.5] - 2026-09-25

A hotfix for the 1.0.x line. The API is unchanged.

### Fixed
- Importing the package no longer crashes. `base` was calculated from `isLandscape` before `isLandscape` was declared, and on Hermes that threw `ReferenceError: Cannot access 'isLandscape' before initialization` as soon as the module loaded.
- `removeOrientationListener()` works again. It called `Dimensions.removeEventListener`, which React Native 0.72 removed, so it threw a `TypeError`. Even on older versions it never removed the handler you'd registered. It now keeps the subscription and calls `.remove()` on it.

### Package
- The Expo example apps are no longer published with the package, which takes it from 33 files and 802 kB down to 8 files and 25.7 kB.

[Unreleased]: https://github.com/mz-real/react-native-responsive-hook/compare/v1.6.3...HEAD
[1.6.3]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.6.3
[1.6.2]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.6.2
[1.6.1]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.6.1
[1.6.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.6.0
[1.5.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.5.0
[1.4.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.4.0
[1.3.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.3.0
[1.2.1]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.2.1
[1.2.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.2.0
[1.1.0]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.1.0
[1.0.5]: https://github.com/mz-real/react-native-responsive-hook/releases/tag/v1.0.5

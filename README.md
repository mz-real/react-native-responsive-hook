# React Native Responsive Hook: Streamline Your UI Across All Devices 🚀

#### Keen on shaping the future of responsive UI? Your contributions are invaluable! Reach out at zakriamuhammad3637@gmail.com.

## Contents
- [The Package](#react-native-responsive-hook)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Migrating from 1.0.x](#migrating-from-10x)
- [Contribute](#want-to-contribute)

## react-native-responsive-hook

[![npm version](https://img.shields.io/npm/v/react-native-responsive-hook.svg)](https://www.npmjs.com/package/react-native-responsive-hook)
[![npm downloads](https://img.shields.io/npm/dm/react-native-responsive-hook.svg)](https://www.npmjs.com/package/react-native-responsive-hook)
[![CI](https://github.com/mz-real/react-native-responsive-hook/actions/workflows/ci.yml/badge.svg)](https://github.com/mz-real/react-native-responsive-hook/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-native-responsive-hook.svg)](LICENSE)

**react-native-responsive-hook** is an intuitive library offering a suite of hooks that make crafting responsive UIs in React Native effortless. It builds upon react-native-responsive-screen, adding custom hooks and enhanced functionalities for precise breakpoint detection and scalable component design.

Experience streamlined development and consistent UI across devices. Learn more in [this detailed Medium article](https://medium.com/@mz-real/creating-responsive-uis-in-react-native-made-easy-with-react-native-responsive-hook-35fa5649cd5f)! 🚀

Written in TypeScript, shipped as both ESM and CommonJS, with generated type definitions.

**Requires** React 16.8+ and React Native 0.61+ (the hook depends on `useWindowDimensions`).

## Installation

```bash
npm install react-native-responsive-hook --save
```

## Usage

```tsx
import { StyleSheet, View, Text } from 'react-native';
import { useResponsive } from 'react-native-responsive-hook';

const App = () => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>Adjusts to orientation, screen size, and platform.</Text>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { isPortrait, wp, hp, fontSize, select, isIOS } = useResponsive();

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: select({ xs: 12, md: 24, xl: 48 }),
    },
    box: {
      width: isPortrait ? wp(85) : wp(50),
      height: hp(17),
      borderWidth: 2,
      borderColor: 'orange',
      backgroundColor: select({
        xs: 'lightgreen',
        sm: 'lightpink',
        md: 'lightyellow',
        lg: 'lightcoral',
        xl: 'lightskyblue',
        xxl: 'lightsteelblue',
      }),
    },
    text: {
      fontSize: fontSize(16),
      fontFamily: isIOS ? 'Helvetica' : 'Roboto',
    },
  });
};

export default App;
```

Everything the hook returns is memoized against width, height, and font scale, so you can pass these functions to `useMemo` dependencies or `React.memo` children without causing extra renders.

## API

### Breakpoints

`breakpoint` reports the current named breakpoint:

| Name  | Width (dp)  |
|-------|-------------|
| `xs`  | 0 – 399     |
| `sm`  | 400 – 599   |
| `md`  | 600 – 767   |
| `lg`  | 768 – 1007  |
| `xl`  | 1008 – 1279 |
| `xxl` | 1280 +      |

Each breakpoint starts at its minimum width, so fractional widths (common on Android, e.g. `399.5`) fall into the lower breakpoint. The thresholds can be changed with [`ResponsiveProvider`](#responsiveprovider).

### `select(map)`

Picks a value for the current breakpoint, cascading **downward** — mobile-first. Falls back to a `default` key, then `undefined`:

```ts
select({ sm: 12, lg: 20 })
// xs  -> undefined
// sm  -> 12
// md  -> 12   (cascades down from sm)
// lg  -> 20
// xxl -> 20   (cascades down from lg)

select({ sm: 12, default: 8 })
// xs  -> 8
```

Presence is checked against `undefined`, not truthiness, so `select({ sm: 0 })` correctly returns `0`.

### Dimensions

- `wp(percent)` — width as a percentage of the screen, in dp
- `hp(percent)` — height as a percentage of the screen, in dp
- `vw(percent)` / `vh(percent)` — viewport-relative units, floored

All four accept `50` or `'50%'`.

### Fonts

- `fontSize(size)` — scales with the device's shorter edge **and** respects the user's OS text-size setting via `PixelRatio.getFontScale()`. Device scaling is clamped to 0.85×–1.3× so tablets don't get oversized body text, and the accessibility scale is capped at 2×.
- `ms(size, factor = 0.5)` — moderate scale: moves `factor` of the way from `size` towards full linear scaling with the shorter edge. `ms(16)` is 16 on the 375dp baseline and ~24.5 on a 768dp tablet. Same formula as `moderateScale` from react-native-size-matters, but against a 375dp baseline (size-matters uses 350) and rounded to the nearest pixel, so values differ slightly; set `baseDevice: { width: 350, height: 680 }` on [`ResponsiveProvider`](#responsiveprovider) to match its baseline more closely.
- `rem(size)` — scales linearly against a 375dp baseline, with no accessibility scaling.

### Platform & orientation

`isIOS`, `isAndroid`, `isLandscape`, `isPortrait`.

### `ResponsiveProvider`

Optional. Wrap your app to change the design baseline or the breakpoint thresholds for every `useResponsive()` below it:

```tsx
import { ResponsiveProvider } from 'react-native-responsive-hook';

<ResponsiveProvider
  config={{
    baseDevice: { width: 390, height: 844 }, // what fontSize, rem and ms scale against
    breakpoints: { md: 640, lg: 1024 },      // minimum widths; omitted keys keep their defaults
  }}
>
  <App />
</ResponsiveProvider>
```

- Without a provider, the defaults above apply, exactly as before.
- Thresholds must be positive and strictly ascending (`sm < md < lg < xl < xxl`), otherwise the provider throws an error naming the offending keys.
- Passing an inline object is fine — the hook's memoized values stay stable across re-renders as long as the numbers don't change.
- A nested provider resolves its config against the defaults, not against its parent.
- The deprecated module-level exports (`widthPercentageToDP`, the `breakpointGroup` constant, …) have no access to React context and ignore the provider.

## Migrating from 1.0.x

**1.1.0 is backwards compatible.** Nothing is removed, and no existing function changed its output. The items below are deprecated and still work.

| Deprecated | Use instead | Notes |
|---|---|---|
| `rf(size)` | `fontSize(size)` | `rf` never scaled with the screen — it is a flat clamp at 32. Its behavior is unchanged, so upgrading will not shift your existing font sizes. |
| `breakpointGroup` | `breakpoint` | `group1`…`group6` map to `xs`…`xxl` in order. |
| `widthPercentageToDP` / `heightPercentageToDP` | `wp` / `hp` from the hook | |
| `viewportWidthPercentage` / `viewportHeightPercentage` | `vw` / `vh` from the hook | |
| `remUnit` / `responsiveFont` | `rem` / `fontSize` from the hook | |
| `listenOrientationChange` / `removeOrientationListener` | `useResponsive()` | The hook tracks dimensions automatically. |
| Module-level `isLandscape` / `isPortrait` / `breakpointGroup` | the hook's equivalents | The module-level constants are captured once at import and **never update on rotation**. |

### Fixed in 1.2.0

- **Fractional widths resolve correctly.** A width between two whole-number ranges (e.g. `399.5`dp, which Android can report) used to fall through to `xxl`; it now resolves to the lower breakpoint (`xs`).

### Fixed in 1.0.5 / 1.1.0

- **The package no longer crashes on import.** 1.0.4 read `isLandscape` before it was declared, which threw `ReferenceError: Cannot access 'isLandscape' before initialization` under Hermes.
- **`removeOrientationListener` works.** It called `Dimensions.removeEventListener`, removed in React Native 0.72, and even before that passed a throwaway function that removed nothing.
- **`breakpointGroup` no longer returns `undefined`** above 8192dp.
- **The published package shrank** from 802 kB to ~78 kB by no longer shipping three example apps.

## Want to Contribute?

Your contributions are welcome! Feel free to submit pull requests or contact me directly to discuss how you can get involved.

```bash
npm install
npm test
npm run typecheck
npm run build
```

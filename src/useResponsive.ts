import { useMemo } from 'react';
import { PixelRatio, Platform, useWindowDimensions } from 'react-native';

import { baseFontSize, maxFontScaleFactor } from './constants.js';
import { toNumber } from './toNumber.js';
import { useResponsiveConfig } from './config.js';
import {
  createSelect,
  resolveBreakpoint,
  LEGACY_GROUP_BY_BREAKPOINT,
  type Breakpoint,
  type Select,
} from './breakpoints.js';

/** Accepts either `50` or `'50%'`. */
export type Percent = number | string;

/** Bounds on how far `fontSize` scales with the device, so a tablet does not
 *  receive double-size body text. */
const MIN_FONT_RATIO = 0.85;
const MAX_FONT_RATIO = 1.3;

/** Android's `sw600dp` resource qualifier: the conventional tablet cut-off. */
const TABLET_MIN_SHORT_EDGE = 600;

export type UseResponsiveReturn = {
  isLandscape: boolean;
  isPortrait: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  /**
   * The shorter edge of the window is at least 600dp -- Android's `sw600dp`
   * tablet qualifier. Orientation independent; follows the window, so it can
   * change in split-screen / multi-window and applies to large web windows.
   */
  isTablet: boolean;
  /** Named breakpoint for the current width. */
  breakpoint: Breakpoint;
  /** Mobile-first value picker keyed on the current breakpoint. */
  select: Select;
  wp: (widthPercent: Percent) => number;
  hp: (heightPercent: Percent) => number;
  vw: (widthPercent: Percent) => number;
  vh: (heightPercent: Percent) => number;
  rem: (size?: Percent) => number;
  /** Screen- and accessibility-aware font scaling. */
  fontSize: (size: Percent) => number;
  /**
   * Moderate scale: scales with the device's shorter edge, but only by
   * `factor` (default 0.5) of the full linear amount. Same formula as
   * `moderateScale` in react-native-size-matters, but against this
   * library's base device and rounded to the nearest pixel.
   */
  ms: (size: Percent, factor?: number) => number;
  /** Linear scale by the shorter screen edge (size-matters `scale`). */
  s: (size: Percent) => number;
  /** Linear scale by the longer screen edge (size-matters `verticalScale`). */
  vs: (size: Percent) => number;
  /**
   * Moderate vertical scale: moves `factor` (default 0.5) of the way from
   * `size` to `vs(size)` (size-matters `moderateVerticalScale`).
   */
  mvs: (size: Percent, factor?: number) => number;
  /**
   * @deprecated Never scaled with the screen — it is a flat clamp at
   * `baseFontSize * maxFontScaleFactor`. Use `fontSize` instead.
   */
  rf: (size?: Percent) => number;
  /**
   * @deprecated Returns `group1`..`group6`. Use `breakpoint` instead.
   */
  breakpointGroup: string;
};

/**
 * Responsive helpers derived from the current window dimensions.
 *
 * The returned object and every function on it are memoized against width,
 * height and font scale, so consumers can safely use them as dependencies of
 * their own `useMemo`/`StyleSheet.create` calls without recomputing each
 * render.
 */
export function useResponsive(): UseResponsiveReturn {
  const windowDimensions = useWindowDimensions();
  const { baseDevice, breakpoints, initialWindow } = useResponsiveConfig();
  // While the window is unmeasured (0x0: server rendering on the web, rare
  // native first renders), fall back to the provider's initialWindow.
  const unmeasured = windowDimensions.width === 0 && windowDimensions.height === 0;
  const { width, height, fontScale } =
    unmeasured && initialWindow ? initialWindow : windowDimensions;

  return useMemo<UseResponsiveReturn>(() => {
    const isLandscape = width > height;
    const isPortrait = width < height;

    // The shorter edge, in both orientations.
    const base = Math.min(width, height);

    const breakpoint = resolveBreakpoint(width, breakpoints);

    const rem = (size: Percent = 0): number => {
      const multiplier = Math.max(height, width) < baseDevice.height ? 0.9 : 1;
      return Math.floor((base / baseDevice.width) * toNumber(size) * multiplier);
    };

    const fontSize = (size: Percent): number => {
      // Clamped so a wide tablet does not receive double-size body text.
      const ratio = Math.min(
        Math.max(base / baseDevice.width, MIN_FONT_RATIO),
        MAX_FONT_RATIO
      );
      // Honours the OS text-size setting, capped so extreme accessibility
      // scales cannot break layouts outright.
      // Older react-native-web and some test mocks omit fontScale; treat a
      // missing or invalid value as the default 1 rather than yielding NaN.
      const osScale = Number.isFinite(fontScale) && fontScale > 0 ? fontScale : 1;
      const accessibilityScale = Math.min(osScale, maxFontScaleFactor);
      return PixelRatio.roundToNearestPixel(
        toNumber(size) * ratio * accessibilityScale
      );
    };

    const ms = (size: Percent, factor = 0.5): number => {
      const n = toNumber(size);
      const linear = (n * base) / baseDevice.width;
      return PixelRatio.roundToNearestPixel(n + (linear - n) * factor);
    };

    // The longer edge, in both orientations.
    const longEdge = Math.max(width, height);

    const s = (size: Percent): number =>
      PixelRatio.roundToNearestPixel((toNumber(size) * base) / baseDevice.width);

    const verticalScale = (n: number): number => (n * longEdge) / baseDevice.height;

    const vs = (size: Percent): number =>
      PixelRatio.roundToNearestPixel(verticalScale(toNumber(size)));

    const mvs = (size: Percent, factor = 0.5): number => {
      const n = toNumber(size);
      return PixelRatio.roundToNearestPixel(n + (verticalScale(n) - n) * factor);
    };

    return {
      isLandscape,
      isPortrait,
      isIOS: Platform.OS === 'ios',
      isAndroid: Platform.OS === 'android',
      isTablet: base >= TABLET_MIN_SHORT_EDGE,

      breakpoint,
      select: createSelect(breakpoint),

      wp: (widthPercent) =>
        PixelRatio.roundToNearestPixel((width * toNumber(widthPercent)) / 100),
      hp: (heightPercent) =>
        PixelRatio.roundToNearestPixel((height * toNumber(heightPercent)) / 100),
      vw: (widthPercent) => Math.floor((width / 100) * toNumber(widthPercent)),
      vh: (heightPercent) => Math.floor((height / 100) * toNumber(heightPercent)),

      rem,
      fontSize,
      ms,
      s,
      vs,
      mvs,

      // Deprecated, behavior preserved exactly.
      rf: (size: Percent = 0) =>
        Math.min(baseFontSize * maxFontScaleFactor, toNumber(size)),
      breakpointGroup: LEGACY_GROUP_BY_BREAKPOINT[breakpoint],
    };
  }, [width, height, fontScale, baseDevice, breakpoints]);
}

export default useResponsive;

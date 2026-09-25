import { useMemo } from 'react';
import { PixelRatio, Platform, useWindowDimensions } from 'react-native';

import { baseFontSize, maxFontScaleFactor } from './constants';
import { useResponsiveConfig } from './config';
import {
  createSelect,
  resolveBreakpoint,
  LEGACY_GROUP_BY_BREAKPOINT,
  type Breakpoint,
  type BreakpointMap,
} from './breakpoints';

/** Accepts either `50` or `'50%'`. */
export type Percent = number | string;

const toNumber = (value: Percent): number =>
  typeof value === 'number' ? value : parseFloat(value);

/** Bounds on how far `fontSize` scales with the device, so a tablet does not
 *  receive double-size body text. */
const MIN_FONT_RATIO = 0.85;
const MAX_FONT_RATIO = 1.3;

export type UseResponsiveReturn = {
  isLandscape: boolean;
  isPortrait: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  /** Named breakpoint for the current width. */
  breakpoint: Breakpoint;
  /** Mobile-first value picker keyed on the current breakpoint. */
  select: <T>(map: BreakpointMap<T>) => T | undefined;
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
  const { width, height, fontScale } = useWindowDimensions();
  const { baseDevice, breakpoints } = useResponsiveConfig();

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
      const accessibilityScale = Math.min(fontScale, maxFontScaleFactor);
      return PixelRatio.roundToNearestPixel(
        toNumber(size) * ratio * accessibilityScale
      );
    };

    const ms = (size: Percent, factor = 0.5): number => {
      const n = toNumber(size);
      const linear = (n * base) / baseDevice.width;
      return PixelRatio.roundToNearestPixel(n + (linear - n) * factor);
    };

    return {
      isLandscape,
      isPortrait,
      isIOS: Platform.OS === 'ios',
      isAndroid: Platform.OS === 'android',

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

      // Deprecated, behavior preserved exactly.
      rf: (size: Percent = 0) =>
        Math.min(baseFontSize * maxFontScaleFactor, toNumber(size)),
      breakpointGroup: LEGACY_GROUP_BY_BREAKPOINT[breakpoint],
    };
  }, [width, height, fontScale, baseDevice, breakpoints]);
}

export default useResponsive;

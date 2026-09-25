import { Dimensions, PixelRatio, Platform, type ScaledSize } from 'react-native';

import { baseDevice, baseFontSize, maxFontScaleFactor } from './constants';
import { resolveBreakpoint, LEGACY_GROUP_BY_BREAKPOINT } from './breakpoints';
import { useResponsive } from './useResponsive';

export { useResponsive };
export default useResponsive;

export { ResponsiveProvider } from './config';
export type { ResponsiveConfig, BaseDevice } from './config';
export type { BreakpointThresholds } from './breakpoints';

export type { Breakpoint, BreakpointMap, Select } from './breakpoints';
export type { UseResponsiveReturn, Percent } from './useResponsive';

/* ------------------------------------------------------------------ *
 * Legacy API
 *
 * Everything below is inherited from react-native-responsive-screen and
 * is deprecated. It is retained so existing code keeps working.
 *
 * Note that the module-level constants are captured once at import and
 * never update on rotation. That is inherent to their shape, not a bug
 * that can be fixed without changing them into hooks -- which is why
 * they are deprecated rather than repaired.
 * ------------------------------------------------------------------ */

let screenWidth = Dimensions.get('window').width;
let screenHeight = Dimensions.get('window').height;

/** @deprecated Read `isIOS` from `useResponsive()`. */
export const isIOS = Platform.OS === 'ios';

/** @deprecated Read `isAndroid` from `useResponsive()`. */
export const isAndroid = Platform.OS === 'android';

/** @deprecated Snapshot at import; does not update on rotation. Read
 *  `isLandscape` from `useResponsive()`. */
export const isLandscape = screenWidth > screenHeight;

/** @deprecated Snapshot at import; does not update on rotation. Read
 *  `isPortrait` from `useResponsive()`. */
export const isPortrait = screenWidth < screenHeight;

/** The shorter screen edge, used as the font-scaling baseline. */
let base = Math.min(screenWidth, screenHeight);

/** @deprecated Snapshot at import. Read `breakpointGroup` -- or better,
 *  `breakpoint` -- from `useResponsive()`. */
export const breakpointGroup =
  LEGACY_GROUP_BY_BREAKPOINT[resolveBreakpoint(screenWidth)];

const toNumber = (value: number | string): number =>
  typeof value === 'number' ? value : parseFloat(value);

/** @deprecated Use `wp` from `useResponsive()`. */
export const widthPercentageToDP = (widthPercent: number | string): number =>
  PixelRatio.roundToNearestPixel((screenWidth * toNumber(widthPercent)) / 100);

/** @deprecated Use `hp` from `useResponsive()`. */
export const heightPercentageToDP = (heightPercent: number | string): number =>
  PixelRatio.roundToNearestPixel((screenHeight * toNumber(heightPercent)) / 100);

/** @deprecated Use `vw` from `useResponsive()`. */
export const viewportWidthPercentage = (widthPercent: number | string): number =>
  Math.floor((screenWidth / 100) * toNumber(widthPercent));

/** @deprecated Use `vh` from `useResponsive()`. */
export const viewportHeightPercentage = (heightPercent: number | string): number =>
  Math.floor((screenHeight / 100) * toNumber(heightPercent));

/** @deprecated Use `rem` from `useResponsive()`. */
export const remUnit = (size: number | string = 0): number => {
  const multiplier =
    Math.max(screenHeight, screenWidth) < baseDevice.height ? 0.9 : 1;
  return Math.floor((base / baseDevice.width) * toNumber(size) * multiplier);
};

/**
 * @deprecated Never scaled with the screen -- it is a flat clamp at
 * `baseFontSize * maxFontScaleFactor`, despite the name. Use `fontSize`
 * from `useResponsive()` for genuine responsive font scaling.
 */
export const responsiveFont = (size: number | string = 0): number =>
  Math.min(baseFontSize * maxFontScaleFactor, toNumber(size));

let orientationSubscription: { remove: () => void } | null = null;
let orientationHandler: ((dimensions: { window: ScaledSize }) => void) | null = null;

/**
 * @deprecated Class-component helper. Use `useResponsive()`, which tracks
 * dimensions automatically.
 */
export const listenOrientationChange = (that: {
  setState: (state: { orientation: 'portrait' | 'landscape' }) => void;
}): void => {
  // A second call would otherwise orphan the first subscription.
  removeOrientationListener();

  orientationHandler = (newDimensions) => {
    screenWidth = newDimensions.window.width;
    screenHeight = newDimensions.window.height;
    base = Math.min(screenWidth, screenHeight);

    that.setState({
      orientation: screenWidth < screenHeight ? 'portrait' : 'landscape',
    });
  };

  orientationSubscription = Dimensions.addEventListener(
    'change',
    orientationHandler
  );
};

/**
 * @deprecated Pairs with `listenOrientationChange`. Use `useResponsive()`.
 */
export function removeOrientationListener(): void {
  // React Native >= 0.65 returns a subscription; >= 0.72 dropped
  // Dimensions.removeEventListener entirely.
  if (orientationSubscription && typeof orientationSubscription.remove === 'function') {
    orientationSubscription.remove();
  } else if (
    orientationHandler &&
    typeof (Dimensions as any).removeEventListener === 'function'
  ) {
    (Dimensions as any).removeEventListener('change', orientationHandler);
  }

  orientationSubscription = null;
  orientationHandler = null;
}

/** The design baseline this library scales against (iPhone X logical size). */
export const baseDevice = {
  width: 375,
  height: 812,
} as const;

export const baseFontSize = 16;

/** Upper bound applied to the OS text-size setting, so huge accessibility
 *  scales cannot break layouts outright. */
export const maxFontScaleFactor = 2;

/**
 * Legacy breakpoint table, retained so `breakpointGroup` keeps returning the
 * same `group1`..`group6` strings it always has.
 *
 * @deprecated Use the named breakpoints from `./breakpoints` instead.
 */
export const breakpoints: Record<string, [number, number]> = {
  group1: [0, 399],
  group2: [400, 599],
  group3: [600, 767],
  group4: [768, 1007],
  group5: [1008, 1279],
  group6: [1280, 8192],
};

export const BREAKPOINT_ORDER = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

export type Breakpoint = (typeof BREAKPOINT_ORDER)[number];

/** Minimum width in dp at which each breakpoint begins. `xs` starts at 0. */
export type BreakpointThresholds = Record<Exclude<Breakpoint, 'xs'>, number>;

export const DEFAULT_THRESHOLDS: BreakpointThresholds = {
  sm: 400,
  md: 600,
  lg: 768,
  xl: 1008,
  xxl: 1280,
};

export const LEGACY_GROUP_BY_BREAKPOINT: Record<Breakpoint, string> = {
  xs: 'group1',
  sm: 'group2',
  md: 'group3',
  lg: 'group4',
  xl: 'group5',
  xxl: 'group6',
};

export type BreakpointMap<T> = Partial<Record<Breakpoint, T>> & { default?: T };

/** Mobile-first value picker. With a `default` key a value is always found,
 *  so the result is `T`; without one it may be `undefined`. For mixed value
 *  types pass the union explicitly: `select<number | 'auto'>({ ... })`. */
export type Select = {
  <T>(map: Partial<Record<Breakpoint, T>> & { default: T }): T;
  <T>(map: BreakpointMap<T>): T | undefined;
};

/**
 * Resolves a width in dp to its named breakpoint: the largest breakpoint
 * whose threshold the width reaches.
 *
 * Thresholds rather than closed ranges, so fractional widths (common on
 * Android) land in the lower breakpoint instead of falling between ranges.
 * Negative widths resolve to `xs`, so a transient `0`/`-1` during a layout
 * pass cannot produce a missing value downstream.
 */
export function resolveBreakpoint(
  width: number,
  thresholds: BreakpointThresholds = DEFAULT_THRESHOLDS
): Breakpoint {
  for (let i = BREAKPOINT_ORDER.length - 1; i > 0; i -= 1) {
    const name = BREAKPOINT_ORDER[i] as Exclude<Breakpoint, 'xs'>;
    if (width >= thresholds[name]) {
      return name;
    }
  }
  return 'xs';
}

/**
 * Builds a mobile-first `select` bound to the current breakpoint.
 *
 * Resolution walks from the current breakpoint downward through
 * `BREAKPOINT_ORDER` and returns the first value present, then falls back to
 * `default`, then to `undefined`:
 *
 *     select({ sm: 12, lg: 20 })
 *     // xs  -> undefined
 *     // md  -> 12   (cascades down from sm)
 *     // xxl -> 20   (cascades down from lg)
 *
 * Presence is tested against `undefined`, not truthiness, so `0` and `''`
 * are returned rather than skipped.
 */
export function createSelect(current: Breakpoint): Select {
  const currentIndex = BREAKPOINT_ORDER.indexOf(current);

  return function select<T>(map: BreakpointMap<T>): T | undefined {
    for (let i = currentIndex; i >= 0; i -= 1) {
      const value = map[BREAKPOINT_ORDER[i]];
      if (value !== undefined) {
        return value;
      }
    }
    return map.default;
  };
}

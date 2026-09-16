export const BREAKPOINT_ORDER = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

export type Breakpoint = (typeof BREAKPOINT_ORDER)[number];

export const BREAKPOINT_RANGES: Record<Breakpoint, [number, number]> = {
  xs: [0, 399],
  sm: [400, 599],
  md: [600, 767],
  lg: [768, 1007],
  xl: [1008, 1279],
  xxl: [1280, Infinity],
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

/**
 * Resolves a width in dp to its named breakpoint.
 *
 * Negative widths clamp to the smallest breakpoint rather than returning
 * undefined, so a transient `0`/`-1` during a layout pass cannot produce a
 * missing value downstream.
 */
export function resolveBreakpoint(width: number): Breakpoint {
  for (const name of BREAKPOINT_ORDER) {
    const [min, max] = BREAKPOINT_RANGES[name];
    if (width >= min && width <= max) {
      return name;
    }
  }
  return width < 0 ? 'xs' : 'xxl';
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
export function createSelect(current: Breakpoint) {
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

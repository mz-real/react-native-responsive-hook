import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';

import { baseDevice as defaultBaseDevice } from './constants.js';
import {
  BREAKPOINT_ORDER,
  DEFAULT_THRESHOLDS,
  type Breakpoint,
  type BreakpointThresholds,
} from './breakpoints.js';

export type BaseDevice = { width: number; height: number };

/** A window size to assume while the real one is unknown (0x0). */
export type InitialWindow = { width: number; height: number; fontScale?: number };

export type ResponsiveConfig = {
  /** Design baseline that `fontSize`, `rem`, `s`, `vs`, `ms` and `mvs` scale against. */
  baseDevice?: BaseDevice;
  /** Minimum width in dp for each breakpoint. Omitted keys keep their defaults. */
  breakpoints?: Partial<BreakpointThresholds>;
  /**
   * Window size used while React Native reports a 0x0 window -- during
   * server-side rendering on the web, and on some first renders. Ignored as
   * soon as the real window has a size.
   */
  initialWindow?: InitialWindow;
};

export type ResolvedResponsiveConfig = {
  baseDevice: BaseDevice;
  breakpoints: BreakpointThresholds;
  initialWindow?: Required<InitialWindow>;
};

const isPositiveFinite = (n: number) => Number.isFinite(n) && n > 0;

/** Drops keys whose value is `undefined`, so `{ md: undefined }` keeps the
 *  default rather than overwriting it when spread. */
const definedOnly = <T extends object>(obj: T | undefined): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj ?? {}).filter(([, value]) => value !== undefined)
  ) as Partial<T>;

/**
 * Merges a partial config over the defaults and validates it.
 *
 * Throws on invalid input rather than guessing: a mis-ordered threshold table
 * would otherwise resolve breakpoints silently wrong on some devices only.
 */
export function resolveConfig(config: ResponsiveConfig = {}): ResolvedResponsiveConfig {
  const baseDevice = { ...defaultBaseDevice, ...definedOnly(config.baseDevice) };
  if (!isPositiveFinite(baseDevice.width) || !isPositiveFinite(baseDevice.height)) {
    throw new Error(
      `react-native-responsive-hook: baseDevice width and height must be positive numbers, got ${baseDevice.width}×${baseDevice.height}.`
    );
  }

  const breakpoints = { ...DEFAULT_THRESHOLDS, ...definedOnly(config.breakpoints) };
  const names = BREAKPOINT_ORDER.slice(1) as Exclude<Breakpoint, 'xs'>[];
  for (const name of names) {
    if (!isPositiveFinite(breakpoints[name])) {
      throw new Error(
        `react-native-responsive-hook: breakpoint ${name} must be a positive number, got ${breakpoints[name]}.`
      );
    }
  }
  for (let i = 1; i < names.length; i += 1) {
    const prev = names[i - 1];
    const next = names[i];
    if (breakpoints[prev] >= breakpoints[next]) {
      throw new Error(
        `react-native-responsive-hook: breakpoints must be strictly ascending, but ${prev} (${breakpoints[prev]}) is not below ${next} (${breakpoints[next]}).`
      );
    }
  }

  if (config.initialWindow === undefined) {
    return { baseDevice, breakpoints };
  }

  const initialWindow = { fontScale: 1, ...definedOnly(config.initialWindow) } as Required<InitialWindow>;
  if (
    !isPositiveFinite(initialWindow.width) ||
    !isPositiveFinite(initialWindow.height) ||
    !isPositiveFinite(initialWindow.fontScale)
  ) {
    throw new Error(
      `react-native-responsive-hook: initialWindow width, height and fontScale must be positive numbers, got ${initialWindow.width}×${initialWindow.height} @ ${initialWindow.fontScale}.`
    );
  }
  return { baseDevice, breakpoints, initialWindow };
}

const ResponsiveContext = createContext<ResolvedResponsiveConfig>(resolveConfig());

/**
 * Overrides the base device and/or breakpoint thresholds for every
 * `useResponsive()` below it. Nested providers resolve against the defaults,
 * not their parent. The deprecated module-level exports are unaffected.
 */
export function ResponsiveProvider({
  config,
  children,
}: {
  config?: ResponsiveConfig;
  children?: ReactNode;
}): ReactElement {
  const { baseDevice, breakpoints, initialWindow } = config ?? {};
  // Keyed on primitives so an inline `config={{ ... }}` does not produce a
  // new context value -- and invalidate every consumer's memo -- each render.
  const value = useMemo(
    () => resolveConfig(config),
    [
      baseDevice?.width,
      baseDevice?.height,
      breakpoints?.sm,
      breakpoints?.md,
      breakpoints?.lg,
      breakpoints?.xl,
      breakpoints?.xxl,
      initialWindow?.width,
      initialWindow?.height,
      initialWindow?.fontScale,
    ]
  );
  return createElement(ResponsiveContext.Provider, { value }, children);
}

export function useResponsiveConfig(): ResolvedResponsiveConfig {
  return useContext(ResponsiveContext);
}

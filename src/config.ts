import { Platform } from 'react-native';
import {
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
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
import { sharedContext } from './windowOverride.js';

export type BaseDevice = { width: number; height: number };

/** A window size to assume while the real one is unknown (0x0). */
export type InitialWindow = { width: number; height: number; fontScale?: number };

export type ResponsiveConfig = {
  /** Design baseline that `fontSize`, `rem`, `s`, `vs`, `ms` and `mvs` scale against. */
  baseDevice?: BaseDevice;
  /** Minimum width in dp for each breakpoint. Omitted keys keep their defaults. */
  breakpoints?: Partial<BreakpointThresholds>;
  /**
   * Window size used while React Native reports an unmeasured 0x0 window --
   * server-side rendering on the web, rare native first renders. Ignored as
   * soon as the real window has a size. Only matches hydration for clients
   * whose window equals it; react-native-web measures on the first client
   * render.
   */
  initialWindow?: InitialWindow;
  /**
   * Render with `initialWindow` until the provider has mounted, then switch
   * to the real window. Makes the server HTML and the client's first render
   * identical (no hydration mismatch) at the cost of one extra render after
   * mount. Requires `initialWindow`.
   */
  ssr?: boolean;
};

export type ResolvedResponsiveConfig = {
  baseDevice: BaseDevice;
  breakpoints: BreakpointThresholds;
  initialWindow?: Required<InitialWindow>;
  ssr?: true;
  /** True only during the pre-mount render(s) of an `ssr` provider. */
  hydrating?: true;
};

declare const __DEV__: boolean | undefined;
declare const process: { env: { NODE_ENV?: string } } | undefined;

/** React Native's `__DEV__` when defined; otherwise `NODE_ENV` (web). */
function isDevelopment(): boolean {
  if (typeof __DEV__ !== 'undefined') {
    return Boolean(__DEV__);
  }
  return typeof process === 'undefined' || process.env.NODE_ENV !== 'production';
}

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
    if (config.ssr) {
      throw new Error(
        'react-native-responsive-hook: ssr: true needs an initialWindow to render with before mount.'
      );
    }
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
  return config.ssr
    ? { baseDevice, breakpoints, initialWindow, ssr: true }
    : { baseDevice, breakpoints, initialWindow };
}

const DEFAULT_CONFIG = resolveConfig();

const ResponsiveContext = sharedContext<ResolvedResponsiveConfig>(
  'react-native-responsive-hook.config',
  DEFAULT_CONFIG
);

/**
 * Set once the first `ssr` provider has mounted on the client. Providers
 * mounted later (screens, modals, client-side navigation) have no server
 * HTML to match, so they render the real window straight away. Never set on
 * the server, where effects do not run.
 */
let hasHydrated = false;

/** Test hook: forget that hydration has happened. */
export function __resetHydrationForTests(): void {
  hasHydrated = false;
}

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
  const { baseDevice, breakpoints, initialWindow, ssr } = config ?? {};
  // Keyed on primitives so an inline `config={{ ... }}` does not produce a
  // new context value -- and invalidate every consumer's memo -- each render.
  const value = useMemo(
    () => {
      try {
        return resolveConfig(config);
      } catch (error) {
        // Surface the mistake in development; never crash a user's app over
        // it in production -- fall back to the defaults instead.
        if (isDevelopment()) {
          throw error;
        }
        // If only the ssr flag is invalid, keep the rest of the config.
        if (config?.ssr) {
          try {
            const withoutSsr = resolveConfig({ ...config, ssr: undefined });
            console.error(`${(error as Error).message} Ignoring ssr.`);
            return withoutSsr;
          } catch {
            // Something else is invalid too; fall through to the defaults.
          }
        }
        console.error(`${(error as Error).message} Using the defaults instead.`);
        return DEFAULT_CONFIG;
      }
    },
    // Deliberately keyed on the primitive values rather than `config`
    // itself, so an inline object literal does not re-resolve every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      ssr,
    ]
  );

  // With `ssr`, keep rendering initialWindow until mounted so the first
  // client render matches the server HTML, then switch to the real window.
  // Only on the web: native apps have no server HTML to match.
  const ssrEnabled = value.ssr === true && Platform.OS === 'web';
  const [mounted, setMounted] = useState(() => hasHydrated);
  useEffect(() => {
    if (ssrEnabled) {
      hasHydrated = true;
      setMounted(true);
    }
  }, [ssrEnabled]);
  const hydrating = ssrEnabled && !mounted;
  const contextValue = useMemo(
    () => (hydrating ? { ...value, hydrating: true as const } : value),
    [value, hydrating]
  );

  return createElement(ResponsiveContext.Provider, { value: contextValue }, children);
}

export function useResponsiveConfig(): ResolvedResponsiveConfig {
  return useContext(ResponsiveContext);
}

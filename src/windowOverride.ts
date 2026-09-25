import { createContext, type Context } from 'react';

/** A window size that replaces `useWindowDimensions()` for a subtree. */
export type WindowOverride = { width: number; height: number; fontScale: number };

/**
 * Set only by `MockWindowProvider` (`react-native-responsive-hook/testing`);
 * `null` everywhere else, so apps never see a difference.
 */
export const WindowOverrideContext = sharedContext<WindowOverride | null>(
  'react-native-responsive-hook.windowOverride',
  null
);

/**
 * One context per name for the whole JS realm. The package ships ESM and
 * CommonJS builds; if an app loads both (e.g. a CJS dependency requires the
 * root while a story imports `/testing`), each would otherwise create its own
 * context and providers from one build would be invisible to the other.
 */
export function sharedContext<T>(name: string, defaultValue: T) {
  const registry = globalThis as unknown as Record<symbol, Context<T> | undefined>;
  const key = Symbol.for(name);
  // Plain assignment rather than `??=`, which older React Native Babel
  // presets and bundlers do not parse.
  let context = registry[key];
  if (context === undefined) {
    context = createContext<T>(defaultValue);
    registry[key] = context;
  }
  return context;
}

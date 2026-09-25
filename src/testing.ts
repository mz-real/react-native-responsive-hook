import { createElement, useMemo, type ReactElement, type ReactNode } from 'react';

import { WindowOverrideContext } from './windowOverride.js';

export type MockWindowProviderProps = {
  width: number;
  height: number;
  /** OS text scale to report. Defaults to 1. */
  fontScale?: number;
  children?: ReactNode;
};

const isPositiveFinite = (n: number) => Number.isFinite(n) && n > 0;

/**
 * Makes every `useResponsive()` / `createResponsiveStyles` hook below it see
 * the given window size instead of the device's. For tests, Storybook and
 * previews -- e.g. rendering a screen at tablet size:
 *
 *     import { MockWindowProvider } from 'react-native-responsive-hook/testing';
 *
 *     render(
 *       <MockWindowProvider width={1024} height={768}>
 *         <Dashboard />
 *       </MockWindowProvider>
 *     );
 *
 * Works whether or not `useWindowDimensions` can be mocked in your setup.
 * Composes with `ResponsiveProvider`, which still supplies the config.
 */
export function MockWindowProvider({
  width,
  height,
  fontScale = 1,
  children,
}: MockWindowProviderProps): ReactElement {
  if (!isPositiveFinite(width) || !isPositiveFinite(height) || !isPositiveFinite(fontScale)) {
    throw new Error(
      `react-native-responsive-hook: MockWindowProvider needs positive width, height and fontScale, got ${width}×${height} @ ${fontScale}.`
    );
  }
  const value = useMemo(() => ({ width, height, fontScale }), [width, height, fontScale]);
  return createElement(WindowOverrideContext.Provider, { value }, children);
}

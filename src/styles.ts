import { useMemo } from 'react';
import {
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useResponsive, type UseResponsiveReturn } from './useResponsive.js';

// Defined locally from the public style types: React Native's strict
// TypeScript API (0.80+) has no `StyleSheet.NamedStyles`.
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Defines styles from the responsive helpers once, outside the component,
 * and returns a hook that yields them. The styles are rebuilt only when the
 * window size, font scale or `ResponsiveProvider` config changes -- so they
 * follow rotation -- and keep the same identity between other renders.
 *
 *     const useStyles = createResponsiveStyles(({ wp, select, fontSize }) => ({
 *       card: { width: wp(90), padding: select({ xs: 8, md: 16, default: 8 }) },
 *       title: { fontSize: fontSize(18) },
 *     }));
 *
 *     function Card() {
 *       const styles = useStyles();
 *       ...
 *     }
 */
export function createResponsiveStyles<T extends NamedStyles<T>>(
  factory: (responsive: UseResponsiveReturn) => T & NamedStyles<T>
): () => T {
  return function useResponsiveStyles(): T {
    const responsive = useResponsive();
    // `responsive` is itself memoized on the inputs that affect layout.
    return useMemo(() => StyleSheet.create(factory(responsive)), [responsive]);
  };
}

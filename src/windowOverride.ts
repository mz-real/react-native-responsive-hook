import { createContext } from 'react';

/** A window size that replaces `useWindowDimensions()` for a subtree. */
export type WindowOverride = { width: number; height: number; fontScale: number };

/**
 * Set only by `MockWindowProvider` (`react-native-responsive-hook/testing`);
 * `null` everywhere else, so apps never see a difference.
 */
export const WindowOverrideContext = createContext<WindowOverride | null>(null);

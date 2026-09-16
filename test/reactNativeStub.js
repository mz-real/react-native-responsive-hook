// Minimal stand-in for the parts of react-native this package touches, so
// tests can run without pulling in the full framework.

const state = {
  width: 375,
  height: 812,
  fontScale: 1,
  platform: 'ios',
  listeners: [],
  // RN >= 0.72 removed Dimensions.removeEventListener entirely.
  includeRemoveEventListener: false,
};

const Dimensions = {
  get: () => ({ width: state.width, height: state.height }),
  addEventListener: (type, handler) => {
    const entry = { type, handler };
    state.listeners.push(entry);
    return {
      remove: () => {
        state.listeners = state.listeners.filter((l) => l !== entry);
      },
    };
  },
};

Object.defineProperty(Dimensions, 'removeEventListener', {
  configurable: true,
  get: () =>
    state.includeRemoveEventListener
      ? (type, handler) => {
          state.listeners = state.listeners.filter(
            (l) => !(l.type === type && l.handler === handler)
          );
        }
      : undefined,
});

module.exports = {
  __state: state,
  Dimensions,
  PixelRatio: {
    roundToNearestPixel: (n) => Math.round(n * 2) / 2,
    getFontScale: () => state.fontScale,
  },
  Platform: {
    get OS() {
      return state.platform;
    },
  },
  useWindowDimensions: () => ({
    width: state.width,
    height: state.height,
    scale: 2,
    fontScale: state.fontScale,
  }),
};

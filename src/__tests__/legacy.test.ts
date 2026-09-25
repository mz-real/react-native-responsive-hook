/**
 * Regression coverage for the deprecated, module-level API.
 *
 * These constants are captured at import, so each test resets modules and
 * sets the stub's dimensions before requiring the entry point.
 */
/**
 * `jest.resetModules()` clears the stub from the registry too, so the copy
 * the entry point receives is a *different* instance from any captured
 * earlier. `rn` is therefore re-acquired inside `loadWith`, after the reset,
 * and every assertion reads it through the live reference.
 */
let rn: any;
let includeRemoveEventListener = false;

const loadWith = (width: number, height: number) => {
  jest.resetModules();
  rn = require('../../test/reactNativeStub.js');
  rn.__state.width = width;
  rn.__state.height = height;
  rn.__state.fontScale = 1;
  rn.__state.listeners = [];
  rn.__state.platform = 'ios';
  rn.__state.includeRemoveEventListener = includeRemoveEventListener;
  return require('../index');
};

beforeEach(() => {
  includeRemoveEventListener = false;
});

describe('package entry point', () => {
  it('can be imported without throwing', () => {
    // 1.0.4 threw `Cannot access 'isLandscape' before initialization` here.
    expect(() => loadWith(375, 812)).not.toThrow();
  });

  it('exports useResponsive as a function', () => {
    expect(typeof loadWith(375, 812).useResponsive).toBe('function');
  });
});

describe('deprecated dimension helpers', () => {
  it('converts percentages against the import-time screen size', () => {
    const pkg = loadWith(375, 812);
    expect(pkg.widthPercentageToDP(50)).toBe(187.5);
    expect(pkg.heightPercentageToDP(50)).toBe(406);
    expect(pkg.viewportWidthPercentage(33)).toBe(123);
    expect(pkg.viewportHeightPercentage(33)).toBe(267);
  });

  it('scales remUnit from the shorter edge in landscape', () => {
    expect(loadWith(812, 375).remUnit(16)).toBe(16);
  });

  it('accepts percentage strings and defaults size arguments to 0', () => {
    const pkg = loadWith(375, 812);
    expect(pkg.widthPercentageToDP('50%')).toBe(187.5);
    expect(pkg.heightPercentageToDP('50%')).toBe(406);
    expect(pkg.viewportWidthPercentage('33%')).toBe(123);
    expect(pkg.viewportHeightPercentage('33%')).toBe(267);
    expect(pkg.remUnit()).toBe(0);
    expect(pkg.responsiveFont()).toBe(0);
  });

  it('applies the 0.9 remUnit multiplier on short screens', () => {
    expect(loadWith(320, 568).remUnit(16)).toBe(12);
  });

  it('keeps responsiveFont as a flat clamp', () => {
    const pkg = loadWith(375, 812);
    expect(pkg.responsiveFont(64)).toBe(32);
    expect(pkg.responsiveFont(10)).toBe(10);
  });
});

describe('deprecated orientation flags', () => {
  it('reports portrait and landscape from the import-time size', () => {
    const portrait = loadWith(375, 812);
    expect(portrait.isPortrait).toBe(true);
    expect(portrait.isLandscape).toBe(false);

    const landscape = loadWith(812, 375);
    expect(landscape.isLandscape).toBe(true);
  });
});

describe('breakpointGroup', () => {
  it('returns the historical group names', () => {
    expect(loadWith(375, 812).breakpointGroup).toBe('group1');
    expect(loadWith(768, 1024).breakpointGroup).toBe('group4');
  });

  it('returns group6 beyond the old 8192 ceiling instead of undefined', () => {
    expect(loadWith(9000, 1200).breakpointGroup).toBe('group6');
  });
});

describe('orientation listener lifecycle', () => {
  it('does not throw on React Native >= 0.72 where removeEventListener is gone', () => {
    const pkg = loadWith(375, 812);
    pkg.listenOrientationChange({ setState: () => {} });
    expect(() => pkg.removeOrientationListener()).not.toThrow();
  });

  it('actually removes the registered listener', () => {
    const pkg = loadWith(375, 812);
    pkg.listenOrientationChange({ setState: () => {} });
    expect(rn.__state.listeners).toHaveLength(1);

    pkg.removeOrientationListener();
    expect(rn.__state.listeners).toHaveLength(0);
  });

  it('falls back to removeEventListener on React Native < 0.65', () => {
    includeRemoveEventListener = true;
    const pkg = loadWith(375, 812);
    pkg.listenOrientationChange({ setState: () => {} });

    // Simulate the pre-0.65 API, which returned nothing from addEventListener.
    expect(() => pkg.removeOrientationListener()).not.toThrow();
    expect(rn.__state.listeners).toHaveLength(0);
  });

  it('replaces rather than leaks a listener when called twice', () => {
    const pkg = loadWith(375, 812);
    pkg.listenOrientationChange({ setState: () => {} });
    pkg.listenOrientationChange({ setState: () => {} });
    expect(rn.__state.listeners).toHaveLength(1);

    pkg.removeOrientationListener();
    expect(rn.__state.listeners).toHaveLength(0);
  });

  it('keeps remUnit consistent with the new size after a change', () => {
    const pkg = loadWith(375, 812);
    pkg.listenOrientationChange({ setState: () => {} });
    rn.__state.listeners[0].handler({ window: { width: 320, height: 568 } });
    // floor(320 / 375 * 16 * 0.9)
    expect(pkg.remUnit(16)).toBe(12);
  });

  it('updates orientation state when dimensions change', () => {
    const pkg = loadWith(375, 812);
    const states: string[] = [];
    pkg.listenOrientationChange({
      setState: (s: { orientation: string }) => states.push(s.orientation),
    });

    rn.__state.listeners[0].handler({ window: { width: 812, height: 375 } });
    expect(states).toEqual(['landscape']);
  });
});

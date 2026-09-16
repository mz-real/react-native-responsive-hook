// Regression coverage for the defects shipped in 1.0.4.

describe('package entry point', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('can be imported without throwing', () => {
    expect(() => require('../index.js')).not.toThrow();
  });

  it('exports useResponsive as a function', () => {
    const pkg = require('../index.js');
    expect(typeof pkg.useResponsive).toBe('function');
  });
});

describe('remUnit base dimension', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('scales from the shorter screen edge in landscape', () => {
    const rn = require('../test/reactNativeStub.js');
    rn.__state.width = 812;
    rn.__state.height = 375;

    const { remUnit } = require('../index.js');

    // base should be the shorter edge (375), matching baseDevice.width,
    // so a 16pt size comes back as 16 rather than being scaled up by 812/375.
    expect(remUnit(16)).toBe(16);
  });
});

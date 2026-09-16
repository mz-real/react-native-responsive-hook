describe('orientation listener lifecycle', () => {
  let rn;

  beforeEach(() => {
    jest.resetModules();
    rn = require('../test/reactNativeStub.js');
    rn.__state.listeners = [];
    rn.__state.width = 375;
    rn.__state.height = 812;
  });

  it('does not throw on React Native >= 0.72 where removeEventListener is gone', () => {
    rn.__state.includeRemoveEventListener = false;
    const { listenOrientationChange, removeOrientationListener } = require('../index.js');

    listenOrientationChange({ setState: () => {} });

    expect(() => removeOrientationListener()).not.toThrow();
  });

  it('actually removes the registered listener', () => {
    rn.__state.includeRemoveEventListener = false;
    const { listenOrientationChange, removeOrientationListener } = require('../index.js');

    listenOrientationChange({ setState: () => {} });
    expect(rn.__state.listeners).toHaveLength(1);

    removeOrientationListener();
    expect(rn.__state.listeners).toHaveLength(0);
  });
});

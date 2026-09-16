import TestRenderer, { act } from 'react-test-renderer';

import { useResponsive, type UseResponsiveReturn } from '../useResponsive';

const rn = require('../../test/reactNativeStub.js');

/** Minimal hook harness — avoids pulling a full renderer in for a hook that
 *  only reads useWindowDimensions. */
function renderHook() {
  let current: UseResponsiveReturn;
  let renderCount = 0;

  function Probe() {
    renderCount += 1;
    current = useResponsive();
    return null;
  }

  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });

  return {
    get current() {
      return current;
    },
    get renderCount() {
      return renderCount;
    },
    rerender() {
      // Same element type and no key, so React re-renders the existing
      // instance rather than remounting it and resetting hook state.
      act(() => {
        renderer.update(<Probe />);
      });
    },
  };
}

const setScreen = (width: number, height: number, fontScale = 1) => {
  rn.__state.width = width;
  rn.__state.height = height;
  rn.__state.fontScale = fontScale;
};

beforeEach(() => {
  setScreen(375, 812);
  rn.__state.platform = 'ios';
});

describe('dimension helpers', () => {
  it('converts width percentages to dp', () => {
    const { current } = renderHook();
    expect(current.wp(50)).toBe(187.5);
    expect(current.wp('50%')).toBe(187.5);
  });

  it('converts height percentages to dp', () => {
    const { current } = renderHook();
    expect(current.hp(50)).toBe(406);
    expect(current.hp('50%')).toBe(406);
  });

  it('floors viewport units', () => {
    const { current } = renderHook();
    expect(current.vw(33)).toBe(123);
    expect(current.vh(33)).toBe(267);
  });
});

describe('orientation', () => {
  it('reports portrait on a taller-than-wide screen', () => {
    const { current } = renderHook();
    expect(current.isPortrait).toBe(true);
    expect(current.isLandscape).toBe(false);
  });

  it('reports landscape on a wider-than-tall screen', () => {
    setScreen(812, 375);
    const { current } = renderHook();
    expect(current.isLandscape).toBe(true);
    expect(current.isPortrait).toBe(false);
  });
});

describe('breakpoint', () => {
  it('exposes the named breakpoint', () => {
    setScreen(768, 1024);
    const { current } = renderHook();
    expect(current.breakpoint).toBe('lg');
  });

  it('still exposes the legacy group name', () => {
    setScreen(768, 1024);
    const { current } = renderHook();
    expect(current.breakpointGroup).toBe('group4');
  });

  it('provides a select bound to the current breakpoint', () => {
    setScreen(768, 1024);
    const { current } = renderHook();
    expect(current.select({ xs: 4, lg: 16 })).toBe(16);
    expect(current.select({ xs: 4 })).toBe(4);
  });
});

describe('fontSize', () => {
  it('returns the input unchanged on the baseline device', () => {
    const { current } = renderHook();
    expect(current.fontSize(16)).toBe(16);
  });

  it('scales down on a device narrower than the baseline', () => {
    setScreen(320, 568);
    const { current } = renderHook();
    expect(current.fontSize(16)).toBe(13.5);
  });

  it('clamps upward scaling so tablets do not get double-size text', () => {
    setScreen(768, 1024);
    const { current } = renderHook();
    // 768/375 = 2.05, clamped to the 1.3 ceiling: 16 * 1.3 = 20.8
    expect(current.fontSize(16)).toBe(21);
  });

  it('multiplies by the OS font scale', () => {
    setScreen(375, 812, 1.5);
    const { current } = renderHook();
    expect(current.fontSize(16)).toBe(24);
  });

  it('caps the OS font scale at maxFontScaleFactor', () => {
    setScreen(375, 812, 5);
    const { current } = renderHook();
    expect(current.fontSize(16)).toBe(32);
  });

  it('uses the shorter edge, so orientation does not change font size', () => {
    setScreen(375, 812);
    const portrait = renderHook().current.fontSize(16);
    setScreen(812, 375);
    const landscape = renderHook().current.fontSize(16);
    expect(landscape).toBe(portrait);
  });
});

describe('memoization', () => {
  it('returns a stable object identity across re-renders', () => {
    const hook = renderHook();
    const first = hook.current;
    hook.rerender();
    expect(hook.renderCount).toBeGreaterThan(1);
    expect(hook.current).toBe(first);
  });

  it('returns stable function identities across re-renders', () => {
    const hook = renderHook();
    const firstWp = hook.current.wp;
    hook.rerender();
    expect(hook.current.wp).toBe(firstWp);
  });
});

describe('deprecated helpers', () => {
  it('rem keeps its historical scaling', () => {
    const { current } = renderHook();
    expect(current.rem(16)).toBe(16);
  });

  it('rf keeps its historical flat clamp', () => {
    const { current } = renderHook();
    expect(current.rf(64)).toBe(32);
    expect(current.rf(10)).toBe(10);
  });
});

import TestRenderer, { act } from 'react-test-renderer';

import { ResponsiveProvider, resolveConfig, type ResponsiveConfig } from '../config';
import { useResponsive, type UseResponsiveReturn } from '../useResponsive';

const rn = require('../../test/reactNativeStub.js');

function renderWithConfig(getConfig: () => ResponsiveConfig | undefined) {
  let current: UseResponsiveReturn;
  function Probe() {
    current = useResponsive();
    return null;
  }
  // Calls getConfig on every render, so an inline object is re-created
  // each time, exactly like `config={{ ... }}` in a parent component.
  const tree = () => (
    <ResponsiveProvider config={getConfig()}>
      <Probe />
    </ResponsiveProvider>
  );
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(tree());
  });
  return {
    get current() {
      return current;
    },
    rerender() {
      act(() => {
        renderer.update(tree());
      });
    },
  };
}

beforeEach(() => {
  rn.__state.width = 375;
  rn.__state.height = 812;
  rn.__state.fontScale = 1;
});

describe('ResponsiveProvider', () => {
  it('applies custom breakpoint thresholds', () => {
    rn.__state.width = 550;
    const hook = renderWithConfig(() => ({ breakpoints: { md: 500 } }));
    expect(hook.current.breakpoint).toBe('md');
    expect(hook.current.breakpointGroup).toBe('group3');
  });

  it('applies a custom base device to fontSize and rem', () => {
    rn.__state.width = 320;
    rn.__state.height = 568;
    const hook = renderWithConfig(() => ({ baseDevice: { width: 320, height: 568 } }));
    expect(hook.current.fontSize(16)).toBe(16);
    expect(hook.current.rem(16)).toBe(16);
  });

  it('keeps memoized identity when config is an inline object', () => {
    const hook = renderWithConfig(() => ({ breakpoints: { md: 500 } }));
    const first = hook.current;
    hook.rerender();
    expect(hook.current).toBe(first);
  });

  it('resolves nested providers against the defaults, not the parent', () => {
    rn.__state.width = 550;
    let current: UseResponsiveReturn;
    function Probe() {
      current = useResponsive();
      return null;
    }
    act(() => {
      TestRenderer.create(
        <ResponsiveProvider config={{ breakpoints: { md: 500 } }}>
          <ResponsiveProvider config={{ baseDevice: { width: 320, height: 568 } }}>
            <Probe />
          </ResponsiveProvider>
        </ResponsiveProvider>
      );
    });
    expect(current!.breakpoint).toBe('sm');
  });

  it('uses the defaults when the provider is given no config', () => {
    rn.__state.width = 550;
    const hook = renderWithConfig(() => undefined);
    expect(hook.current.breakpoint).toBe('sm');
  });

  it('behaves exactly as before when no provider is present', () => {
    // Covered in depth by useResponsive.test.tsx; this pins the default.
    expect(resolveConfig()).toEqual({
      baseDevice: { width: 375, height: 812 },
      breakpoints: { sm: 400, md: 600, lg: 768, xl: 1008, xxl: 1280 },
    });
  });
});

describe('initialWindow (SSR / first render)', () => {
  const initialWindow = { width: 1024, height: 768 };

  it('is used while the real window reports 0x0', () => {
    rn.__state.width = 0;
    rn.__state.height = 0;
    const hook = renderWithConfig(() => ({ initialWindow }));
    expect(hook.current.breakpoint).toBe('xl');
    expect(hook.current.wp(50)).toBe(512);
    expect(hook.current.isLandscape).toBe(true);
  });

  it('is ignored once the real window has a size', () => {
    rn.__state.width = 375;
    rn.__state.height = 812;
    const hook = renderWithConfig(() => ({ initialWindow }));
    expect(hook.current.breakpoint).toBe('xs');
    expect(hook.current.wp(50)).toBe(187.5);
  });

  it('keeps a known real width when only the height is 0', () => {
    rn.__state.width = 1024;
    rn.__state.height = 0;
    const hook = renderWithConfig(() => ({ initialWindow: { width: 375, height: 812 } }));
    expect(hook.current.wp(50)).toBe(512);
  });

  it('defaults its font scale to 1', () => {
    rn.__state.width = 0;
    rn.__state.height = 0;
    rn.__state.fontScale = 3;
    const hook = renderWithConfig(() => ({ initialWindow: { width: 375, height: 812 } }));
    expect(hook.current.fontSize(16)).toBe(16);
  });

  it('keeps the historical 0x0 behaviour without an initialWindow', () => {
    rn.__state.width = 0;
    rn.__state.height = 0;
    const hook = renderWithConfig(() => undefined);
    expect(hook.current.breakpoint).toBe('xs');
    expect(hook.current.wp(50)).toBe(0);
  });

  it.each([
    [{ width: 0, height: 768 }],
    [{ width: 1024, height: NaN }],
    [{ width: 1024, height: 768, fontScale: -1 }],
  ])('rejects invalid initialWindow %p', (bad) => {
    expect(() => resolveConfig({ initialWindow: bad })).toThrow(/initialWindow/);
  });
});

describe('resolveConfig defaults', () => {
  it('treats explicitly undefined keys as omitted', () => {
    // e.g. `breakpoints: { md: isTablet ? 700 : undefined }`
    expect(
      resolveConfig({
        baseDevice: { width: undefined as unknown as number, height: 700 },
        breakpoints: { md: undefined },
      })
    ).toEqual({
      baseDevice: { width: 375, height: 700 },
      breakpoints: { sm: 400, md: 600, lg: 768, xl: 1008, xxl: 1280 },
    });
  });
});

describe('resolveConfig validation', () => {
  it('rejects thresholds that are not strictly ascending', () => {
    expect(() => resolveConfig({ breakpoints: { md: 900 } })).toThrow(
      /ascending.*md \(900\).*lg \(768\)/
    );
  });

  it.each([NaN, 0, -10, Infinity])('rejects threshold %p', (value) => {
    expect(() => resolveConfig({ breakpoints: { sm: value } })).toThrow(/sm/);
  });

  it.each([
    [{ width: 0, height: 812 }],
    [{ width: 375, height: NaN }],
  ])('rejects base device %p', (baseDevice) => {
    expect(() => resolveConfig({ baseDevice })).toThrow(/baseDevice/);
  });
});

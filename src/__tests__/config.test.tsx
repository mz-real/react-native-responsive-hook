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

  it('behaves exactly as before when no provider is present', () => {
    // Covered in depth by useResponsive.test.tsx; this pins the default.
    expect(resolveConfig()).toEqual({
      baseDevice: { width: 375, height: 812 },
      breakpoints: { sm: 400, md: 600, lg: 768, xl: 1008, xxl: 1280 },
    });
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

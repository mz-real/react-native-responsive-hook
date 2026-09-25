import TestRenderer, { act } from 'react-test-renderer';

import { MockWindowProvider } from '../testing';
import { ResponsiveProvider } from '../config';
import { useResponsive, type UseResponsiveReturn } from '../useResponsive';

const rn = require('../../test/reactNativeStub.js');

function capture(tree: (probe: JSX.Element) => JSX.Element) {
  let current: UseResponsiveReturn | undefined;
  function Probe() {
    current = useResponsive();
    return null;
  }
  act(() => {
    TestRenderer.create(tree(<Probe />));
  });
  return current!;
}

beforeEach(() => {
  rn.__state.width = 375;
  rn.__state.height = 812;
  rn.__state.fontScale = 1;
});

describe('MockWindowProvider', () => {
  it('overrides the window size for everything below it', () => {
    const r = capture((p) => <MockWindowProvider width={1024} height={768}>{p}</MockWindowProvider>);
    expect(r.breakpoint).toBe('xl');
    expect(r.wp(50)).toBe(512);
    expect(r.isLandscape).toBe(true);
    expect(r.isTablet).toBe(true);
  });

  it('defaults fontScale to 1 and accepts an override', () => {
    rn.__state.fontScale = 3;
    expect(
      capture((p) => <MockWindowProvider width={375} height={812}>{p}</MockWindowProvider>).fontSize(16)
    ).toBe(16);
    expect(
      capture((p) => (
        <MockWindowProvider width={375} height={812} fontScale={1.5}>
          {p}
        </MockWindowProvider>
      )).fontSize(16)
    ).toBe(24);
  });

  it('composes with ResponsiveProvider config', () => {
    const r = capture((p) => (
      <ResponsiveProvider config={{ breakpoints: { md: 500 } }}>
        <MockWindowProvider width={550} height={900}>{p}</MockWindowProvider>
      </ResponsiveProvider>
    ));
    expect(r.breakpoint).toBe('md');
  });

  it('has no effect outside the provider', () => {
    expect(capture((p) => p).wp(50)).toBe(187.5);
  });

  it('rejects an invalid size', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      capture((p) => <MockWindowProvider width={0} height={812}>{p}</MockWindowProvider>)
    ).toThrow(/MockWindowProvider/);
    (console.error as jest.Mock).mockRestore();
  });
});

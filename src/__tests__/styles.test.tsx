import TestRenderer, { act } from 'react-test-renderer';

import { createResponsiveStyles } from '../styles';
import { ResponsiveProvider } from '../config';

const rn = require('../../test/reactNativeStub.js');

const useStyles = createResponsiveStyles(({ wp, select, fontSize }) => ({
  container: { width: wp(50), padding: select({ xs: 8, lg: 24, default: 0 }) },
  title: { fontSize: fontSize(16) },
}));

function render(element?: (probe: JSX.Element) => JSX.Element) {
  const seen: ReturnType<typeof useStyles>[] = [];
  function Probe() {
    seen.push(useStyles());
    return null;
  }
  const tree = () => (element ? element(<Probe />) : <Probe />);
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(tree());
  });
  return {
    seen,
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

describe('createResponsiveStyles', () => {
  it('builds styles from the responsive helpers', () => {
    const { seen } = render();
    expect(seen[0]).toEqual({
      container: { width: 187.5, padding: 8 },
      title: { fontSize: 16 },
    });
  });

  it('returns the same styles object across re-renders', () => {
    const hook = render();
    hook.rerender();
    expect(hook.seen).toHaveLength(2);
    expect(hook.seen[1]).toBe(hook.seen[0]);
  });

  it('recomputes when the window changes, e.g. on rotation', () => {
    const hook = render();
    rn.__state.width = 1024;
    rn.__state.height = 768;
    hook.rerender();
    expect(hook.seen[1]).not.toBe(hook.seen[0]);
    expect(hook.seen[1].container).toEqual({ width: 512, padding: 24 });
  });

  it('honours ResponsiveProvider config', () => {
    rn.__state.width = 550;
    const { seen } = render((probe) => (
      <ResponsiveProvider config={{ breakpoints: { sm: 300, md: 400, lg: 500 } }}>{probe}</ResponsiveProvider>
    ));
    expect(seen[0].container.padding).toBe(24);
  });
});

import {
  createSelect,
  resolveBreakpoint,
  BREAKPOINT_ORDER,
} from '../breakpoints';

describe('resolveBreakpoint', () => {
  it.each([
    [0, 'xs'],
    [399, 'xs'],
    [400, 'sm'],
    [599, 'sm'],
    [600, 'md'],
    [767, 'md'],
    [768, 'lg'],
    [1007, 'lg'],
    [1008, 'xl'],
    [1279, 'xl'],
    [1280, 'xxl'],
  ])('resolves width %ipx to %s', (width, expected) => {
    expect(resolveBreakpoint(width)).toBe(expected);
  });

  it('resolves widths beyond the legacy 8192 ceiling to xxl', () => {
    // The 1.0.x breakpoint table capped group6 at 8192 and returned
    // undefined past it.
    expect(resolveBreakpoint(9000)).toBe('xxl');
  });

  it('clamps negative widths to the smallest breakpoint', () => {
    expect(resolveBreakpoint(-1)).toBe('xs');
  });

  it('covers every name in BREAKPOINT_ORDER', () => {
    const resolved = new Set(
      [0, 400, 600, 768, 1008, 1280].map(resolveBreakpoint)
    );
    expect(resolved).toEqual(new Set(BREAKPOINT_ORDER));
  });
});

describe('select', () => {
  it('returns the exact match when one exists', () => {
    expect(createSelect('lg')({ sm: 12, lg: 20 })).toBe(20);
  });

  it('cascades down to the nearest smaller breakpoint', () => {
    expect(createSelect('md')({ sm: 12, lg: 20 })).toBe(12);
  });

  it('cascades down from the largest breakpoint', () => {
    expect(createSelect('xxl')({ sm: 12, lg: 20 })).toBe(20);
  });

  it('returns undefined when nothing is defined at or below the current breakpoint', () => {
    expect(createSelect('xs')({ sm: 12, lg: 20 })).toBeUndefined();
  });

  it('falls back to the default key when no breakpoint matches', () => {
    expect(createSelect('xs')({ sm: 12, default: 8 })).toBe(8);
  });

  it('prefers a cascaded breakpoint value over the default key', () => {
    expect(createSelect('lg')({ sm: 12, default: 8 })).toBe(12);
  });

  it('never looks upward past the current breakpoint', () => {
    expect(createSelect('sm')({ xl: 99 })).toBeUndefined();
  });

  it('preserves falsy values rather than treating them as absent', () => {
    expect(createSelect('md')({ sm: 0, default: 99 })).toBe(0);
  });
});

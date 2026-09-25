import { toNumber, resetWarnedInputs } from '../toNumber';

declare const global: { __DEV__?: boolean };

let warn: jest.SpyInstance;

beforeEach(() => {
  resetWarnedInputs();
  global.__DEV__ = true;
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
  delete global.__DEV__;
});

describe('toNumber', () => {
  it.each([
    [12, 12],
    ['16', 16],
    ['50%', 50],
    [' 12.5 % ', 12.5],
    ['-10', -10],
    ['1e3', 1000],
    ['+5', 5],
    ['1e-7%', 1e-7],
    ['1E+21', 1e21],
  ])('converts %p to %p without warning', (input, expected) => {
    expect(toNumber(input)).toBe(expected);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns in development and keeps returning NaN for unparseable input', () => {
    expect(toNumber('')).toBeNaN();
    expect(toNumber('abc')).toBeNaN();
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toMatch(/expected a number or a percentage/);
  });

  it("warns about unit suffixes like '50vw' but keeps the historical parse", () => {
    expect(toNumber('50vw')).toBe(50);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/'50vw'/);
  });

  it('warns once per distinct input', () => {
    toNumber('abc');
    toNumber('abc');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('stops warning after 20 distinct inputs, saying so once', () => {
    for (let i = 0; i < 30; i += 1) {
      toNumber(`${i}vw`);
    }
    expect(warn).toHaveBeenCalledTimes(21);
    expect(warn.mock.calls[20][0]).toMatch(/further warnings suppressed/);
  });

  it('warns about non-finite numbers', () => {
    expect(toNumber(NaN)).toBeNaN();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('stays silent outside development', () => {
    global.__DEV__ = false;
    expect(toNumber('abc')).toBeNaN();
    delete global.__DEV__;
    expect(toNumber('xyz')).toBeNaN();
    expect(warn).not.toHaveBeenCalled();
  });
});

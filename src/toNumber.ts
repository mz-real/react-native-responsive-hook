declare const __DEV__: boolean | undefined;

/** A plain number, optionally followed by `%`, with surrounding whitespace. */
const NUMERIC_INPUT = /^\s*-?(\d+\.?\d*|\.\d+)\s*%?\s*$/;

const warned = new Set<string>();

/** Test hook: forget which inputs have already produced a warning. */
export function resetWarnedInputs(): void {
  warned.clear();
}

function warnOnce(value: number | string): void {
  const key = `${typeof value}:${String(value)}`;
  if (warned.has(key)) {
    return;
  }
  warned.add(key);
  console.warn(
    `react-native-responsive-hook: expected a number or a percentage string like '50%', got ${
      typeof value === 'string' ? `'${value}'` : String(value)
    }. The result may be NaN or not what you intended.`
  );
}

/**
 * Converts `50` or `'50%'` to `50`. The conversion itself is unchanged from
 * earlier versions (`parseFloat` for strings), so existing output is
 * preserved; in development, input that is not a plain number or percentage
 * -- `''`, `'abc'`, `'50vw'`, `NaN` -- logs a one-time warning.
 */
export function toNumber(value: number | string): number {
  const result = typeof value === 'number' ? value : parseFloat(value);

  const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
  if (isDev) {
    const valid =
      typeof value === 'number' ? Number.isFinite(value) : NUMERIC_INPUT.test(value);
    if (!valid) {
      warnOnce(value);
    }
  }

  return result;
}

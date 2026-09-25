/**
 * Type-level assertions, checked by `npm run typecheck` (tsconfig.test.json).
 * The runtime test only exists so Jest does not report an empty suite.
 */
import { createSelect } from '../breakpoints';

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const assertType = <T extends true>(_: T) => _;

const select = createSelect('md');

// With a `default`, a value is always found.
const withDefault = select({ sm: 12, default: 8 });
assertType<Equals<typeof withDefault, number>>(true);

// Without one, the result may be undefined.
const withoutDefault = select({ sm: 12 });
assertType<Equals<typeof withoutDefault, number | undefined>>(true);

// Mixed value types need an explicit generic.
const mixed = select<number | 'auto'>({ xs: 12, md: 'auto', default: 0 });
assertType<Equals<typeof mixed, number | 'auto'>>(true);

it('type assertions compile', () => {
  expect(withDefault).toBe(12);
  expect(withoutDefault).toBe(12);
  expect(mixed).toBe('auto');
});

// createResponsiveStyles keeps literal style values without casts, and
// rejects invalid style properties.
import { createResponsiveStyles } from '../styles';

// Only its type is used below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useRowStyles = createResponsiveStyles(({ wp }) => ({
  row: { flexDirection: 'row', width: wp(50) },
}));
type RowStyles = ReturnType<typeof useRowStyles>;
assertType<Equals<RowStyles['row']['flexDirection'], 'row'>>(true);

createResponsiveStyles(() => ({
  // @ts-expect-error -- not a valid flexDirection
  bad: { flexDirection: 'diagonal' },
}));

// The README example: select() inside a style infers the literal union from
// the style's contextual type.
createResponsiveStyles(({ wp, s, select, fontSize }) => ({
  card: {
    width: wp(90),
    padding: s(12),
    flexDirection: select({ xs: 'column', md: 'row', default: 'column' }),
  },
  title: { fontSize: fontSize(18) },
}));

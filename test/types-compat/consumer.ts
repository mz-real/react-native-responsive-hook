// Consumer-side type checks against the packed package. Every
// `@ts-expect-error` must be used, so if the library's types degrade to
// `any` these checks fail.
import useResponsive, {
  ResponsiveProvider,
  createResponsiveStyles,
  type Breakpoint,
  type ResponsiveConfig,
  type UseResponsiveReturn,
} from 'react-native-responsive-hook';

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const assertType = <T extends true>(_: T) => _;

const useStyles = createResponsiveStyles(({ wp, s, select, fontSize }) => ({
  row: {
    flexDirection: 'row',
    width: wp(50),
    padding: s(8),
    alignItems: select({ xs: 'stretch', md: 'center', default: 'stretch' }),
  },
  title: { fontSize: fontSize(18) },
}));
assertType<Equals<ReturnType<typeof useStyles>['row']['flexDirection'], 'row'>>(true);

createResponsiveStyles(() => ({
  // @ts-expect-error -- invalid flexDirection must be rejected
  bad: { flexDirection: 'diagonal' },
}));

declare const r: UseResponsiveReturn;
assertType<Equals<typeof r.breakpoint, Breakpoint>>(true);
assertType<Equals<ReturnType<typeof r.select<number>>, number | undefined>>(true);
// @ts-expect-error -- wp takes a number or string, not an object
r.wp({});

const config: ResponsiveConfig = { breakpoints: { md: 640 } };
// @ts-expect-error -- unknown breakpoint name
const badConfig: ResponsiveConfig = { breakpoints: { huge: 2000 } };

export { useResponsive, ResponsiveProvider, config, badConfig };

import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  ResponsiveProvider,
  createResponsiveStyles,
  useResponsive,
} from 'react-native-responsive-hook';

const CARDS = ['Breakpoints', 'select()', 'wp / hp', 's / vs / ms', 'fontSize', 'isTablet'];

// Defined once at module scope; rebuilt only when the window changes, so it
// follows rotation and browser resizing.
const useStyles = createResponsiveStyles(({ select, s, ms, fontSize, wp }) => {
  const columns = select({ xs: 1, md: 2, xl: 3, default: 1 });
  const gap = s(12);
  // Card width that fits `columns` cards per row inside the padded content.
  const contentWidth = Math.min(wp(100), 1200) - gap * 2;
  const cardWidth = (contentWidth - gap * (columns - 1)) / columns;

  return {
    screen: { flex: 1, backgroundColor: '#F4F6FA' },
    content: { padding: gap, alignSelf: 'center', width: '100%', maxWidth: 1200 },
    status: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      padding: s(12),
      marginBottom: gap,
      borderRadius: s(10),
      backgroundColor: '#1E293B',
    },
    statusItem: { color: '#F8FAFC', fontSize: fontSize(14), fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap },
    card: {
      width: cardWidth,
      // ms() grows gently, so cards stay compact on tablets and desktops.
      minHeight: ms(88),
      padding: ms(16),
      borderRadius: ms(12),
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
    },
    cardTitle: { fontSize: fontSize(18), fontWeight: '700', color: '#0F172A' },
    cardNote: { marginTop: s(4), fontSize: fontSize(13), color: '#475569' },
    typeScale: {
      marginTop: gap,
      padding: s(16),
      borderRadius: s(12),
      backgroundColor: '#FFFFFF',
      gap: s(6),
    },
    title: { fontSize: fontSize(24), fontWeight: '700', color: '#0F172A' },
    body: { fontSize: fontSize(16), color: '#334155' },
    caption: { fontSize: fontSize(13), color: '#64748B' },
  };
});

function StatusBarRow() {
  const { breakpoint, isLandscape, isTablet, wp, hp } = useResponsive();
  const styles = useStyles();
  const items = [
    breakpoint,
    `${Math.round(wp(100))}×${Math.round(hp(100))}`,
    isLandscape ? 'landscape' : 'portrait',
    isTablet ? 'tablet' : 'phone',
  ];

  return (
    <View style={styles.status} accessibilityRole="summary">
      {items.map((item) => (
        <Text key={item} style={styles.statusItem} allowFontScaling={false}>
          {item}
        </Text>
      ))}
    </View>
  );
}

function TypeScale() {
  const styles = useStyles();
  const { s, ms, vs } = useResponsive();

  return (
    <View style={styles.typeScale}>
      {/* fontSize() applies the OS text size itself, so native scaling is off. */}
      <Text style={styles.title} allowFontScaling={false}>
        Title · fontSize(24)
      </Text>
      <Text style={styles.body} allowFontScaling={false}>
        Body · fontSize(16)
      </Text>
      <Text style={styles.caption} allowFontScaling={false}>
        s(16) = {s(16)} · ms(16) = {ms(16)} · vs(16) = {vs(16)}
      </Text>
    </View>
  );
}

function Screen() {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <StatusBarRow />
        <View style={styles.grid}>
          {CARDS.map((title, index) => (
            <View key={title} style={styles.card}>
              <Text style={styles.cardTitle} allowFontScaling={false}>
                {title}
              </Text>
              <Text style={styles.cardNote} allowFontScaling={false}>
                Card {index + 1} — columns follow the breakpoint
              </Text>
            </View>
          ))}
        </View>
        <TypeScale />
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    // initialWindow gives web server rendering a sensible first frame.
    <SafeAreaProvider>
      <ResponsiveProvider config={{ initialWindow: { width: 390, height: 844 } }}>
        <Screen />
      </ResponsiveProvider>
    </SafeAreaProvider>
  );
}

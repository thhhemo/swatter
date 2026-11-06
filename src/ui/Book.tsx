import type { ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { pageNumber } from '../content/pick';
import { KIND_LABEL, type Quote } from '../content/quotes';
import { LeatherBackdrop } from './Backdrops';
import { colors, fonts } from './theme';

const runningHead = { fontFamily: fonts.serifSemi, fontSize: 13, letterSpacing: 2.1, color: colors.ink } as const;
const runningTag = { fontFamily: fonts.serifItalic, fontSize: 14, color: colors.muted } as const;

function Running({ left, right, style }: { left: ReactNode; right: ReactNode; style?: object }) {
  return (
    <View style={[styles.running, style]}>
      {left}
      {right}
    </View>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

/** Author heading: what kind of text, when, who, and who they were. */
function Byline({ quote, size }: { quote: Quote; size: number }) {
  return (
    <>
      <Label>{`${KIND_LABEL[quote.kind]} · ${quote.year}`}</Label>
      <Text style={[styles.author, { fontSize: size, lineHeight: size + 4 }]} numberOfLines={1} adjustsFontSizeToFit>
        {quote.author}
      </Text>
      <Text style={styles.about}>{quote.about}</Text>
    </>
  );
}

/** The quotation itself, with a big opening mark and its source underneath. */
function QuoteBlock({ quote, size, lineHeight }: { quote: Quote; size: number; lineHeight: number }) {
  return (
    <View>
      <Text style={styles.mark}>“</Text>
      <Text style={[styles.quote, { fontSize: size, lineHeight, fontFamily: quote.kind === 'philosophy' ? fonts.serif : fonts.serifItalic }]}>
        {quote.text}
      </Text>
      <Text style={styles.source}>— {quote.work}</Text>
    </View>
  );
}

function Gloss({ quote, size, lineHeight }: { quote: Quote; size: number; lineHeight: number }) {
  return (
    <View>
      <Label>WHAT IT MEANS</Label>
      <Text style={[styles.gloss, { fontSize: size, lineHeight }]}>{quote.gloss}</Text>
    </View>
  );
}

/** The phone shows one page: running head, the quote, and what it means. */
export function PhonePage({ revenge, level, quote }: { revenge: number; level: number; quote: Quote }) {
  const short = quote.text.length <= 110;
  const roomForQuestion = quote.text.length + quote.gloss.length < 300;
  return (
    <>
      <View style={[styles.running, { paddingTop: 54, paddingLeft: 48, paddingRight: 34, paddingBottom: 8 }]}>
        <Text style={runningHead}>
          REVENGE {revenge} · LV {level}
        </Text>
        <Text style={[runningTag, { marginRight: 34 }]}>{quote.tag}</Text>
      </View>
      <View style={styles.phoneBody}>
        <Byline quote={quote} size={30} />
        <View style={{ marginTop: 6 }}>
          <QuoteBlock quote={quote} size={short ? 25 : 22} lineHeight={short ? 35 : 31} />
        </View>
        <View style={styles.rule} />
        <Gloss quote={quote} size={17} lineHeight={24} />
        {roomForQuestion && (
          <>
            <View style={styles.rule} />
            <Label>THINK ABOUT IT</Label>
            <Text style={[styles.ask, { fontSize: 18, lineHeight: 26 }]}>{quote.ask}</Text>
          </>
        )}
        <Text style={styles.folio}>{pageNumber(quote) + 1}</Text>
      </View>
    </>
  );
}

type PageProps = { width: number; height: number; side: 'left' | 'right'; children: ReactNode; shut: Animated.Value };

/** One leaf of the open book that swings shut around the spine. */
function Leaf({ width, height, side, children, shut }: PageProps) {
  const left = side === 'left';
  const rotate = shut.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ['0deg', left ? '78deg' : '-78deg', '0deg'],
  });
  const edges = [
    ['#E6D9B8', 3, 2],
    ['#CDBE98', 6, 4],
    ['#E6D9B8', 9, 6],
    ['#CDBE98', 12, 8],
  ] as const;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 14,
        left: left ? 14 : undefined,
        right: left ? undefined : 14,
        width,
        height,
        transformOrigin: left ? 'right center' : 'left center',
        transform: [{ perspective: 1800 }, { rotateY: rotate }],
      }}
    >
      {[...edges].reverse().map(([color, dx, dy]) => (
        <View
          key={dx}
          style={{
            position: 'absolute',
            left: left ? -dx : dx,
            top: dy,
            width,
            height,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      ))}
      <View
        style={[
          styles.leaf,
          left ? { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 } : { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
        ]}
      >
        {children}
        <Svg
          style={{ position: 'absolute', top: 0, bottom: 0, width: 60, left: left ? undefined : 0, right: left ? 0 : undefined }}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="spine" x1={left ? '1' : '0'} y1="0" x2={left ? '0' : '1'} y2="0">
              <Stop offset="0" stopColor="#3C230A" stopOpacity={0.45} />
              <Stop offset="0.5" stopColor="#3C230A" stopOpacity={0.12} />
              <Stop offset="1" stopColor="#3C230A" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#spine)" />
        </Svg>
      </View>
    </Animated.View>
  );
}

type BookProps = { width: number; height: number; revenge: number; level: number; quote: Quote; shut: Animated.Value };

/**
 * The whole open book, for wide screens: leather cover, two pages, spine and ribbon.
 * The quote is on the left page; what it means and a question to think about are on the right.
 */
export function OpenBook({ width, height, revenge, level, quote, shut }: BookProps) {
  const pageW = (width - 28) / 2;
  const pageH = height - 28;
  const page = pageNumber(quote);
  return (
    <View style={{ width, height }}>
      <View style={[styles.cover, { width, height }]}>
        <LeatherBackdrop cx="30%" cy="10%" light="#7A2128" />
        <View style={styles.coverRim} />
        <View style={styles.coverGold} />
      </View>

      <Leaf width={pageW} height={pageH} side="left" shut={shut}>
        <Running
          left={
            <Text style={runningHead}>
              REVENGE {revenge} · LV {level}
            </Text>
          }
          right={<Text style={runningTag}>{quote.tag}</Text>}
        />
        <Byline quote={quote} size={28} />
        <View style={{ marginTop: 8 }}>
          <QuoteBlock quote={quote} size={22} lineHeight={32} />
        </View>
        <Text style={styles.folio}>{page}</Text>
      </Leaf>

      <Leaf width={pageW} height={pageH} side="right" shut={shut}>
        <Running left={<Text style={runningTag}>{quote.author}</Text>} right={<Text style={runningHead}>SWATTER</Text>} />
        <Gloss quote={quote} size={20} lineHeight={29} />
        <View style={styles.rule} />
        <Label>THINK ABOUT IT</Label>
        <Text style={styles.ask}>{quote.ask}</Text>
        <Text style={styles.folio}>{page + 1}</Text>
      </Leaf>

      <View style={[styles.spine, { height: height - 28 }]} />
      <Svg style={{ position: 'absolute', left: width / 2 - 9, top: height - 14, width: 18, height: 90 }} pointerEvents="none">
        <Defs>
          <LinearGradient id="rib" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#9E2B2B" />
            <Stop offset="0.55" stopColor={colors.ribbon} />
            <Stop offset="1" stopColor="#8E2424" />
          </LinearGradient>
        </Defs>
        <Path d="M0 0 H18 V90 L9 79 L0 90 Z" fill="url(#rib)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  running: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: colors.pageRule,
    paddingBottom: 6,
    marginBottom: 14,
  },
  phoneBody: { flex: 1, paddingTop: 20, paddingLeft: 48, paddingRight: 34, overflow: 'hidden' },
  label: { fontFamily: fonts.serifSemi, fontSize: 12, letterSpacing: 2.4, color: colors.burgundy },
  author: { fontFamily: fonts.display, color: colors.ink, marginTop: 4 },
  about: { fontFamily: fonts.serifItalic, fontSize: 15, color: colors.muted, marginTop: 2 },
  mark: { fontFamily: fonts.display, fontSize: 56, lineHeight: 52, height: 34, color: colors.burgundy, marginTop: 8 },
  quote: { color: colors.ink },
  source: { fontFamily: fonts.serifItalic, fontSize: 15, color: colors.muted, marginTop: 8, textAlign: 'right' },
  rule: { height: 1, backgroundColor: colors.pageRule, marginVertical: 16 },
  gloss: { fontFamily: fonts.serif, color: colors.ink, marginTop: 4 },
  ask: { fontFamily: fonts.serifItalic, fontSize: 20, lineHeight: 29, color: colors.burgundy, marginTop: 4 },
  folio: { position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.serif, fontSize: 14, color: colors.muted },
  cover: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 28 },
    elevation: 12,
  },
  coverRim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderWidth: 3, borderColor: '#3F0C10', borderRadius: 10 },
  coverGold: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderWidth: 1, borderColor: colors.gold, borderRadius: 10 },
  leaf: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: 34,
    paddingHorizontal: 40,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  spine: { position: 'absolute', left: '50%', marginLeft: -1, top: 14, width: 2, backgroundColor: 'rgba(40,20,5,0.55)' },
});

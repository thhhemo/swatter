import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { LeatherBackdrop } from './Backdrops';
import { Sticky } from './Controls';
import { ellipsePath } from './svgPaths';
import { colors, fonts } from './theme';

export type ClosedResult = {
  hit: boolean;
  caption: string;
  kills: number;
  level: number;
  /** Level before this swat, to say when it went up or down. */
  previousLevel: number;
};

const FILL = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } as const;
const WINGS = [ellipsePath(14, 16, 11, 5, -35), ellipsePath(34, 16, 11, 5, 35)];
const BODY = ellipsePath(24, 30, 8, 11);

const TOTAL_MS = 1500;

type Props = {
  result: ClosedResult;
  /** On wide screens the pages swing shut first, so the cover waits for them. */
  wide: boolean;
  /**
   * Whether tapping the cover opens the book. Off on a foldable's outer screen,
   * where the only way to try again is to physically open the device.
   */
  tapToOpen: boolean;
  onOpen: () => void;
};

/**
 * The shut book: shown on the closed display until the player opens it again.
 * First "THUMP!", then the result of the swat and a prompt to open the book.
 */
export function ClosedCover({ result, wide, tapToOpen, onOpen }: Props) {
  const { width } = useWindowDimensions();
  const t = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: TOTAL_MS, delay: wide ? 850 : 0, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.45, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, pulse, wide]);

  const cover = {
    opacity: t.interpolate({ inputRange: [0, 0.14], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [{ scale: t.interpolate({ inputRange: [0, 0.14], outputRange: [wide ? 1 : 1.35, 1], extrapolate: 'clamp' }) }],
  };
  const thump = {
    opacity: t.interpolate({ inputRange: [0.04, 0.12, 0.4, 0.52], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' }),
  };
  const reveal = wide ? [0.16, 0.3] : [0.52, 0.66];
  const resultOpacity = t.interpolate({ inputRange: reveal, outputRange: [0, 1], extrapolate: 'clamp' });
  const promptReveal = t.interpolate({ inputRange: [reveal[1], reveal[1] + 0.2], outputRange: [0, 1], extrapolate: 'clamp' });
  const promptOpacity = Animated.multiply(promptReveal, pulse);

  const levelNote =
    result.level > result.previousLevel
      ? `Faster! Level ${result.level}`
      : result.level < result.previousLevel
        ? `Back to level ${result.level}`
        : `Level ${result.level}`;

  return (
    <Animated.View style={[FILL, cover]}>
      <Pressable
        accessibilityRole={tapToOpen ? 'button' : undefined}
        accessibilityLabel="Open the book to try again"
        disabled={!tapToOpen}
        onPress={onOpen}
        style={FILL}
      >
        <LeatherBackdrop />
        <View style={styles.goldOuter} />
        <View style={styles.goldInner} />

        <View style={[FILL, styles.center]}>
          <Svg width={72} height={72} viewBox="0 0 48 48">
            <Path d={WINGS[0]} fill={colors.goldLight} fillOpacity={0.7} />
            <Path d={WINGS[1]} fill={colors.goldLight} fillOpacity={0.7} />
            <Path d={BODY} fill={colors.goldLight} />
            <Circle cx={24} cy={17} r={6.5} fill={colors.goldLight} />
          </Svg>
          <Text style={styles.name}>SWATTER</Text>
          <Text style={styles.tagline}>Sweet revenge, one swat at a time.</Text>

          <View style={styles.stage}>
            {!wide && (
              <Animated.Text style={[styles.thump, thump]} pointerEvents="none">
                THUMP!
              </Animated.Text>
            )}
            <Animated.View style={[styles.result, { opacity: resultOpacity, width: Math.min(340, width - 100) }]}>
              <Text style={styles.verdict}>{result.hit ? 'Squashed!' : 'Whiffed!'}</Text>
              <Text style={styles.score}>
                {result.hit ? `Revenge +1  ·  total ${result.kills}` : `Revenge stays at ${result.kills}`}
              </Text>
              <Sticky
                title={result.hit ? "THE FLY'S LAST WORDS" : 'THE FLY IS LAUGHING'}
                caption={result.caption}
                tilt={result.hit ? -2 : 2}
              />
              <Text style={styles.level}>{levelNote.toUpperCase()}</Text>
            </Animated.View>
          </View>
        </View>

        <Animated.Text style={[styles.prompt, { opacity: promptOpacity }]}>Open the book to try again.</Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  goldOuter: { position: 'absolute', left: 22, top: 22, right: 22, bottom: 22, borderWidth: 3, borderColor: colors.gold, borderRadius: 6 },
  goldInner: { position: 'absolute', left: 32, top: 32, right: 32, bottom: 32, borderWidth: 1, borderColor: colors.gold, borderRadius: 3 },
  name: { fontFamily: fonts.display, fontSize: 42, letterSpacing: 4, color: colors.goldLight, marginTop: 6 },
  tagline: { fontFamily: fonts.displayItalicLight, fontSize: 16, color: colors.goldLight },
  stage: { marginTop: 22, minHeight: 250, alignItems: 'center', justifyContent: 'center' },
  thump: {
    position: 'absolute',
    fontFamily: fonts.displayItalic,
    fontSize: 44,
    color: colors.paper,
    transform: [{ rotate: '-6deg' }],
  },
  result: { alignItems: 'center', gap: 10 },
  verdict: { fontFamily: fonts.displayItalic, fontSize: 38, color: colors.paper, transform: [{ rotate: '-3deg' }] },
  score: { fontFamily: fonts.serifSemi, fontSize: 15, letterSpacing: 1.5, color: colors.goldLight },
  level: { fontFamily: fonts.serifSemi, fontSize: 13, letterSpacing: 2.4, color: colors.goldLight, opacity: 0.85 },
  prompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70,
    textAlign: 'center',
    fontFamily: fonts.serifItalic,
    fontSize: 19,
    color: colors.goldText,
  },
});

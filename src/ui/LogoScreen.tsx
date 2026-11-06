import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors, fonts, hardShadow } from './theme';

const TILE = 200;

type Props = {
  /** The wordmark needs the display fonts; until then only the icon tile shows, like the native launch screen. */
  fontsReady: boolean;
  onDone: () => void;
};

/**
 * The logo lockup: icon tile, wordmark and tagline on walnut. The tile sits exactly where the
 * native launch screen puts it, so the handoff is seamless.
 */
export function LogoScreen({ fontsReady, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const words = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!fontsReady) return;
    const run = Animated.sequence([
      Animated.timing(words, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(1100),
      Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]);
    run.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => run.stop();
  }, [fontsReady, words, fade, onDone]);

  const top = (height - TILE) / 2;
  return (
    <Animated.View style={[styles.fill, { opacity: fade }]} pointerEvents="auto">
      <Image
        source={require('../../assets/splash-icon.png')}
        style={{ position: 'absolute', left: (width - TILE) / 2, top, width: TILE, height: TILE }}
        accessibilityLabel="Swatter"
        onLoad={() => SplashScreen.hide()}
      />
      {fontsReady && (
        <Animated.View
          style={[
            styles.words,
            {
              top: top + TILE + 26,
              opacity: words,
              transform: [{ translateY: words.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <Text style={styles.wordmark}>Swatter</Text>
          <Text style={styles.tagline}>Sweet revenge, one swat at a time.</Text>
          <View style={styles.chips}>
            <Text style={styles.chip}>THE GAME WHERE THE BOOK IS THE SWATTER</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.walnut },
  words: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 78,
    lineHeight: 92,
    letterSpacing: -0.6,
    color: colors.paper,
    ...hardShadow(colors.burgundy, 3),
  },
  tagline: { fontFamily: fonts.displayItalicLight, fontSize: 19, color: colors.goldLight, marginTop: 6 },
  chips: { marginTop: 18 },
  chip: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 1.5, color: '#CDBE98' },
});

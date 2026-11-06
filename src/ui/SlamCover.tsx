import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, fonts, hardShadow } from './theme';

/** "THUMP!" over the pages while they swing shut (wide screens only). */
export function ThumpFlash() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [t]);

  const opacity = t.interpolate({ inputRange: [0, 0.3, 0.45, 1], outputRange: [0, 0, 1, 0] });
  const scale = t.interpolate({ inputRange: [0, 0.3, 0.6, 1], outputRange: [0.3, 0.3, 1.15, 1] });
  return (
    <View style={styles.fill} pointerEvents="none">
      <Animated.Text style={[styles.text, { opacity, transform: [{ scale }, { rotate: '-8deg' }] }, hardShadow(colors.burgundy, 4)]}>
        THUMP!
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.displayItalicBlack, fontSize: 96, color: colors.paper },
});

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors } from './theme';

const SIZE = 44;

/** A ring where a tap landed and missed, so the player sees how far off they were. */
export function TapRing({ x, y }: { x: number; y: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [t]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          left: x - SIZE / 2,
          top: y - SIZE / 2,
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.85, 0] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2.5,
    borderColor: colors.ink,
  },
});

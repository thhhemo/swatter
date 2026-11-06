import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ellipsePath } from './svgPaths';
import { colors, fonts } from './theme';

export const FLY_SIZE = 64;
export const FLY_SIZE_WIDE = 72;

const TAUNTS = [
  'Bzzz, miss me?',
  'Too slow!',
  'Nice book. Shame if it closed.',
  'Is that all you got?',
  'I was in your tea.',
  'Chapter 4? I am the plot.',
];

type Props = {
  /** Top-left of the fly view, updated every frame without re-rendering. */
  pos: Animated.ValueXY;
  /** Heading in degrees, -180 to 180. */
  rot: Animated.Value;
  size?: number;
};

const WINGS_UP = [ellipsePath(14, 16, 11, 5, -35), ellipsePath(34, 16, 11, 5, 35)];
const WINGS_DOWN = [ellipsePath(14, 17.5, 11, 2.3, -35), ellipsePath(34, 17.5, 11, 2.3, 35)];
const BODY = ellipsePath(24, 30, 8, 11);

export function FlyView({ pos, rot, size = FLY_SIZE }: Props) {
  const [flap, setFlap] = useState(false);
  const [taunt, setTaunt] = useState(0);
  useEffect(() => {
    const flapId = setInterval(() => setFlap((f) => !f), 60);
    const tauntId = setInterval(() => setTaunt((t) => (t + 1) % TAUNTS.length), 2200);
    return () => {
      clearInterval(flapId);
      clearInterval(tauntId);
    };
  }, []);

  const wings = flap ? WINGS_UP : WINGS_DOWN;
  const look = flap ? -1 : 1;
  const spin = rot.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.fly, { width: size, height: size, transform: [{ translateX: pos.x }, { translateY: pos.y }] }]}
    >
      <View style={[styles.shadow, { left: size * 0.28, top: size * 0.8 }]} />
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size} viewBox="0 0 48 48">
          <Path d={wings[0]} fill={colors.teal} fillOpacity={0.9} stroke={colors.deep} strokeWidth={0.9} />
          <Path d={wings[1]} fill={colors.teal} fillOpacity={0.9} stroke={colors.deep} strokeWidth={0.9} />
          <Path
            d="M16 28 L8 34 M16 32 L9 40 M32 28 L40 34 M32 32 L39 40"
            stroke={colors.deep}
            strokeWidth={1.3}
            strokeLinecap="round"
            fill="none"
          />
          <Path d={BODY} fill={colors.deep} />
          <Circle cx={24} cy={17} r={6.5} fill="#2B2722" />
          <Circle cx={20.5} cy={14.5} r={3.6} fill={colors.cream} />
          <Circle cx={27.5} cy={14.5} r={3.6} fill={colors.cream} />
          <Circle cx={20.5 + look * 0.8} cy={15} r={1.6} fill={colors.deep} />
          <Circle cx={27.5 + look * 0.8} cy={15} r={1.6} fill={colors.deep} />
          <Path d="M20.5 20 Q24 24 27.5 20" stroke={colors.cream} strokeWidth={1.1} fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <View style={[styles.bubbleSlot, { left: size - 10, top: -size * 0.4 }]}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{TAUNTS[taunt]}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fly: { position: 'absolute', left: 0, top: 0, width: FLY_SIZE, height: FLY_SIZE },
  shadow: {
    position: 'absolute',
    left: 18,
    top: 52,
    width: 30,
    height: 10,
    borderRadius: 15,
    backgroundColor: colors.deep,
    opacity: 0.25,
  },
  bubbleSlot: { position: 'absolute', width: 300, alignItems: 'flex-start' },
  bubble: {
    backgroundColor: '#FFFBEA',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  bubbleText: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.ink },
});

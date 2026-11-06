import { Fragment, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { ellipsePath, polygonPath } from './svgPaths';
import { colors, fonts } from './theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  x: number;
  y: number;
  size?: number;
  /** Milliseconds before the splat pops in (the slam flash covers the screen first). */
  delay?: number;
};

type Pt = [number, number];

/** Rotate a point about (100, 100), the middle of the 200-unit splat. */
function around(p: Pt, deg: number): Pt {
  const a = (deg * Math.PI) / 180;
  const dx = p[0] - 100;
  const dy = p[1] - 100;
  return [100 + dx * Math.cos(a) - dy * Math.sin(a), 100 + dx * Math.sin(a) + dy * Math.cos(a)];
}

/** A long thin spike, as in the design, rotated by `deg`. */
function spike(tipX: number, deg: number): string {
  const pts = ([[100, 96], [tipX, 99], [100, 104]] as Pt[]).map((p) => around(p, deg));
  return polygonPath(pts.map(([x, y]) => ({ x, y })));
}

const BLOBS: [number, number, number][] = [
  [100, 100, 30], [76, 84, 16], [126, 80, 14], [130, 122, 17], [80, 126, 13], [104, 66, 10], [62, 108, 9], [142, 102, 8],
];
const SPECKS: [number, number, number][] = [
  [170, 60, 4], [28, 70, 3.5], [40, 150, 5], [158, 156, 4], [110, 182, 3], [176, 118, 2.5], [14, 112, 2], [70, 20, 3], [140, 22, 2.5], [186, 86, 2], [52, 178, 2],
];
const SPIKES = [
  spike(194, 0), spike(172, 8), spike(150, 20), spike(188, 62), spike(174, 118), spike(190, 160), spike(180, 205), spike(192, 250), spike(170, 295), spike(186, 335),
];

const FLAT_WINGS = [
  ellipsePath(...(around([79, 91], -18) as Pt), 13, 4.5, -43),
  ellipsePath(...(around([121, 91], -18) as Pt), 13, 4.5, 7),
];
const FLAT_BODY = ellipsePath(100, 100, 17, 11, -18);
const FLAT_EYES: Pt[] = [around([93, 89], -18), around([108, 90], -18)];

export function Splat({ x, y, size = 220, delay = 100 }: Props) {
  const pop = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const drip1 = useRef(new Animated.Value(0)).current;
  const drip2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drip = (v: Animated.Value, wait: number) =>
      Animated.timing(v, { toValue: 1, duration: 2800, delay: wait, easing: Easing.in(Easing.quad), useNativeDriver: false });
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 150, delay, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 1, duration: 1400, delay: delay + 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      drip(drip1, delay + 400),
      drip(drip2, delay + 800),
    ]).start();
  }, [pop, rise, drip1, drip2, delay]);

  return (
    <Fragment>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.splat,
          {
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            opacity: pop.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 1, 1] }),
            transform: [
              { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }) },
              { rotate: pop.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '0deg'] }) },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
          <Defs>
            <RadialGradient id="blood" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#3B0A0A" />
              <Stop offset="0.55" stopColor="#6E1414" />
              <Stop offset="1" stopColor="#8E2A20" />
            </RadialGradient>
          </Defs>
          <G fill="url(#blood)">
            {BLOBS.map(([cx, cy, r], i) => (
              <Circle key={`b${i}`} cx={cx} cy={cy} r={r} />
            ))}
            {SPIKES.map((d, i) => (
              <Path key={`s${i}`} d={d} />
            ))}
            {SPECKS.map(([cx, cy, r], i) => (
              <Circle key={`p${i}`} cx={cx} cy={cy} r={r} />
            ))}
            <AnimatedRect x={94} y={125} width={6} rx={3} height={drip1.interpolate({ inputRange: [0, 1], outputRange: [1.6, 40] })} />
            <AnimatedRect x={122} y={128} width={5} rx={2.5} height={drip2.interpolate({ inputRange: [0, 1], outputRange: [1.1, 26] })} />
          </G>
          <Path d={ellipsePath(86, 112, 8, 4)} fill="#B9B25A" fillOpacity={0.8} />
          <Path d={ellipsePath(118, 92, 6, 3)} fill="#B9B25A" fillOpacity={0.7} />
          <Path d={FLAT_WINGS[0]} fill={colors.teal} fillOpacity={0.95} />
          <Path d={FLAT_WINGS[1]} fill={colors.teal} fillOpacity={0.95} />
          <Path
            d={`M${around([88, 108], -18).join(' ')} L${around([73, 119], -18).join(' ')} M${around([96, 110], -18).join(' ')} L${around([90, 125], -18).join(' ')} M${around([106, 110], -18).join(' ')} L${around([113, 125], -18).join(' ')} M${around([114, 108], -18).join(' ')} L${around([129, 119], -18).join(' ')}`}
            stroke={colors.deep}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
          <Path d={FLAT_BODY} fill={colors.deep} />
          <Circle cx={FLAT_EYES[0][0]} cy={FLAT_EYES[0][1]} r={6} fill={colors.cream} />
          <Circle cx={FLAT_EYES[1][0]} cy={FLAT_EYES[1][1]} r={5} fill={colors.cream} />
          <Path
            d={`M${FLAT_EYES[0][0] - 3} ${FLAT_EYES[0][1] - 3} l6 6 m0 -6 l-6 6 M${FLAT_EYES[1][0] - 3} ${FLAT_EYES[1][1] - 3} l6 6 m0 -6 l-6 6`}
            stroke={colors.deep}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Path
            d={`M${around([96, 103], -18).join(' ')} Q${around([100, 114], -18).join(' ')} ${around([104, 103], -18).join(' ')}Z`}
            fill={colors.ribbon}
          />
        </Svg>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.rise,
          {
            left: x - 20,
            top: y - 80,
            opacity: rise.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
            transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) }],
          },
        ]}
      >
        <Text style={styles.riseText}>Revenge +1</Text>
      </Animated.View>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  splat: { position: 'absolute' },
  rise: { position: 'absolute' },
  riseText: { fontFamily: fonts.displayItalic, fontSize: 30, color: colors.blood },
});

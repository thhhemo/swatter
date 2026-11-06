import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from './theme';

/** The right-hand page of an open book, filling the phone screen, with gutter shadow, page edge and ribbon. */
export function PaperBackdrop({ width, height }: { width: number; height: number }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height} pointerEvents="none">
      <Defs>
        <RadialGradient id="paper" cx="50%" cy="45%" r="75%">
          <Stop offset="0" stopColor="#F8F0DC" />
          <Stop offset="0.8" stopColor="#EBDFC2" />
          <Stop offset="1" stopColor="#DCCDA6" />
        </RadialGradient>
        <LinearGradient id="gutter" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#3C230A" stopOpacity={0.38} />
          <Stop offset="0.45" stopColor="#3C230A" stopOpacity={0.12} />
          <Stop offset="1" stopColor="#3C230A" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="edgeShade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#3C230A" stopOpacity={0.25} />
          <Stop offset="1" stopColor="#3C230A" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#9E2B2B" />
          <Stop offset="0.55" stopColor={colors.ribbon} />
          <Stop offset="1" stopColor="#8E2424" />
        </LinearGradient>
        <Pattern id="speck" width={5} height={5} patternUnits="userSpaceOnUse">
          <Rect x={0} y={0} width={1.2} height={1.2} fill="#785A28" fillOpacity={0.07} />
        </Pattern>
        <Pattern id="leaves" width={2.5} height={4} patternUnits="userSpaceOnUse">
          <Rect x={0} y={0} width={1.5} height={4} fill={colors.paper} />
          <Rect x={1.5} y={0} width={1} height={4} fill="#CDBE98" />
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill="url(#paper)" />
      <Rect width={width} height={height} fill="url(#speck)" />
      <Rect x={0} y={0} width={44} height={height} fill="url(#gutter)" />
      <Rect x={width - 11} y={0} width={11} height={height} fill="url(#leaves)" />
      <Rect x={width - 11} y={0} width={8} height={height} fill="url(#edgeShade)" />
      <Path
        d={`M${width - 96} 0 H${width - 78} V132 L${width - 87} 116 L${width - 96} 132 Z`}
        fill="url(#ribbon)"
      />
    </Svg>
  );
}

/** Dark walnut table the book lies on. */
export function WalnutBackdrop() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.walnutLight} />
          <Stop offset="1" stopColor={colors.walnutDark} />
        </LinearGradient>
        <Pattern id="grain" width={8} height={8} patternUnits="userSpaceOnUse">
          <Rect x={0} y={0} width={2} height={8} fill="#FFFFFF" fillOpacity={0.025} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={colors.walnut} />
      <Rect width="100%" height="100%" fill="url(#wood)" />
      <Rect width="100%" height="100%" fill="url(#grain)" />
    </Svg>
  );
}

/** Burgundy leather, for the book cover and the slam flash. `cx`/`cy` place the highlight. */
export function LeatherBackdrop({ cx = '30%', cy = '18%', light = '#8A2B30' }: { cx?: string; cy?: string; light?: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="leather" cx={cx} cy={cy} r="90%">
          <Stop offset="0" stopColor={light} />
          <Stop offset="0.7" stopColor={colors.burgundyDark} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={colors.burgundyDark} />
      <Rect width="100%" height="100%" fill="url(#leather)" />
    </Svg>
  );
}

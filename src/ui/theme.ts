export const colors = {
  paper: '#F3EAD3',
  ink: '#2A2520',
  /** Near-black for the fly and splat artwork. */
  deep: '#16130F',
  muted: '#5A5346',
  hint: '#4A4437',
  pageRule: '#B9A87F',
  burgundy: '#7A1F24',
  burgundyDark: '#5A1318',
  gold: '#D9B25A',
  goldLight: '#E3C16F',
  goldText: '#F0D58A',
  ribbon: '#C0392B',
  blood: '#7A1422',
  teal: '#8FD3D0',
  cream: '#FFF6DC',
  note: '#FBF3B8',
  noteEdge: '#E0D27A',
  walnut: '#2B1D14',
  walnutLight: '#3A2718',
  walnutDark: '#22160D',
  onWalnut: '#E6D9B8',
};

export const fonts = {
  display: 'PlayfairDisplay_900Black',
  displayBold: 'PlayfairDisplay_800ExtraBold',
  displayItalic: 'PlayfairDisplay_800ExtraBold_Italic',
  displayItalicBlack: 'PlayfairDisplay_900Black_Italic',
  displayItalicLight: 'PlayfairDisplay_600SemiBold_Italic',
  serif: 'CrimsonPro_400Regular',
  serifItalic: 'CrimsonPro_400Regular_Italic',
  serifSemi: 'CrimsonPro_600SemiBold',
  sans: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold',
  hand: 'Caveat_700Bold',
};

export function hardShadow(color: string, offset: number) {
  return {
    textShadowColor: color,
    textShadowOffset: { width: offset, height: offset },
    textShadowRadius: 0,
  } as const;
}

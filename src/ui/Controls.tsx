import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from './theme';

/** A yellow sticky note with the fly's last words (or its laughter). */
export function Sticky({ title, caption, tilt, wide }: { title: string; caption: string; tilt: number; wide?: boolean }) {
  return (
    <View style={[styles.note, { transform: [{ rotate: `${tilt}deg` }], paddingVertical: wide ? 8 : 10 }]}>
      <Text style={styles.noteTitle}>{title}</Text>
      <Text style={[styles.noteCaption, { fontSize: wide ? 26 : 28, lineHeight: wide ? 29 : 31 }]}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    backgroundColor: colors.note,
    borderWidth: 1,
    borderColor: colors.noteEdge,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#3C280A',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  noteTitle: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 1.5, color: colors.ink },
  noteCaption: { fontFamily: fonts.hand, color: colors.ink, textAlign: 'center' },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DIFFICULTIES, type Difficulty } from '../settings/difficulty';
import { colors, fonts } from './theme';

type Props = {
  difficulty: Difficulty;
  wide: boolean;
  onChange: (value: Difficulty) => void;
  onClose: () => void;
};

/** A leather-bound card over the book: pick how hard the fly is. The game waits while it is open. */
export function SettingsSheet({ difficulty, wide, onChange, onClose }: Props) {
  const current = DIFFICULTIES.find((d) => d.id === difficulty) ?? DIFFICULTIES[1];
  return (
    <View style={styles.scrim}>
      <View style={[styles.card, wide && { width: 520 }]}>
        <Text style={styles.kicker}>SETTINGS</Text>
        <Text style={styles.title}>Difficulty</Text>

        <View style={styles.row} accessibilityRole="radiogroup">
          {DIFFICULTIES.map((d) => {
            const on = d.id === difficulty;
            return (
              <Pressable
                key={d.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => onChange(d.id)}
                style={[styles.option, on && styles.optionOn]}
              >
                <Text style={[styles.optionText, on && styles.optionTextOn]}>{d.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.blurb}>{current.blurb}</Text>
        <Text style={styles.note}>Levels still climb with every swat. This sets how hard each one is.</Text>

        <Pressable accessibilityRole="button" onPress={onClose} style={styles.done}>
          <Text style={styles.doneText}>Back to the book</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(30,14,8,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.paper,
    borderWidth: 3,
    borderColor: colors.gold,
    borderRadius: 10,
    padding: 22,
    gap: 10,
  },
  kicker: { fontFamily: fonts.serifSemi, fontSize: 12, letterSpacing: 2.4, color: colors.burgundy },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  option: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.pageRule,
    backgroundColor: '#FBF5E4',
  },
  optionOn: { backgroundColor: colors.burgundy, borderColor: colors.gold },
  optionText: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink },
  optionTextOn: { color: colors.goldText },
  blurb: { fontFamily: fonts.serifItalic, fontSize: 18, lineHeight: 24, color: colors.ink, marginTop: 4 },
  note: { fontFamily: fonts.serif, fontSize: 14, lineHeight: 19, color: colors.muted },
  done: {
    marginTop: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.burgundyDark,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  doneText: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.goldText },
});

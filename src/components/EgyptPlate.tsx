import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/components/ui';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Splits a typed plate ("أ ب ج 1234") into its letters and its digits, digits shown in Arabic. */
export function splitPlate(plate: string): { letters: string; digits: string } {
  const digits = [...plate]
    .filter((ch) => /[0-9٠-٩]/.test(ch))
    .map((ch) => (/[0-9]/.test(ch) ? ARABIC_DIGITS[Number(ch)] : ch))
    .join('');
  const letters = plate.replace(/[0-9٠-٩]/g, '').replace(/\s+/g, ' ').trim();
  return { letters, digits };
}

type Props = { plate: string; size?: 'sm' | 'lg' };

/** An Egyptian number plate: the blue "مصر EGYPT" strip, numbers on the left, letters on the right. */
export function EgyptPlate({ plate, size = 'sm' }: Props) {
  const { letters, digits } = splitPlate(plate);
  const lg = size === 'lg';
  const text = [styles.text, { fontSize: lg ? 22 : 15 }];
  return (
    <View
      accessible
      accessibilityLabel={plate}
      style={[styles.plate, { width: lg ? 176 : 124, borderWidth: lg ? 2.5 : 2 }]}
    >
      <View style={styles.strip}>
        <Text style={[styles.stripText, { fontSize: lg ? 11 : 9 }]}>EGYPT</Text>
        <Text style={[styles.stripText, { fontSize: lg ? 11 : 9 }]}>مصر</Text>
      </View>
      {/* Fixed left-to-right so the numbers stay on the left whatever the app language. */}
      <View style={styles.body}>
        <Text style={[...text, styles.cell, styles.divider]} numberOfLines={1}>
          {digits || '—'}
        </Text>
        <Text style={[...text, styles.cell]} numberOfLines={1}>
          {letters || '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: { borderColor: colors.text, borderRadius: 9, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  strip: {
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.plateBlue,
    paddingHorizontal: 6,
  },
  stripText: { color: '#FFFFFF', fontFamily: fonts.semibold },
  body: { direction: 'ltr', flexDirection: 'row' },
  cell: { flex: 1, textAlign: 'center', paddingVertical: 2 },
  divider: { borderRightWidth: 1.5, borderRightColor: colors.text },
  text: { fontFamily: fonts.bold, color: colors.text },
});

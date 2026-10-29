import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/components/ui';

export type PickerOption = { value: string; label: string; sub?: string };

type Props = {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shown instead of opening when there is nothing to pick from yet (e.g. no make chosen). */
  disabledHint?: string;
  /** Lets the user type a value that is not in the list. */
  allowCustom?: boolean;
  keyboardType?: 'default' | 'number-pad';
};

/** A field that opens a searchable list. */
export function PickerField({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabledHint,
  allowCustom,
  keyboardType = 'default',
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const disabled = !!disabledHint;
  const shown = options.find((o) => o.value === value)?.label ?? value;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sub?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const custom = query.trim();
  const showCustom =
    allowCustom && custom !== '' && !options.some((o) => o.label.toLowerCase() === custom.toLowerCase());

  function pick(v: string) {
    onChange(v);
    setOpen(false);
    setQuery('');
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={({ pressed }) => [styles.input, disabled && styles.disabled, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.value, !shown && { color: colors.muted }]} numberOfLines={1}>
          {shown || (disabled ? disabledHint : placeholder ?? t('picker.choose'))}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Text style={styles.close}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder={allowCustom ? t('picker.searchOrType') : t('picker.search')}
            placeholderTextColor={colors.muted}
            autoFocus
            autoCorrect={false}
            keyboardType={keyboardType}
          />
          <FlatList
            data={filtered}
            keyExtractor={(o) => o.value}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              showCustom ? (
                <Pressable style={styles.row} onPress={() => pick(custom)}>
                  <Text style={[styles.rowText, { color: colors.primary }]}>
                    {t('picker.useCustom', { value: custom })}
                  </Text>
                </Pressable>
              ) : undefined
            }
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.background }]}
                onPress={() => pick(item.value)}
              >
                <Text style={[styles.rowText, item.value === value && styles.selected]}>
                  {item.label}
                </Text>
                {item.sub ? <Text style={styles.sub}>{item.sub}</Text> : null}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text, textAlign: 'left' },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: colors.card,
  },
  disabled: { opacity: 0.6 },
  value: { flex: 1, fontSize: 16, fontFamily: fonts.regular, color: colors.text, textAlign: 'left' },
  chevron: { fontSize: 14, color: colors.muted, marginStart: 8 },
  sheet: { flex: 1, backgroundColor: colors.card },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontFamily: fonts.bold, color: colors.text },
  close: { fontSize: 16, fontFamily: fonts.medium, color: colors.primary },
  search: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    textAlign: 'left',
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: { fontSize: 16, fontFamily: fonts.regular, color: colors.text, textAlign: 'left' },
  selected: { fontFamily: fonts.bold, color: colors.primary },
  sub: { fontSize: 13, fontFamily: fonts.regular, color: colors.muted, marginTop: 2, textAlign: 'left' },
});

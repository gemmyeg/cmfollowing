import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  type TextInputProps,
} from 'react-native';

/** "Egyptian warm" theme: sand background, deep teal, terracotta for what is overdue. */
export const colors = {
  primary: '#0F5C63',
  primarySoft: '#DCEFEF',
  text: '#1F1A14',
  muted: '#6B5F50',
  border: '#E7DCC8',
  background: '#F6F1E7',
  card: '#FFFDF8',
  danger: '#B5462A',
  plateBlue: '#1E5AA8',
};

/** Header and background for every stack, so screens share the theme. */
export const stackScreenOptions = {
  // Newer iOS versions draw the header see-through over the content unless told not to.
  headerTransparent: false,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: '#F6F1E7' },
  headerTintColor: '#0F5C63',
  headerTitleStyle: { fontFamily: 'ReadexPro_600SemiBold', color: '#1F1A14' },
  contentStyle: { backgroundColor: '#F6F1E7' },
};

/** Readex Pro, loaded in the root layout. Use these instead of fontWeight. */
export const fonts = {
  regular: 'ReadexPro_400Regular',
  medium: 'ReadexPro_500Medium',
  semibold: 'ReadexPro_600SemiBold',
  bold: 'ReadexPro_700Bold',
};

/** Tapping outside a field closes the keyboard. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.screen}>{children}</View>
    </TouchableWithoutFeedback>
  );
}

export function ScrollScreen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      // Tapping outside a field or dragging the page closes the keyboard, and the page can
      // scroll above it so the save button stays reachable.
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      {children}
    </ScrollView>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <Text style={styles.error}>{children}</Text>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.muted}
        returnKeyType="done"
        {...props}
      />
    </View>
  );
}

type CheckRowProps = { label: string; sub?: string; checked: boolean; onToggle: () => void };

export function CheckRow({ label, sub, checked, onToggle }: CheckRowProps) {
  return (
    <Pressable onPress={onToggle} style={styles.checkRow}>
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked && <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {sub ? <Text style={styles.muted}>{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'link';
};

export function Button({ title, onPress, loading, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'link' && styles.buttonLink,
        pressed && { opacity: 0.7 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text style={[styles.buttonText, variant !== 'primary' && { color: colors.primary }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, gap: 12, backgroundColor: colors.background },
  scroll: { padding: 20, gap: 12, paddingBottom: 48 },
  section: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, marginTop: 12, textAlign: 'left' },
  title: { fontSize: 26, fontFamily: fonts.bold, color: colors.text, textAlign: 'left' },
  muted: { fontSize: 14, fontFamily: fonts.regular, color: colors.muted, textAlign: 'left' },
  error: { fontSize: 14, fontFamily: fonts.medium, color: colors.danger, textAlign: 'left' },
  field: { gap: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: { backgroundColor: colors.primary },
  label: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text, textAlign: 'left' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    backgroundColor: colors.card,
    color: colors.text,
    textAlign: 'left',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  buttonLink: { backgroundColor: 'transparent' },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: fonts.semibold },
});

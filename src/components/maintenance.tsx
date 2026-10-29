import { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, colors, fonts } from '@/components/ui';
import { dueInfo, itemName, type DueInfo, type DueStatus } from '@/lib/maintenance';
import { pickPhoto } from '@/lib/photos';
import type { Car, MaintenanceItem } from '@/lib/types';

/** Text, soft background and solid color for each status. They also differ in lightness. */
export const STATUS_THEME: Record<
  DueStatus,
  { fg: string; bg: string; solid: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  overdue: { fg: '#8C2F18', bg: '#FBE7E1', solid: colors.danger, icon: 'warning-outline' },
  soon: { fg: '#6B4600', bg: '#FBEBC8', solid: '#D9A23B', icon: 'time-outline' },
  ok: { fg: colors.primary, bg: colors.primarySoft, solid: colors.primary, icon: 'checkmark-circle-outline' },
  unknown: { fg: colors.muted, bg: '#EDE4D3', solid: '#CDBFA8', icon: 'help-circle-outline' },
};

export function StatusBadge({ status }: { status: DueStatus }) {
  const { t } = useTranslation();
  const theme = STATUS_THEME[status];
  return (
    <View style={[styles.badge, { backgroundColor: theme.bg }]}>
      <Text style={[styles.badgeText, { color: theme.fg }]}>{t(`status.${status}`)}</Text>
    </View>
  );
}

/** "3,200 km left · 45 days left" style summary. */
export function dueSummary(due: DueInfo, t: TFunction): string {
  const parts: string[] = [];
  if (due.remainingKm != null) {
    parts.push(
      due.remainingKm > 0
        ? t('item.remainingKm', { count: due.remainingKm.toLocaleString() })
        : t('item.overdueKm', { count: (-due.remainingKm).toLocaleString() }),
    );
  }
  if (due.remainingDays != null) {
    parts.push(
      due.remainingDays > 0
        ? t('item.remainingDays', { count: due.remainingDays })
        : t('item.overdueDays', { count: -due.remainingDays }),
    );
  }
  return parts.join(' · ');
}

export function intervalSummary(item: MaintenanceItem, t: TFunction): string {
  const parts: string[] = [];
  if (item.intervalKm) parts.push(t('item.intervalKm', { count: item.intervalKm.toLocaleString() }));
  if (item.intervalMonths) parts.push(t('item.intervalMonths', { count: item.intervalMonths }));
  return parts.length ? t('item.interval', { value: parts.join(' / ') }) : '';
}

type ItemRowProps = { item: MaintenanceItem; car: Car; onPress?: () => void };

export function ItemRow({ item, car, onPress }: ItemRowProps) {
  const { t } = useTranslation();
  const due = dueInfo(item, car);
  const theme = STATUS_THEME[due.status];
  const summary = dueSummary(due, t);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        due.status === 'overdue' && { borderColor: '#F0C9BD' },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: theme.bg }]}>
        <Ionicons name={theme.icon} size={22} color={theme.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowTitle}>{itemName(item, t)}</Text>
        <Text style={[styles.rowSub, summary && due.status !== 'ok' ? { color: theme.fg } : null]}>
          {summary || intervalSummary(item, t)}
        </Text>
      </View>
    </Pressable>
  );
}

export function CarAvatar({ photo, size = 56 }: { photo?: string | null; size?: number }) {
  return photo ? (
    <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 4 }} />
  ) : (
    <View style={[styles.avatarEmpty, { width: size, height: size, borderRadius: size / 4 }]}>
      <Ionicons name="car-sport-outline" size={size / 2} color={colors.primary} />
    </View>
  );
}

type PhotoFieldProps = { value: string | null; onChange: (uri: string | null) => void; label: string };

/** Take, choose or remove a photo. */
export function PhotoField({ value, onChange, label }: PhotoFieldProps) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.rowTitle}>{label}</Text>
      {value && <Image source={{ uri: value }} style={styles.photo} />}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button
            title={t('car.takePhoto')}
            variant="secondary"
            onPress={async () => onChange((await pickPhoto('camera', 512))?.dataUri ?? value)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={t('car.choosePhoto')}
            variant="secondary"
            onPress={async () => onChange((await pickPhoto('library', 512))?.dataUri ?? value)}
          />
        </View>
      </View>
      {value && <Button title={t('car.removePhoto')} variant="link" onPress={() => onChange(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontFamily: fonts.semibold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text, textAlign: 'left' },
  rowSub: { fontSize: 12, fontFamily: fonts.regular, color: colors.muted, textAlign: 'left' },
  avatarEmpty: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14 },
});

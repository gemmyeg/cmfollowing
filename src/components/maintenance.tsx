import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, colors } from '@/components/ui';
import { dueInfo, itemName, type DueInfo, type DueStatus } from '@/lib/maintenance';
import { pickPhoto } from '@/lib/photos';
import type { Car, MaintenanceItem } from '@/lib/types';

const STATUS_COLORS: Record<DueStatus, string> = {
  ok: '#1A7F37',
  soon: '#9A6700',
  overdue: colors.danger,
  unknown: colors.muted,
};

export function StatusBadge({ status }: { status: DueStatus }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.badge, { borderColor: STATUS_COLORS[status] }]}>
      <Text style={[styles.badgeText, { color: STATUS_COLORS[status] }]}>{t(`status.${status}`)}</Text>
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
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowTitle}>{itemName(item, t)}</Text>
        <Text style={styles.rowSub}>{intervalSummary(item, t)}</Text>
        {!!dueSummary(due, t) && <Text style={styles.rowSub}>{dueSummary(due, t)}</Text>}
      </View>
      <StatusBadge status={due.status} />
    </Pressable>
  );
}

export function CarAvatar({ photo, size = 56 }: { photo?: string | null; size?: number }) {
  return photo ? (
    <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 4 }} />
  ) : (
    <View style={[styles.avatarEmpty, { width: size, height: size, borderRadius: size / 4 }]}>
      <Text style={{ fontSize: size / 2 }}>🚗</Text>
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
            onPress={async () => onChange((await pickPhoto('camera', 512)) ?? value)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={t('car.choosePhoto')}
            variant="secondary"
            onPress={async () => onChange((await pickPhoto('library', 512)) ?? value)}
          />
        </View>
      </View>
      {value && <Button title={t('car.removePhoto')} variant="link" onPress={() => onChange(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'left' },
  rowSub: { fontSize: 13, color: colors.muted, textAlign: 'left' },
  avatarEmpty: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 10 },
});

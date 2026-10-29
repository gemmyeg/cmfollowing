import { Redirect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dueSummary, StatusBadge } from '@/components/maintenance';
import { Muted, ScrollScreen, Section, colors } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useCars, useItemsForCars, useServicesForCars } from '@/lib/cars';
import { summarize } from '@/lib/dashboard';
import { itemName } from '@/lib/maintenance';
import { formatEgp } from '@/lib/money';

/** Admin overview of every car: counts and the items that need attention. */
export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const cars = useCars();
  const carIds = cars.data.map((c) => c.id);
  const itemsByCar = useItemsForCars(carIds);
  const servicesByCar = useServicesForCars(carIds);

  if (!isAdmin) return <Redirect href="/" />;
  const s = summarize(cars.data, itemsByCar, servicesByCar);

  const tiles = [
    { label: t('dashboard.cars'), value: s.cars, color: colors.text },
    { label: t('dashboard.carsNeedingService'), value: s.carsNeedingService, color: colors.text },
    { label: t('dashboard.overdue'), value: s.overdue, color: colors.danger },
    { label: t('dashboard.soon'), value: s.soon, color: '#9A6700' },
    { label: t('dashboard.spentMonth'), value: formatEgp(s.spentMonth, i18n.language), color: colors.text },
    { label: t('dashboard.spentYear'), value: formatEgp(s.spentYear, i18n.language), color: colors.text },
  ];

  return (
    <ScrollScreen>
      <View style={styles.tiles}>
        {tiles.map((tile) => (
          <View key={tile.label} style={styles.tile}>
            <Text style={[styles.tileValue, { color: tile.color }]}>{tile.value}</Text>
            <Text style={styles.tileLabel}>{tile.label}</Text>
          </View>
        ))}
      </View>

      <Section>{t('dashboard.attention')}</Section>
      {s.attention.length === 0 && <Muted>{t('dashboard.allGood')}</Muted>}
      {s.attention.map(({ car, item, due }) => (
        <Pressable
          key={`${car.id}/${item.id}`}
          style={styles.row}
          onPress={() => router.push({ pathname: '/cars/[id]', params: { id: car.id } })}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.rowTitle}>{itemName(item, t)}</Text>
            <Muted>{`${car.make} ${car.model} · ${car.plate}`}</Muted>
            <Muted>{dueSummary(due, t)}</Muted>
          </View>
          <StatusBadge status={due.status} />
        </Pressable>
      ))}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  tileValue: { fontSize: 28, fontWeight: '700', textAlign: 'left' },
  tileLabel: { fontSize: 13, color: colors.muted, textAlign: 'left' },
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
});

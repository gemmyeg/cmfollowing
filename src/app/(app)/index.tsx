import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EgyptPlate } from '@/components/EgyptPlate';
import { dueSummary, STATUS_THEME } from '@/components/maintenance';
import { Muted, colors, fonts } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useCars, useItemsForCars, useServicesForCars } from '@/lib/cars';
import { summarize } from '@/lib/dashboard';
import { dueInfo, itemName, sortByUrgency } from '@/lib/maintenance';
import { formatEgp } from '@/lib/money';
import type { Car, MaintenanceItem } from '@/lib/types';

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user, profile, isAdmin } = useAuth();
  const cars = useCars();
  const carIds = cars.data.map((c) => c.id);
  const itemsByCar = useItemsForCars(carIds);
  const servicesByCar = useServicesForCars(carIds);
  const summary = summarize(cars.data, itemsByCar, servicesByCar);
  const lang = i18n.language;
  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Muted>{today}</Muted>
            <Text style={styles.greeting} numberOfLines={1}>
              {t('home.greeting', { name: profile?.name || user?.displayName || '' })}
            </Text>
          </View>
          {isAdmin && (
            <IconButton
              icon="stats-chart-outline"
              label={t('dashboard.title')}
              onPress={() => router.push('/dashboard')}
            />
          )}
          <IconButton
            icon="settings-outline"
            label={t('settings.title')}
            onPress={() => router.push('/settings')}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={[styles.summary, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={[styles.summaryLabel, { color: '#FFFFFF' }]}>{t('home.spentMonth')}</Text>
            <Text style={[styles.summaryValue, { color: '#FFFFFF' }]}>
              {formatEgp(summary.spentMonth, lang)}
            </Text>
            <Text style={[styles.summaryLabel, { color: '#CDE7E9' }]}>
              {t('home.spentYear', { value: formatEgp(summary.spentYear, lang) })}
            </Text>
          </View>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>{t('home.toDo')}</Text>
            {summary.overdue + summary.soon === 0 ? (
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{t('home.allGood')}</Text>
            ) : (
              <>
                <Text style={[styles.summaryValue, { color: colors.danger }]}>
                  {t('home.overdueCount', { count: summary.overdue })}
                </Text>
                <Text style={styles.summaryLabel}>{t('home.soonCount', { count: summary.soon })}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>{t('home.vehicles')}</Text>
          {isAdmin && (
            <Pressable onPress={() => router.push('/cars/new')} hitSlop={10} style={styles.addLink}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.addText}>{t('home.addCar')}</Text>
            </Pressable>
          )}
        </View>

        {cars.data.length === 0 && (
          <Muted>
            {cars.loading ? t('common.loading') : t(isAdmin ? 'home.empty' : 'car.noneAssigned')}
          </Muted>
        )}
        {cars.data.map((car) => (
          <CarCard key={car.id} car={car} items={itemsByCar[car.id] ?? []} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function CarCard({ car, items }: { car: Car; items: MaintenanceItem[] }) {
  const { t } = useTranslation();
  const rows = sortByUrgency(items.map((item) => ({ item, due: dueInfo(item, car) })));
  const top = rows[0];
  const alert = top && (top.due.status === 'overdue' || top.due.status === 'soon') ? top : null;
  const theme = alert ? STATUS_THEME[alert.due.status] : null;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/cars/[id]', params: { id: car.id } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.carName} numberOfLines={1}>{`${car.make} ${car.model}`}</Text>
          <Muted>{`${car.year} · ${t('car.km', { value: car.currentKm.toLocaleString() })}`}</Muted>
        </View>
        <EgyptPlate plate={car.plate} />
      </View>

      {rows.length > 0 && (
        <View style={styles.segments}>
          {rows.map(({ item, due }) => (
            <View key={item.id} style={[styles.segment, { backgroundColor: STATUS_THEME[due.status].solid }]} />
          ))}
        </View>
      )}

      {alert && theme ? (
        <View style={[styles.alert, { backgroundColor: theme.bg }]}>
          <Ionicons name={theme.icon} size={18} color={theme.fg} />
          <Text style={[styles.alertText, { color: theme.fg }]} numberOfLines={1}>
            {`${itemName(alert.item, t)} · ${dueSummary(alert.due, t)}`}
          </Text>
        </View>
      ) : (
        rows.length > 0 && <Muted>{t('home.allGood')}</Muted>
      )}
    </Pressable>
  );
}

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function IconButton({ icon, label, onPress }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: 26, fontFamily: fonts.bold, color: colors.text, textAlign: 'left' },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flex: 1,
    gap: 4,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: { fontSize: 12, fontFamily: fonts.regular, color: colors.muted, textAlign: 'left' },
  summaryValue: { fontSize: 20, fontFamily: fonts.bold, color: colors.text, textAlign: 'left' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
  addLink: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  addText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.primary },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  carName: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, textAlign: 'left' },
  segments: { flexDirection: 'row', gap: 3 },
  segment: { flex: 1, height: 8, borderRadius: 4 },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  alertText: { flex: 1, fontSize: 13, fontFamily: fonts.semibold, textAlign: 'left' },
});

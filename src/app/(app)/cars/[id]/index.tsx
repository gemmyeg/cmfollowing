import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EgyptPlate } from '@/components/EgyptPlate';
import { CarAvatar, ItemRow, STATUS_THEME } from '@/components/maintenance';
import { Muted, Screen, colors, fonts } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useCar, useItems, useServices, useUsers } from '@/lib/cars';
import { dueInfo, kmPerDay, sortByUrgency, type DueStatus } from '@/lib/maintenance';
import { formatEgp } from '@/lib/money';

const GROUPS: DueStatus[] = ['overdue', 'soon', 'ok', 'unknown'];

export default function CarDetails() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const car = useCar(id);
  const items = useItems(id);
  const users = useUsers();
  const services = useServices(id);

  if (car.loading) return <Screen><Muted>{t('common.loading')}</Muted></Screen>;
  if (!car.data) return <Screen><Muted>{t('car.notFound')}</Muted></Screen>;
  const c = car.data;

  const rows = sortByUrgency(items.data.map((item) => ({ item, due: dueInfo(item, c) })));
  const assignedNames = users.data
    .filter((u) => c.assignedUserIds.includes(u.uid))
    .map((u) => u.name || u.email);
  const openItem = (itemId: string) =>
    router.push({ pathname: '/cars/[id]/items/[itemId]', params: { id, itemId } });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: `${c.make} ${c.model}`,
          headerRight: isAdmin
            ? () => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('car.edit')}
                  hitSlop={10}
                  onPress={() => router.push({ pathname: '/cars/[id]/edit', params: { id } })}
                >
                  <Ionicons name="create-outline" size={24} color={colors.primary} />
                </Pressable>
              )
            : undefined,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <CarAvatar photo={c.photo} size={56} />
            <EgyptPlate plate={c.plate} size="lg" />
            {c.ownerPhone ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('car.callOwner')}
                onPress={() => Linking.openURL(`tel:${c.ownerPhone}`)}
                style={({ pressed }) => [styles.call, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="call-outline" size={22} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View style={{ width: 56 }} />
            )}
          </View>
          <Text style={styles.name}>{`${c.make} ${c.model} · ${c.year}`}</Text>
          <Text style={styles.sub}>
            {[
              t('car.km', { value: c.currentKm.toLocaleString() }),
              t('car.kmPerDay', { count: Math.round(kmPerDay(c)) }),
              c.ownerName,
            ].join(' · ')}
          </Text>
          {isAdmin && assignedNames.length > 0 && (
            <Text style={styles.sub}>{`${t('car.assignedTo')}: ${assignedNames.join('، ')}`}</Text>
          )}
        </View>

        {GROUPS.map((status) => {
          const group = rows.filter((r) => r.due.status === status);
          if (group.length === 0) return null;
          return (
            <View key={status} style={{ gap: 8 }}>
              <Text style={[styles.groupTitle, { color: STATUS_THEME[status].fg }]}>
                {`${t(`status.${status}`)} (${group.length})`}
              </Text>
              {group.map(({ item }) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  car={c}
                  onPress={isAdmin ? () => openItem(item.id) : undefined}
                />
              ))}
            </View>
          );
        })}
        {isAdmin && (
          <Pressable onPress={() => openItem('new')} style={styles.addLink} hitSlop={6}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addText}>{t('item.new')}</Text>
          </Pressable>
        )}

        <Text style={styles.section}>{t('service.history')}</Text>
        {services.data.length === 0 && !services.loading && <Muted>{t('service.noHistory')}</Muted>}
        {services.data.map((s) => (
          <Pressable
            key={s.id}
            onPress={() =>
              router.push({ pathname: '/cars/[id]/services/[serviceId]', params: { id, serviceId: s.id } })
            }
            style={({ pressed }) => [styles.service, pressed && { opacity: 0.8 }]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.serviceDate}>
                {new Date(s.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB')}
              </Text>
              <Muted>
                {`${t('car.km', { value: s.km.toLocaleString() })} · ${t('service.itemsCount', { count: s.items.length })}`}
              </Muted>
            </View>
            <Text style={styles.serviceCost}>{formatEgp(s.totalCost, i18n.language)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bar}>
        <Pressable
          onPress={() => router.push({ pathname: '/cars/[id]/service', params: { id, mode: 'km' } })}
          style={({ pressed }) => [styles.barButton, styles.barSecondary, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={[styles.barText, { color: colors.primary }]}>{t('service.updateKm')}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: '/cars/[id]/service', params: { id } })}
          style={({ pressed }) => [styles.barButton, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="construct-outline" size={20} color="#FFFFFF" />
          <Text style={styles.barText}>{t('service.log')}</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  hero: { alignItems: 'center', gap: 6 },
  heroRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  call: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 22, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  sub: { fontSize: 13, fontFamily: fonts.regular, color: colors.muted, textAlign: 'center' },
  groupTitle: { fontSize: 13, fontFamily: fonts.bold, textAlign: 'left' },
  section: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, marginTop: 8, textAlign: 'left' },
  addLink: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  addText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.primary },
  service: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceDate: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text, textAlign: 'left' },
  serviceCost: { fontSize: 16, fontFamily: fonts.bold, color: colors.primary },
  bar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  barButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  barSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  barText: { fontSize: 15, fontFamily: fonts.semibold, color: '#FFFFFF' },
});

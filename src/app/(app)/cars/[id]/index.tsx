import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

import { CarAvatar, ItemRow } from '@/components/maintenance';
import { Button, Muted, Screen, ScrollScreen, Section, Title, colors } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useCar, useItems, useServices, useUsers } from '@/lib/cars';
import { dueInfo, sortByUrgency } from '@/lib/maintenance';
import { formatEgp } from '@/lib/money';

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

  return (
    <ScrollScreen>
      <Stack.Screen
        options={{
          title: `${c.make} ${c.model}`,
          headerRight: isAdmin
            ? () => (
                <Text
                  style={{ color: colors.primary, fontSize: 16 }}
                  onPress={() => router.push({ pathname: '/cars/[id]/edit', params: { id } })}
                >
                  {t('car.edit')}
                </Text>
              )
            : undefined,
        }}
      />

      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <CarAvatar photo={c.photo} size={96} />
        <View style={{ flex: 1, gap: 4 }}>
          <Title>{`${c.make} ${c.model} ${c.year}`}</Title>
          <Muted>{c.plate}{c.color ? ` · ${c.color}` : ''}</Muted>
          <Muted>{t('car.km', { value: c.currentKm.toLocaleString() })}</Muted>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button
            title={t('service.log')}
            onPress={() => router.push({ pathname: '/cars/[id]/service', params: { id } })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={t('service.updateKm')}
            variant="secondary"
            onPress={() => router.push({ pathname: '/cars/[id]/service', params: { id, mode: 'km' } })}
          />
        </View>
      </View>

      <Section>{t('car.owner')}</Section>
      <Muted>{c.ownerName}</Muted>
      {!!c.ownerPhone && (
        <Text style={{ color: colors.primary }} onPress={() => Linking.openURL(`tel:${c.ownerPhone}`)}>
          {c.ownerPhone}
        </Text>
      )}
      {isAdmin && (
        <>
          <Section>{t('car.assignedTo')}</Section>
          <Muted>{assignedNames.length ? assignedNames.join('، ') : '—'}</Muted>
        </>
      )}

      <Section>{t('car.recommendedTitle')}</Section>
      {rows.map(({ item }) => (
        <ItemRow
          key={item.id}
          item={item}
          car={c}
          onPress={
            isAdmin
              ? () =>
                  router.push({ pathname: '/cars/[id]/items/[itemId]', params: { id, itemId: item.id } })
              : undefined
          }
        />
      ))}
      {isAdmin && (
        <Button
          title={t('item.new')}
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/cars/[id]/items/[itemId]', params: { id, itemId: 'new' } })
          }
        />
      )}

      <Section>{t('service.history')}</Section>
      {services.data.length === 0 && !services.loading && <Muted>{t('service.noHistory')}</Muted>}
      {services.data.map((s) => (
        <Pressable
          key={s.id}
          onPress={() =>
            router.push({ pathname: '/cars/[id]/services/[serviceId]', params: { id, serviceId: s.id } })
          }
          style={{
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            gap: 2,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              {new Date(s.date).toLocaleDateString(i18n.language)}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              {formatEgp(s.totalCost, i18n.language)}
            </Text>
          </View>
          <Muted>
            {`${t('car.km', { value: s.km.toLocaleString() })} · ${t('service.itemsCount', { count: s.items.length })}`}
          </Muted>
        </Pressable>
      ))}
    </ScrollScreen>
  );
}

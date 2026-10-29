import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Text, View } from 'react-native';

import { CarAvatar, ItemRow } from '@/components/maintenance';
import { Button, Muted, Screen, ScrollScreen, Section, Title, colors } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useCar, useItems, useUsers } from '@/lib/cars';
import { dueInfo, sortByUrgency } from '@/lib/maintenance';

export default function CarDetails() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const car = useCar(id);
  const items = useItems(id);
  const users = useUsers();

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
    </ScrollScreen>
  );
}

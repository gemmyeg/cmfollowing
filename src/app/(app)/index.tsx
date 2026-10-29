import { Link, router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CarAvatar, StatusBadge } from '@/components/maintenance';
import { Button, Muted, Screen, Title, colors } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useCars, useItemsForCars } from '@/lib/cars';
import { worstStatus } from '@/lib/dashboard';

export default function Home() {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const cars = useCars();
  const itemsByCar = useItemsForCars(cars.data.map((c) => c.id));

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/settings">
              <Text style={{ color: colors.primary, fontSize: 16 }}>{t('settings.title')}</Text>
            </Link>
          ),
        }}
      />
      <Title>{t('home.greeting', { name: user?.displayName ?? '' })}</Title>
      {isAdmin && (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button title={t('home.addCar')} onPress={() => router.push('/cars/new')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={t('dashboard.title')}
              variant="secondary"
              onPress={() => router.push('/dashboard')}
            />
          </View>
        </View>
      )}

      <FlatList
        data={cars.data}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        ListEmptyComponent={
          cars.loading ? (
            <Muted>{t('common.loading')}</Muted>
          ) : (
            <Muted>{t(isAdmin ? 'home.empty' : 'car.noneAssigned')}</Muted>
          )
        }
        renderItem={({ item: car }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/cars/[id]', params: { id: car.id } })}
          >
            <CarAvatar photo={car.photo} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.cardTitle}>{`${car.make} ${car.model} ${car.year}`}</Text>
              <Muted>{car.plate} · {car.ownerName}</Muted>
              <Muted>{t('car.km', { value: car.currentKm.toLocaleString() })}</Muted>
            </View>
            <StatusBadge status={worstStatus(car, itemsByCar[car.id] ?? [])} />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: colors.text, textAlign: 'left' },
});

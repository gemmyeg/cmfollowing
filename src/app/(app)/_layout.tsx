import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useCars, useItemsForCars } from '@/lib/cars';
import { listenForTaps, rescheduleReminders } from '@/lib/notifications';

export default function AppLayout() {
  const { t } = useTranslation();
  useMaintenanceReminders();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('home.title') }} />
      <Stack.Screen name="dashboard" options={{ title: t('dashboard.title') }} />
      <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      <Stack.Screen name="cars/new" options={{ title: t('car.new') }} />
      <Stack.Screen name="cars/[id]/index" options={{ title: t('car.details') }} />
      <Stack.Screen name="cars/[id]/edit" options={{ title: t('car.edit') }} />
      <Stack.Screen name="cars/[id]/items/[itemId]" options={{ title: t('item.edit') }} />
    </Stack>
  );
}

/** Keeps the scheduled reminders in step with the signed-in user's cars. */
function useMaintenanceReminders() {
  const { t, i18n } = useTranslation();
  const cars = useCars();
  const itemsByCar = useItemsForCars(cars.data.map((c) => c.id));

  useEffect(() => listenForTaps(), []);

  useEffect(() => {
    if (cars.loading) return;
    // Snapshots arrive in bursts; wait for them to settle before rescheduling.
    const timer = setTimeout(() => {
      rescheduleReminders(cars.data, itemsByCar, t).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [cars.data, itemsByCar, cars.loading, i18n.language]);
}

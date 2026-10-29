import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AppLayout() {
  const { t } = useTranslation();
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

import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { stackScreenOptions } from '@/components/ui';

export default function AuthLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={stackScreenOptions}>
      {/* The sign-in screen shows the app name as its own heading. */}
      <Stack.Screen name="sign-in" options={{ title: t('auth.signInTitle'), headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ title: t('auth.signUpTitle') }} />
    </Stack>
  );
}

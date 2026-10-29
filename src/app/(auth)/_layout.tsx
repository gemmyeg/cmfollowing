import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ title: t('auth.signInTitle') }} />
      <Stack.Screen name="sign-up" options={{ title: t('auth.signUpTitle') }} />
    </Stack>
  );
}

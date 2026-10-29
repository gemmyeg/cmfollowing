import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { Muted, Screen, Title, colors } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

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
      {/* Car list and "Add car" arrive in step 2. */}
      <Muted>{t('home.empty')}</Muted>
    </Screen>
  );
}

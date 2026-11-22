import {
  ReadexPro_400Regular,
  ReadexPro_500Medium,
  ReadexPro_600SemiBold,
  ReadexPro_700Bold,
  useFonts,
} from '@expo-google-fonts/readex-pro';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, View } from 'react-native';

import { colors } from '@/components/ui';
import { initI18n } from '@/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  // On a font error the app still starts, with the system font.
  const [fontsLoaded, fontError] = useFonts({
    ReadexPro_400Regular,
    ReadexPro_500Medium,
    ReadexPro_600SemiBold,
    ReadexPro_700Bold,
  });

  useEffect(() => {
    initI18n().finally(() => setReady(true));
  }, []);

  if (!ready || (!fontsLoaded && !fontError)) return <Splash />;

  return (
    <Direction>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootStack />
      </AuthProvider>
    </Direction>
  );
}

/**
 * In the browser, tells react-native-web the text direction so Arabic reads right to left.
 * On the phone the direction comes from I18nManager instead.
 */
function Direction({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  if (Platform.OS !== 'web') return <>{children}</>;
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  // `dir` is a react-native-web prop that React Native's types do not list.
  return <View style={{ flex: 1 }} {...({ dir } as object)}>{children}</View>;
}

function RootStack() {
  const { user, initializing } = useAuth();
  const { t } = useTranslation();

  if (initializing) return <Splash />;

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" options={{ headerShown: false, title: t('appName') }} />
      </Stack.Protected>
    </Stack>
  );
}

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { Button, Muted, Screen, Title } from '@/components/ui';
import { setLanguage, type Language } from '@/i18n';
import { useAuth } from '@/lib/auth';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();

  async function choose(lng: Language) {
    if (i18n.language === lng) return;
    const needsRestart = await setLanguage(lng);
    if (needsRestart) Alert.alert(t('settings.restartTitle'), t('settings.restartBody'));
  }

  return (
    <Screen>
      <Title>{t('settings.language')}</Title>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(['ar', 'en'] as const).map((lng) => (
          <View key={lng} style={{ flex: 1 }}>
            <Button
              title={t(lng === 'ar' ? 'settings.arabic' : 'settings.english')}
              variant={i18n.language === lng ? 'primary' : 'secondary'}
              onPress={() => choose(lng)}
            />
          </View>
        ))}
      </View>

      <Title>{t('settings.account')}</Title>
      <Muted>{user?.email}</Muted>
      <Button title={t('auth.signOut')} variant="secondary" onPress={signOut} />
    </Screen>
  );
}

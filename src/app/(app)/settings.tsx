import { reloadAppAsync } from 'expo';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Switch, Text, View } from 'react-native';

import { Button, Muted, Screen, Title, colors } from '@/components/ui';
import { setLanguage, type Language } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { notificationsEnabled, setNotificationsEnabled } from '@/lib/notifications';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [reminders, setReminders] = useState(true);

  useEffect(() => {
    notificationsEnabled().then(setReminders);
  }, []);

  async function choose(lng: Language) {
    if (i18n.language === lng) return;
    const needsRestart = await setLanguage(lng);
    // Right-to-left layout only switches after a reload.
    if (needsRestart) {
      Alert.alert(t('settings.restartTitle'), t('settings.restartBody'), [
        { text: 'OK', onPress: () => reloadAppAsync().catch(() => {}) },
      ]);
    }
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

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'left' }}>
          {t('settings.notifications')}
        </Text>
        <Switch
          value={reminders}
          onValueChange={async (on) => {
            setReminders(on);
            await setNotificationsEnabled(on);
          }}
        />
      </View>
      <Muted>{t('settings.notificationsHint')}</Muted>

      <Title>{t('settings.account')}</Title>
      <Muted>{user?.email}</Muted>
      <Button title={t('auth.signOut')} variant="secondary" onPress={signOut} />
    </Screen>
  );
}

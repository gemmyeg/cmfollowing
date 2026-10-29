import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { Button, colors, ErrorText, Field, Muted, Screen, Title } from '@/components/ui';
import { authErrorCode, authErrorKey, useAuth } from '@/lib/auth';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function SignIn() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured ? null : 'auth.firebaseMissing',
  );
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email || !password) return setError('auth.missingFields');
    setBusy(true);
    setError(null);
    setErrorCode(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(authErrorKey(e));
      setErrorCode(authErrorCode(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen>
        <Title>{t('appName')}</Title>
        <GoogleSignInButton onError={setError} />
        <Muted>{t('auth.or')}</Muted>
        <Field
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        {error && (
          <ErrorText>
            {t(error)}
            {error === 'common.error' && errorCode ? ` (${errorCode})` : ''}
          </ErrorText>
        )}
        <Button title={t('auth.signIn')} onPress={submit} loading={busy} />
        <Button title={t('auth.noAccount')} variant="link" onPress={() => router.push('/sign-up')} />
      </Screen>
    </SafeAreaView>
  );
}

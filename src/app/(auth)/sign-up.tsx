import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { authErrorCode, authErrorKey, useAuth } from '@/lib/auth';

export default function SignUp() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name || !email || !password) return setError('auth.missingFields');
    if (password.length < 6) return setError('auth.passwordTooShort');
    setBusy(true);
    setError(null);
    setErrorCode(null);
    try {
      await signUp(name, email, password);
    } catch (e) {
      setError(authErrorKey(e));
      setErrorCode(authErrorCode(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Field label={t('auth.name')} value={name} onChangeText={setName} autoComplete="name" />
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
        autoComplete="new-password"
      />
      {error && (
        <ErrorText>
          {t(error)}
          {error === 'common.error' && errorCode ? ` (${errorCode})` : ''}
        </ErrorText>
      )}
      <Button title={t('auth.signUp')} onPress={submit} loading={busy} />
      <Button title={t('auth.haveAccount')} variant="link" onPress={() => router.back()} />
    </Screen>
  );
}

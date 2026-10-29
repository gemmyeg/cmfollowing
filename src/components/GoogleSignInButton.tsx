import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { Button } from '@/components/ui';
import { authErrorKey, useAuth } from '@/lib/auth';

WebBrowser.maybeCompleteAuthSession();

const clientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};

const platformClientId = Platform.select({
  android: clientIds.androidClientId,
  ios: clientIds.iosClientId,
  default: clientIds.webClientId,
});

type Props = { onError: (key: string) => void };

/** "Continue with Gmail". The Google hook throws without a client id, so only mount it when set. */
export function GoogleSignInButton({ onError }: Props) {
  const { t } = useTranslation();
  if (!platformClientId) {
    return (
      <Button
        title={t('auth.continueWithGoogle')}
        variant="secondary"
        onPress={() => onError('auth.googleMissing')}
      />
    );
  }
  return <ConfiguredGoogleButton onError={onError} />;
}

function ConfiguredGoogleButton({ onError }: Props) {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    ...clientIds,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type !== 'success') {
      if (response) setBusy(false);
      return;
    }
    const idToken = response.params.id_token;
    signInWithGoogle(idToken)
      .catch((e) => onError(authErrorKey(e)))
      .finally(() => setBusy(false));
  }, [response]);

  return (
    <Button
      title={t('auth.continueWithGoogle')}
      variant="secondary"
      loading={busy || !request}
      onPress={() => {
        setBusy(true);
        promptAsync();
      }}
    />
  );
}

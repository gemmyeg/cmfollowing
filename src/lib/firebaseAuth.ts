import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

/** On the phone, keep the user signed in with AsyncStorage. The web build uses firebaseAuth.web.ts. */
export function createAuth(app: FirebaseApp) {
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

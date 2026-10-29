import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';

// Firebase web config for the vmfollowing project. It is not a secret: access is controlled by
// Firebase Auth and firestore.rules. EXPO_PUBLIC_FIREBASE_* in .env override it (e.g. for a test project).
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyDpg4NgityUpix8wQnWqcJse0_LOkkPZlU',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'vmfollowing.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'vmfollowing',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'vmfollowing.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '609067495642',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:609067495642:web:74385e813cf7e5dd6575e3',
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  const firstInit = getApps().length === 0;
  const app = firstInit ? initializeApp(config) : getApp();
  // initializeAuth may only be called once per app; fast refresh re-runs this module.
  auth = firstInit
    ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
    : getAuth(app);
  db = getFirestore(app);
}

export { auth, db };

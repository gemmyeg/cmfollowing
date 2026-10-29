import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, type Firestore } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import i18n from '@/i18n';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

type AuthState = {
  user: User | null;
  /** Firestore profile of the signed-in user, including their role. */
  profile: UserProfile | null;
  isAdmin: boolean;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  /** Signs in with the id token returned by Google (Gmail account). */
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function requireAuth() {
  if (!auth || !db) throw new Error('firebase-not-configured');
  return { auth, db };
}

async function ensureProfile(db: Firestore, user: User, name?: string) {
  const ref = doc(db, 'users', user.uid);
  if ((await getDoc(ref)).exists()) return;
  const profile: UserProfile = {
    uid: user.uid,
    // New accounts are always plain users; promote an admin from the Firebase console.
    role: 'user',
    name: (name ?? user.displayName ?? '').trim(),
    email: user.email ?? '',
    language: i18n.language === 'ar' ? 'ar' : 'en',
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(!auth);
  const [profileUid, setProfileUid] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setProfile(null);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    return onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setProfileUid(user.uid);
    });
  }, [user]);

  const value: AuthState = {
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    // Wait for the first profile snapshot so the role is known before routing.
    initializing: !authReady || (!!user && profileUid !== user.uid),
    async signIn(email, password) {
      await signInWithEmailAndPassword(requireAuth().auth, email.trim(), password);
    },
    async signUp(name, email, password) {
      const { auth, db } = requireAuth();
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await ensureProfile(db, cred.user, name);
    },
    async signInWithGoogle(idToken) {
      const { auth, db } = requireAuth();
      const cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
      await ensureProfile(db, cred.user);
    },
    async signOut() {
      await firebaseSignOut(requireAuth().auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** Maps Firebase error codes to translation keys. */
export function authErrorKey(error: unknown): string {
  const code = (error as { code?: string; message?: string })?.code;
  if ((error as Error)?.message === 'firebase-not-configured') return 'auth.firebaseMissing';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'auth.invalidCredentials';
    case 'auth/email-already-in-use':
      return 'auth.emailInUse';
    case 'auth/weak-password':
      return 'auth.passwordTooShort';
    default:
      return 'common.error';
  }
}

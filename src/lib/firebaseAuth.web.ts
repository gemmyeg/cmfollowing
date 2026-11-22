import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/** In the browser, Firebase keeps the user signed in by itself (IndexedDB). */
export function createAuth(app: FirebaseApp) {
  return getAuth(app);
}

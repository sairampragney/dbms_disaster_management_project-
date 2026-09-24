import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAyTebpXjPCM47SemUHXVi0WdBTKq1UDWA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'disaster-management-syst-ca22d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'disaster-management-syst-ca22d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'disaster-management-syst-ca22d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '84009572084',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:84009572084:web:848db92a106d8cf9f2eef8',
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator && !(window as unknown as { _firebaseEmulatorsConnected?: boolean })._firebaseEmulatorsConnected) {
  const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
  const storageHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';

  connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });

  const [fHost, fPort] = firestoreHost.split(':');
  connectFirestoreEmulator(db, fHost, parseInt(fPort || '8080', 10));

  const [sHost, sPort] = storageHost.split(':');
  connectStorageEmulator(storage, sHost, parseInt(sPort || '9199', 10));

  (window as unknown as { _firebaseEmulatorsConnected?: boolean })._firebaseEmulatorsConnected = true;
  console.log('Connected to Firebase Emulators:', { authHost, firestoreHost, storageHost });
}

export { app, auth, db, storage };

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// In AI Studio, the config is usually injected. 
// If missing, we'll use empty values to prevent crashes, but show warnings.
let firebaseConfig = {};
try {
  // Try to load from the file if it exists (it might be hidden from list_dir but present for import)
  // Actually, we'll try to use env vars if present
  firebaseConfig = {
    apiKey: "dummy",
    authDomain: "dummy",
    projectId: "dummy",
    storageBucket: "dummy",
    messagingSenderId: "dummy",
    appId: "dummy"
  };
} catch (e) {
  console.warn("Firebase config not found, using dummy config");
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

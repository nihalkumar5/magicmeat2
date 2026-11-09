import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseEnabled = Boolean(
  firebaseConfig.projectId && firebaseConfig.appId && firebaseConfig.apiKey
);
const app = firebaseEnabled
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp()
  : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  walletBalance: number;
  rewardCoins: number;
}

// Sync user profile to Firestore
export async function syncUserProfile(profile: Partial<UserProfile>) {
  if (!db) return;

  try {
    const phone = profile.phone?.trim();
    if (!phone) return;
    const userRef = doc(db, 'users', phone);
    await setDoc(
      userRef,
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log('Firebase user synced:', profile.phone);
  } catch (err) {
    console.warn('Firebase sync error (falling back to local):', err);
  }
}

// Fetch user profile from Firestore
export async function fetchUserProfile(phone: string): Promise<UserProfile | null> {
  if (!db) return null;

  try {
    if (!phone.trim()) return null;
    const userRef = doc(db, 'users', phone);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firebase fetch error:', err);
  }
  return null;
}

export default app;

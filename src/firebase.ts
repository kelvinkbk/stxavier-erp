// src/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from 'react-native';

// Import AsyncStorage conditionally
let AsyncStorage: any = null;
let getReactNativePersistence: any = null;

if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    getReactNativePersistence = require('firebase/auth').getReactNativePersistence;
  } catch (error) {
    console.log('AsyncStorage or persistence not available, using default auth');
  }
}

// Enhanced Firebase config - Authentication + Firestore (Still FREE tier)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-actual-api-key-here",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with persistence for React Native
export const auth = Platform.OS === 'web' || !AsyncStorage || !getReactNativePersistence
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

// Initialize Firestore for cross-device data sync
export const db = getFirestore(app);

// Note: Firestore has a generous free tier:
// - 50,000 reads per day
// - 20,000 writes per day
// - 20,000 deletes per day
// - 1 GB storage
// This is more than enough for an ERP system

export const storage = null;

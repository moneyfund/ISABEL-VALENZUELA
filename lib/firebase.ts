import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// These identifiers are public Firebase Web SDK configuration, NOT privileged service-account
// credentials. Authorization is enforced exclusively through Auth + Firestore/Storage rules.
// NEXT_PUBLIC_* overrides are supported for local projects and Vercel environments.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBJCaG2Au6TWNsZHvjqhI0mPpIY4Oo6Aqo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "isabelvalenzuela-52364.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "isabelvalenzuela-52364",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "isabelvalenzuela-52364.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "851950341234",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:851950341234:web:9b5ea782a7d5ade18e86eb",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4EP4Z6H9CH"
};

export const firebaseReady = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.storageBucket && config.appId
);
const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(config)) : null;

export const auth: Auth | null = app && typeof window !== "undefined" ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = app && typeof window !== "undefined" ? getStorage(app) : null;

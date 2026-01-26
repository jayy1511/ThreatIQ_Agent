/**
 * Firebase Configuration for Mobile
 * Reads from environment variables (EXPO_PUBLIC_*)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from "firebase/auth";

// Firebase config from environment variables
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBn3FVP55eHFhEqH4nJb6qrgdzTikU_CZA",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "threatiq-dc99e.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "threatiq-dc99e",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "threatiq-dc99e.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "229250264596",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:229250264596:web:a2880adc2e7a4f95e90101",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
    return firebaseSignOut(auth);
};

export const getIdToken = async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (user) {
        return user.getIdToken();
    }
    return null;
};

export { onAuthStateChanged, User };
export default app;

// Firebase Client Initialization
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence,
    Auth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;

// Initialize Firebase only once
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);

    // Use AsyncStorage for persistence in React Native
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} else {
    app = getApps()[0];
    auth = getAuth(app);
}

export { app, auth };

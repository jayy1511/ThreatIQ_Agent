// Configuration - Reads from environment variables
// Copy .env.example to .env and fill in your values

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

export const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate config at runtime
export function validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!API_BASE_URL) {
        errors.push('EXPO_PUBLIC_API_BASE_URL is not set');
    }

    if (!firebaseConfig.apiKey) {
        errors.push('EXPO_PUBLIC_FIREBASE_API_KEY is not set');
    }

    if (!firebaseConfig.projectId) {
        errors.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID is not set');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

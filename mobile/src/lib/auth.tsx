// Authentication Context and Hooks
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    signUp: (email: string, password: string) => Promise<UserCredential>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string): Promise<UserCredential> => {
        setError(null);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result;
        } catch (err: any) {
            const message = getErrorMessage(err.code);
            setError(message);
            throw err;
        }
    };

    const signUp = async (email: string, password: string): Promise<UserCredential> => {
        setError(null);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return result;
        } catch (err: any) {
            const message = getErrorMessage(err.code);
            setError(message);
            throw err;
        }
    };

    const signOut = async (): Promise<void> => {
        setError(null);
        try {
            await firebaseSignOut(auth);
        } catch (err: any) {
            const message = getErrorMessage(err.code);
            setError(message);
            throw err;
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, clearError }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Convert Firebase error codes to user-friendly messages
function getErrorMessage(code: string): string {
    switch (code) {
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/user-disabled':
            return 'This account has been disabled';
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/invalid-credential':
            return 'Invalid email or password';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection';
        default:
            return 'An error occurred. Please try again';
    }
}

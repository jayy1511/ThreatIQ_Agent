// Register Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/lib/auth';
import { Button, Input } from '../../src/components';
import { colors, spacing, fontSize } from '../../src/theme/colors';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signUp, error, clearError } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        setLocalError(null);
        clearError();

        if (!email.trim()) {
            setLocalError('Email is required');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await signUp(email.trim(), password);
            router.replace('/(tabs)/dashboard');
        } catch (err) {
            // Error is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    const displayError = localError || error;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.logo}>🛡️</Text>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join ThreatIQ to stay protected</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setLocalError(null);
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Input
                            label="Password"
                            placeholder="Create a password (min. 6 characters)"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setLocalError(null);
                            }}
                            secureTextEntry
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setLocalError(null);
                            }}
                            secureTextEntry
                        />

                        {displayError && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{displayError}</Text>
                            </View>
                        )}

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={!email.trim() || !password || !confirmPassword}
                            fullWidth
                            size="lg"
                            style={styles.button}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Text style={styles.link}>Sign In</Text>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logo: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        textAlign: 'center',
    },
    form: {
        marginBottom: spacing.xl,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.sm,
        textAlign: 'center',
    },
    button: {
        marginTop: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: colors.textMuted,
        fontSize: fontSize.md,
    },
    link: {
        color: colors.accent,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});

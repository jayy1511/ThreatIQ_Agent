// Login Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/lib/auth';
import { Button, Input } from '../../src/components';
import { colors, spacing, fontSize } from '../../src/theme/colors';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, error, clearError } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            return;
        }

        setLoading(true);
        clearError();

        try {
            await signIn(email.trim(), password);
            router.replace('/(tabs)/dashboard');
        } catch (err) {
            // Error is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <Text style={styles.logo}>🛡️</Text>
                    <Text style={styles.title}>ThreatIQ</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={!email.trim() || !password}
                        fullWidth
                        size="lg"
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Link href="/(auth)/register" asChild>
                        <Text style={styles.link}>Sign Up</Text>
                    </Link>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
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

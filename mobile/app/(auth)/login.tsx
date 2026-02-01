// Login Screen - Matches Web UI design
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '../../src/components';
import { useAuth } from '../../src/lib/auth';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) return;

        const success = await signIn(email, password);
        if (success) {
            router.replace('/(tabs)/dashboard');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Logo/Branding Area */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoEmoji}>🛡️</Text>
                        </View>
                        <Text style={styles.title}>ThreatIQ</Text>
                        <Text style={styles.subtitle}>
                            AI-Powered Phishing Detection
                        </Text>
                    </View>

                    {/* Login Card */}
                    <Card style={styles.loginCard}>
                        <Text style={styles.cardTitle}>Welcome Back</Text>
                        <Text style={styles.cardSubtitle}>
                            Sign in to continue learning
                        </Text>

                        {/* Error Message */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Form Fields */}
                        <Input
                            label="Email"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                        />

                        {/* Login Button */}
                        <Button
                            title={loading ? "Signing in..." : "Sign In"}
                            onPress={handleLogin}
                            fullWidth
                            loading={loading}
                            disabled={!email || !password}
                            style={styles.loginButton}
                        />

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Register Link */}
                        <TouchableOpacity
                            onPress={() => router.push('/(auth)/register')}
                            style={styles.registerLink}
                        >
                            <Text style={styles.registerText}>
                                Don't have an account? <Text style={styles.registerTextBold}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </Card>

                    {/* Footer */}
                    <Text style={styles.footer}>
                        Powered by AI • Your data is secure
                    </Text>
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
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    logoEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: fontSize.hero,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        textAlign: 'center',
    },
    loginCard: {
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    cardTitle: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    cardSubtitle: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    errorContainer: {
        backgroundColor: colors.errorBg,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.sm,
        textAlign: 'center',
    },
    loginButton: {
        marginTop: spacing.md,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.cardBorder,
    },
    dividerText: {
        color: colors.textMuted,
        paddingHorizontal: spacing.md,
        fontSize: fontSize.sm,
    },
    registerLink: {
        alignItems: 'center',
        padding: spacing.sm,
    },
    registerText: {
        color: colors.textMuted,
        fontSize: fontSize.md,
    },
    registerTextBold: {
        color: colors.primary,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        color: colors.textDim,
        fontSize: fontSize.sm,
        marginTop: spacing.xl,
    },
});

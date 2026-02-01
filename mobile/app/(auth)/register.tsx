// Register Screen - Matches Web UI
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '../../src/components';
import { useAuth } from '../../src/lib/auth';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function RegisterScreen() {
    const router = useRouter();
    const { signUp, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleRegister = async () => {
        setLocalError(null);

        if (!email || !password || !confirmPassword) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        const success = await signUp(email, password);
        if (success) {
            router.replace('/(tabs)/dashboard');
        }
    };

    const displayError = localError || error;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoEmoji}>🛡️</Text>
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Start your security training today
                        </Text>
                    </View>

                    {/* Register Card */}
                    <Card style={styles.registerCard}>
                        {/* Error Message */}
                        {displayError && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{displayError}</Text>
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
                            placeholder="Create a password (min 6 chars)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="new-password"
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        {/* Register Button */}
                        <Button
                            title={loading ? "Creating account..." : "Create Account"}
                            onPress={handleRegister}
                            fullWidth
                            loading={loading}
                            disabled={!email || !password || !confirmPassword}
                            style={styles.registerButton}
                        />

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Login Link */}
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.loginLink}
                        >
                            <Text style={styles.loginText}>
                                Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </Card>
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
    registerCard: {
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
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
    registerButton: {
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
    loginLink: {
        alignItems: 'center',
        padding: spacing.sm,
    },
    loginText: {
        color: colors.textMuted,
        fontSize: fontSize.md,
    },
    loginTextBold: {
        color: colors.primary,
        fontWeight: '600',
    },
});

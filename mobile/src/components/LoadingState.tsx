// Loading State Component
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme/colors';
import { Button } from './Button';

interface LoadingStateProps {
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    children: React.ReactNode;
}

export function LoadingState({ loading, error, onRetry, children }: LoadingStateProps) {
    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                {onRetry && (
                    <Button
                        title="Try Again"
                        onPress={onRetry}
                        variant="outline"
                        size="sm"
                        style={styles.retryButton}
                    />
                )}
            </View>
        );
    }

    return <>{children}</>;
}

// Standalone loading spinner
export function LoadingSpinner({ size = 'large' }: { size?: 'small' | 'large' }) {
    return (
        <View style={styles.spinner}>
            <ActivityIndicator size={size} color={colors.accent} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    text: {
        color: colors.textMuted,
        fontSize: fontSize.md,
        marginTop: spacing.md,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.md,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    retryButton: {
        marginTop: spacing.sm,
    },
    spinner: {
        padding: spacing.md,
        alignItems: 'center',
    },
});

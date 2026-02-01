// Card Component - Matches Web UI
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'accent';
    onPress?: () => void;
}

export function Card({ children, style, variant = 'default', onPress }: CardProps) {
    const cardStyle = [
        styles.card,
        variant === 'accent' && styles.cardAccent,
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: spacing.md,
    },
    cardAccent: {
        backgroundColor: colors.primary + '10',
        borderColor: colors.primary + '30',
    },
});

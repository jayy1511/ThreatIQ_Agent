// Card Component
import React, { ReactNode } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';

interface CardProps {
    children: ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    variant?: 'default' | 'accent';
}

export function Card({ children, onPress, style, variant = 'default' }: CardProps) {
    const cardStyles = [
        styles.card,
        variant === 'accent' && styles.accent,
        style,
    ];

    if (onPress) {
        return (
            <Pressable
                style={({ pressed }) => [
                    ...cardStyles,
                    pressed && styles.pressed,
                ]}
                onPress={onPress}
            >
                {children}
            </Pressable>
        );
    }

    return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    accent: {
        borderColor: colors.accent,
        borderWidth: 1,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});

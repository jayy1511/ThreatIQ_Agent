// Tag/Chip Component
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

interface TagProps {
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

export function Tag({ label, variant = 'default', size = 'md', style }: TagProps) {
    return (
        <View style={[styles.tag, styles[variant], styles[`size_${size}`], style]}>
            <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    tag: {
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },

    // Sizes
    size_sm: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
    },
    size_md: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    // Variants
    default: {
        backgroundColor: colors.inputBackground,
    },
    success: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    error: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    accent: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
    },

    // Text
    text: {
        fontWeight: '500',
    },
    text_default: {
        color: colors.textMuted,
    },
    text_success: {
        color: colors.success,
    },
    text_warning: {
        color: colors.warning,
    },
    text_error: {
        color: colors.error,
    },
    text_accent: {
        color: colors.accent,
    },

    // Text sizes
    textSize_sm: {
        fontSize: fontSize.xs,
    },
    textSize_md: {
        fontSize: fontSize.sm,
    },
});

// Tag Component - Matches Web UI chips
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

interface TagProps {
    label: string;
    variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

export function Tag({ label, variant = 'default', size = 'md', style }: TagProps) {
    return (
        <View style={[styles.tag, styles[variant], styles[`size_${size}`], style]}>
            <Text style={[styles.text, styles[`${variant}Text`], styles[`size_${size}_text`]]}>
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
        paddingVertical: 2,
    },
    size_md: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    // Variants
    default: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    accent: {
        backgroundColor: colors.primary + '20',
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
    success: {
        backgroundColor: colors.successBg,
        borderWidth: 1,
        borderColor: colors.success + '40',
    },
    warning: {
        backgroundColor: colors.warningBg,
        borderWidth: 1,
        borderColor: colors.warning + '40',
    },
    error: {
        backgroundColor: colors.errorBg,
        borderWidth: 1,
        borderColor: colors.error + '40',
    },

    // Text
    text: {
        fontWeight: '500',
    },
    defaultText: {
        color: colors.textMuted,
    },
    accentText: {
        color: colors.primary,
    },
    successText: {
        color: colors.success,
    },
    warningText: {
        color: colors.warning,
    },
    errorText: {
        color: colors.error,
    },

    // Text sizes
    size_sm_text: {
        fontSize: fontSize.xs,
    },
    size_md_text: {
        fontSize: fontSize.sm,
    },
});

// Button Component
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
    textStyle,
    fullWidth = false,
}: ButtonProps) {
    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`textSize_${size}`],
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.white : colors.accent}
                    size="small"
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },

    // Variants
    primary: {
        backgroundColor: colors.accent,
    },
    secondary: {
        backgroundColor: colors.inputBackground,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.accent,
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    // Sizes
    size_sm: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        minHeight: 32,
    },
    size_md: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minHeight: 44,
    },
    size_lg: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 52,
    },

    // Text
    text: {
        fontWeight: '600',
    },
    text_primary: {
        color: colors.white,
    },
    text_secondary: {
        color: colors.text,
    },
    text_outline: {
        color: colors.accent,
    },
    text_ghost: {
        color: colors.accent,
    },

    // Text sizes
    textSize_sm: {
        fontSize: fontSize.sm,
    },
    textSize_md: {
        fontSize: fontSize.md,
    },
    textSize_lg: {
        fontSize: fontSize.lg,
    },
});

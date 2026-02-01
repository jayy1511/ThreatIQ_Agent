// Button Component - Matches Web UI purple buttons
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    style,
    textStyle,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                styles[`size_${size}`],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' ? colors.white : colors.primary}
                />
            ) : (
                <Text
                    style={[
                        styles.text,
                        styles[`${variant}Text`],
                        styles[`size_${size}_text`],
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        gap: spacing.sm,
    },

    // Variants
    primary: {
        backgroundColor: colors.primary,
        borderWidth: 0,
    },
    secondary: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },

    // Sizes
    size_sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    size_md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    size_lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },

    // States
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },

    // Text styles
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.text,
    },
    outlineText: {
        color: colors.primary,
    },
    ghostText: {
        color: colors.primary,
    },

    // Text sizes
    size_sm_text: {
        fontSize: fontSize.sm,
    },
    size_md_text: {
        fontSize: fontSize.md,
    },
    size_lg_text: {
        fontSize: fontSize.lg,
    },
});

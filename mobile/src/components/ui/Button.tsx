/**
 * Button Component
 * Matches shadcn Button styling for mobile
 */

import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
} from "react-native";
import { Colors, BorderRadius, Spacing, FontSizes } from "../../config";

interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg";
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export function Button({
    children,
    onPress,
    variant = "default",
    size = "default",
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon,
}: ButtonProps) {
    const variantStyles = getVariantStyles(variant, disabled);
    const sizeStyles = getSizeStyles(size);

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                variantStyles.container,
                sizeStyles.container,
                style,
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variantStyles.text.color}
                />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
                        {children}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

function getVariantStyles(variant: string, disabled: boolean) {
    const opacity = disabled ? 0.5 : 1;

    const variants: Record<string, { container: ViewStyle; text: TextStyle }> = {
        default: {
            container: {
                backgroundColor: Colors.primary,
                opacity,
            },
            text: {
                color: Colors.primaryForeground,
            },
        },
        secondary: {
            container: {
                backgroundColor: Colors.secondary,
                opacity,
            },
            text: {
                color: Colors.secondaryForeground,
            },
        },
        outline: {
            container: {
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: Colors.border,
                opacity,
            },
            text: {
                color: Colors.foreground,
            },
        },
        ghost: {
            container: {
                backgroundColor: "transparent",
                opacity,
            },
            text: {
                color: Colors.foreground,
            },
        },
        destructive: {
            container: {
                backgroundColor: Colors.destructive,
                opacity,
            },
            text: {
                color: Colors.destructiveForeground,
            },
        },
    };

    return variants[variant] || variants.default;
}

function getSizeStyles(size: string) {
    const sizes: Record<string, { container: ViewStyle; text: TextStyle }> = {
        sm: {
            container: {
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.md,
            },
            text: {
                fontSize: FontSizes.sm,
            },
        },
        default: {
            container: {
                paddingVertical: Spacing.md,
                paddingHorizontal: Spacing.lg,
            },
            text: {
                fontSize: FontSizes.base,
            },
        },
        lg: {
            container: {
                paddingVertical: Spacing.lg,
                paddingHorizontal: Spacing.xl,
            },
            text: {
                fontSize: FontSizes.lg,
            },
        },
    };

    return sizes[size] || sizes.default;
}

const styles = StyleSheet.create({
    button: {
        borderRadius: BorderRadius.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.sm,
    },
    text: {
        fontWeight: "600",
        textAlign: "center",
    },
});

/**
 * Button Component - Matches shadcn/ui Button exactly
 * Primary color is BLACK in light theme!
 */

import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
} from "react-native";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme";

interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
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
    fullWidth = false,
}: ButtonProps) {
    const containerStyles = [
        styles.base,
        variantStyles[variant].container,
        sizeStyles[size].container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        variantStyles[variant].text,
        sizeStyles[size].text,
        textStyle,
    ];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={containerStyles}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variantStyles[variant].text.color}
                />
            ) : typeof children === "string" ? (
                <Text style={textStyles}>{children}</Text>
            ) : (
                <View style={styles.content}>{children}</View>
            )}
        </TouchableOpacity>
    );
}

// PRIMARY IS BLACK (#171717) - matching web!
const variantStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    default: {
        container: {
            backgroundColor: colors.primary,  // BLACK
        },
        text: {
            color: colors.primaryForeground,  // WHITE
        },
    },
    secondary: {
        container: {
            backgroundColor: colors.secondary,
        },
        text: {
            color: colors.secondaryForeground,
        },
    },
    outline: {
        container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.border,
        },
        text: {
            color: colors.foreground,
        },
    },
    ghost: {
        container: {
            backgroundColor: "transparent",
        },
        text: {
            color: colors.foreground,
        },
    },
    destructive: {
        container: {
            backgroundColor: colors.destructive,
        },
        text: {
            color: colors.destructiveForeground,
        },
    },
    link: {
        container: {
            backgroundColor: "transparent",
            paddingHorizontal: 0,
            paddingVertical: 0,
        },
        text: {
            color: colors.foreground,
            textDecorationLine: "underline",
        },
    },
};

const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    default: {
        container: {
            paddingVertical: spacing[2.5],
            paddingHorizontal: spacing[4],
            height: 40,
        },
        text: {
            fontSize: fontSize.sm,
        },
    },
    sm: {
        container: {
            paddingVertical: spacing[2],
            paddingHorizontal: spacing[3],
            height: 36,
        },
        text: {
            fontSize: fontSize.sm,
        },
    },
    lg: {
        container: {
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[6],
            height: 44,
        },
        text: {
            fontSize: fontSize.base,
        },
    },
    icon: {
        container: {
            padding: spacing[2],
            height: 40,
            width: 40,
        },
        text: {
            fontSize: fontSize.sm,
        },
    },
};

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontWeight: fontWeight.medium,
        textAlign: "center",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[2],
    },
    fullWidth: {
        width: "100%",
    },
    disabled: {
        opacity: 0.5,
    },
});

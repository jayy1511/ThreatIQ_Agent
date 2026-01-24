/**
 * Card Component
 * Matches shadcn Card styling for mobile
 */

import React from "react";
import { View, StyleSheet, ViewProps, ViewStyle } from "react-native";
import { Colors, BorderRadius, Spacing } from "../../config";

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: "default" | "outline" | "elevated" | "primary";
    style?: ViewStyle;
}

export function Card({ children, variant = "default", style, ...props }: CardProps) {
    const variantStyles: ViewStyle = {
        default: {
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        outline: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: Colors.border,
        },
        elevated: {
            backgroundColor: Colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        primary: {
            backgroundColor: Colors.card,
            borderWidth: 2,
            borderColor: `${Colors.primary}33`, // 20% opacity
        },
    }[variant];

    return (
        <View style={[styles.card, variantStyles, style]} {...props}>
            {children}
        </View>
    );
}

interface CardHeaderProps extends ViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
    return (
        <View style={[styles.cardHeader, style]} {...props}>
            {children}
        </View>
    );
}

interface CardContentProps extends ViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardContent({ children, style, ...props }: CardContentProps) {
    return (
        <View style={[styles.cardContent, style]} {...props}>
            {children}
        </View>
    );
}

interface CardTitleProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardTitle({ children, style }: CardTitleProps) {
    const textStyle = {
        fontSize: 16,
        fontWeight: "600" as const,
        color: Colors.foreground,
    };

    return (
        <View style={style}>
            {typeof children === "string" ? (
                <View><Text style={textStyle}>{children}</Text></View>
            ) : (
                children
            )}
        </View>
    );
}

import { Text } from "react-native";

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.lg,
        overflow: "hidden",
    },
    cardHeader: {
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    cardContent: {
        padding: Spacing.lg,
        paddingTop: 0,
    },
});

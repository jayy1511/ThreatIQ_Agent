/**
 * Card Component - Matches shadcn/ui Card exactly
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme";

interface CardProps {
    children: React.ReactNode;
    variant?: "default" | "primary" | "bordered";
    style?: ViewStyle;
}

export function Card({ children, variant = "default", style }: CardProps) {
    const variantStyle = {
        default: styles.cardDefault,
        primary: styles.cardPrimary,
        bordered: styles.cardBordered,
    }[variant];

    return <View style={[styles.card, variantStyle, style]}>{children}</View>;
}

interface CardHeaderProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
    return <View style={[styles.cardHeader, style]}>{children}</View>;
}

interface CardContentProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
    return <View style={[styles.cardContent, style]}>{children}</View>;
}

interface CardTitleProps {
    children: React.ReactNode;
    style?: TextStyle;
}

export function CardTitle({ children, style }: CardTitleProps) {
    if (typeof children === "string") {
        return <Text style={[styles.cardTitle, style]}>{children}</Text>;
    }
    return <View style={[styles.cardTitleRow, style as ViewStyle]}>{children}</View>;
}

interface CardDescriptionProps {
    children: React.ReactNode;
    style?: TextStyle;
}

export function CardDescription({ children, style }: CardDescriptionProps) {
    return <Text style={[styles.cardDescription, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        overflow: "hidden",
    },
    cardDefault: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardPrimary: {
        borderWidth: 2,
        borderColor: "rgba(37, 99, 235, 0.2)",
        backgroundColor: colors.card,
    },
    cardBordered: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        padding: spacing[4],
        paddingBottom: spacing[2],
    },
    cardContent: {
        padding: spacing[4],
        paddingTop: 0,
    },
    cardTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
    },
    cardTitleRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardDescription: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        marginTop: spacing[1],
        lineHeight: fontSize.sm * 1.5,
    },
});

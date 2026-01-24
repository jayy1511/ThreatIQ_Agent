/**
 * StatPill Component
 * Small pill/badge for stats display
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors, BorderRadius, Spacing, FontSizes } from "../../config";

interface StatPillProps {
    label: string;
    value: string | number;
    color?: "default" | "primary" | "success" | "warning" | "orange" | "purple" | "blue";
    style?: ViewStyle;
}

export function StatPill({ label, value, color = "default", style }: StatPillProps) {
    const colorStyles = getColorStyles(color);

    return (
        <View style={[styles.container, colorStyles.container, style]}>
            <Text style={[styles.value, colorStyles.text]}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

function getColorStyles(color: string) {
    const colors: Record<string, { container: ViewStyle; text: { color: string } }> = {
        default: {
            container: { backgroundColor: Colors.muted },
            text: { color: Colors.foreground },
        },
        primary: {
            container: { backgroundColor: `${Colors.primary}15` },
            text: { color: Colors.primary },
        },
        success: {
            container: { backgroundColor: `${Colors.success}15` },
            text: { color: Colors.success },
        },
        warning: {
            container: { backgroundColor: `${Colors.warning}15` },
            text: { color: Colors.warning },
        },
        orange: {
            container: { backgroundColor: `${Colors.orange}15` },
            text: { color: Colors.orange },
        },
        purple: {
            container: { backgroundColor: `${Colors.purple}15` },
            text: { color: Colors.purple },
        },
        blue: {
            container: { backgroundColor: `${Colors.blue}15` },
            text: { color: Colors.blue },
        },
    };

    return colors[color] || colors.default;
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: "center",
        minWidth: 80,
    },
    value: {
        fontSize: FontSizes.xl,
        fontWeight: "700",
    },
    label: {
        fontSize: FontSizes.xs,
        color: Colors.mutedForeground,
        marginTop: Spacing.xs,
    },
});

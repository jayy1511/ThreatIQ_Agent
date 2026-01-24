/**
 * SectionHeader Component
 * For section titles with optional subtitle
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors, Spacing, FontSizes } from "../../config";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    style?: ViewStyle;
    rightElement?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, style, rightElement }: SectionHeaderProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {rightElement && <View>{rightElement}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: "600",
        color: Colors.foreground,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
        marginTop: Spacing.xs,
    },
});

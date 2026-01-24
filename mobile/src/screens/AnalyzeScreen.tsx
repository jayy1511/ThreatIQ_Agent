/**
 * Analyze Screen
 * Placeholder for message analysis feature
 */

import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSizes } from "../config";

export default function AnalyzeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="search" size={64} color={Colors.mutedForeground} />
                <Text style={styles.title}>Analyze Messages</Text>
                <Text style={styles.subtitle}>
                    Paste a suspicious message to check if it's phishing.
                </Text>
                <Text style={styles.comingSoon}>Coming in Part 2</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: "600",
        color: Colors.foreground,
        marginTop: Spacing.lg,
    },
    subtitle: {
        fontSize: FontSizes.base,
        color: Colors.mutedForeground,
        textAlign: "center",
        marginTop: Spacing.sm,
        maxWidth: 280,
    },
    comingSoon: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        marginTop: Spacing.xl,
        fontWeight: "500",
    },
});

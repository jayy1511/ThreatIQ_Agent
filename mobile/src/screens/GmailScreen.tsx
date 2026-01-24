/**
 * Gmail Screen
 * Placeholder for Gmail integration feature
 */

import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSizes } from "../config";

export default function GmailScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="mail" size={64} color={Colors.destructive} />
                <Text style={styles.title}>Gmail Integration</Text>
                <Text style={styles.subtitle}>
                    Connect your Gmail to scan for phishing threats in your inbox.
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

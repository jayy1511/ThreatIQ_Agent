/**
 * Analyze Screen - Matches web mobile layout
 */

import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from "../components/ui";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";

export default function AnalyzeScreen() {
    const [message, setMessage] = useState("");
    const [userGuess, setUserGuess] = useState<"phishing" | "safe" | null>(null);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Threat Analysis</Text>
                    <Text style={styles.subtitle}>
                        Analyze suspicious messages with our multi-agent AI system.
                    </Text>
                </View>

                {/* Message Input Card */}
                <Card style={styles.inputCard}>
                    <CardHeader>
                        <CardTitle>Message Input</CardTitle>
                        <CardDescription>Paste the content you want to analyze.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Paste email body, SMS, or social media message..."
                            placeholderTextColor={colors.mutedForeground}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            textAlignVertical="top"
                        />
                    </CardContent>
                </Card>

                {/* Guess Selector */}
                <Card style={styles.guessCard}>
                    <CardContent style={styles.guessContent}>
                        <Text style={styles.guessLabel}>What do you think this message is?</Text>
                        <View style={styles.guessButtons}>
                            <Button
                                variant={userGuess === "phishing" ? "destructive" : "outline"}
                                style={styles.guessButton}
                                onPress={() => setUserGuess("phishing")}
                            >
                                <Ionicons
                                    name="warning"
                                    size={16}
                                    color={userGuess === "phishing" ? colors.destructiveForeground : colors.foreground}
                                />
                                <Text style={userGuess === "phishing" ? styles.guessTextActive : styles.guessText}>
                                    Phishing
                                </Text>
                            </Button>
                            <Button
                                variant={userGuess === "safe" ? "default" : "outline"}
                                style={[
                                    styles.guessButton,
                                    userGuess === "safe" && { backgroundColor: colors.success }
                                ]}
                                onPress={() => setUserGuess("safe")}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={userGuess === "safe" ? colors.primaryForeground : colors.foreground}
                                />
                                <Text style={userGuess === "safe" ? styles.guessTextActive : styles.guessText}>
                                    Safe
                                </Text>
                            </Button>
                        </View>

                        <View style={styles.analyzeButtons}>
                            <Button
                                style={styles.analyzeButton}
                                disabled={!message.trim() || !userGuess}
                            >
                                <Text style={styles.buttonText}>Analyze with My Prediction</Text>
                            </Button>
                            <Button variant="ghost" disabled={!message.trim()}>
                                <Text style={styles.skipText}>Skip</Text>
                            </Button>
                        </View>
                    </CardContent>
                </Card>

                {/* Tips Card */}
                <Card style={styles.tipsCard}>
                    <CardHeader style={styles.tipsHeader}>
                        <CardTitle style={styles.tipsTitle}>Analysis Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Text style={styles.tipText}>• Include the full message body.</Text>
                        <Text style={styles.tipText}>• Include headers if possible.</Text>
                        <Text style={styles.tipText}>• Don't click links before analyzing.</Text>
                    </CardContent>
                </Card>

                {/* Results Placeholder */}
                <View style={styles.resultsPlaceholder}>
                    <Ionicons name="shield" size={48} color={colors.mutedForeground} style={{ opacity: 0.3 }} />
                    <Text style={styles.placeholderText}>
                        Enter a message to see the analysis results here.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing[4],
        paddingBottom: spacing[10],
    },
    header: {
        marginBottom: spacing[6],
    },
    title: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
        marginTop: spacing[2],
        lineHeight: fontSize.base * 1.5,
    },
    inputCard: {
        marginBottom: spacing[4],
    },
    textInput: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[3],
        minHeight: 150,
        fontSize: fontSize.sm,
        fontFamily: "monospace",
        color: colors.foreground,
    },
    guessCard: {
        marginBottom: spacing[4],
    },
    guessContent: {
        paddingTop: spacing[4],
    },
    guessLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        textAlign: "center",
        marginBottom: spacing[3],
        color: colors.foreground,
    },
    guessButtons: {
        flexDirection: "row",
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    guessButton: {
        flex: 1,
    },
    guessText: {
        fontSize: fontSize.sm,
        color: colors.foreground,
        marginLeft: spacing[2],
    },
    guessTextActive: {
        fontSize: fontSize.sm,
        color: colors.primaryForeground,
        marginLeft: spacing[2],
    },
    analyzeButtons: {
        gap: spacing[2],
    },
    analyzeButton: {
        width: "100%",
    },
    buttonText: {
        color: colors.primaryForeground,
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
    },
    skipText: {
        color: colors.mutedForeground,
        fontSize: fontSize.sm,
    },
    tipsCard: {
        marginBottom: spacing[6],
    },
    tipsHeader: {
        paddingBottom: spacing[1],
    },
    tipsTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    tipText: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        marginBottom: spacing[2],
        lineHeight: fontSize.sm * 1.5,
    },
    resultsPlaceholder: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing[10],
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
    },
    placeholderText: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
        textAlign: "center",
        marginTop: spacing[4],
    },
});

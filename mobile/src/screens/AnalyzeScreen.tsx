/**
 * Analyze Screen - With real API integration
 */

import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from "../components/ui";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";
import { useAuth } from "../context/AuthContext";
import { analyzeMessage, analyzePublicMessage } from "../lib/api";

interface AnalysisResult {
    classification: {
        label: string;
        confidence: number;
        explanation: string;
        reason_tags: string[];
    };
    coach_response: {
        explanation: string;
        tips: string[];
        similar_examples: any[];
        quiz?: {
            question: string;
            options: string[];
            correct_answer: string;
        };
    };
}

export default function AnalyzeScreen() {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [userGuess, setUserGuess] = useState<"phishing" | "safe" | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (skipGuess: boolean = false) => {
        if (!message.trim()) return;
        if (loading) return;

        setError(null);
        setLoading(true);

        const guessToSend = skipGuess ? "unclear" : userGuess || "unclear";
        const userId = user?.uid || "anonymous";

        try {
            let data;
            try {
                data = await analyzeMessage(message, guessToSend, userId);
            } catch (err: any) {
                // Fallback to public endpoint if auth fails
                if (err.message?.includes("401") || err.message?.includes("403")) {
                    console.warn("[Analyze] Falling back to public endpoint");
                    data = await analyzePublicMessage(message, guessToSend, userId);
                } else {
                    throw err;
                }
            }
            setResult(data);
        } catch (err: any) {
            console.error("[Analyze] Error:", err);
            setError(err.message || "Analysis failed. Please try again.");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const getVerdictColor = (label: string) => {
        if (label === "phishing") return colors.destructive;
        if (label === "safe") return colors.success;
        return colors.warning;
    };

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

                {/* Error Alert */}
                {error && (
                    <View style={styles.errorAlert}>
                        <Ionicons name="alert-circle" size={20} color={colors.destructive} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

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
                                disabled={loading}
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
                                disabled={loading}
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
                                fullWidth
                                onPress={() => handleAnalyze(false)}
                                disabled={loading || !message.trim() || !userGuess}
                                loading={loading}
                            >
                                {loading ? "Analyzing..." : "Analyze with My Prediction"}
                            </Button>
                            <Button
                                variant="ghost"
                                onPress={() => handleAnalyze(true)}
                                disabled={loading || !message.trim()}
                            >
                                <Text style={styles.skipText}>Skip</Text>
                            </Button>
                        </View>
                    </CardContent>
                </Card>

                {/* Results */}
                {result ? (
                    <View style={styles.results}>
                        {/* Verdict Card */}
                        <Card style={[styles.verdictCard, { borderLeftColor: getVerdictColor(result.classification.label) }]}>
                            <CardHeader>
                                <View style={styles.verdictHeader}>
                                    <Ionicons
                                        name={result.classification.label === "phishing" ? "shield" : result.classification.label === "safe" ? "checkmark-circle" : "warning"}
                                        size={32}
                                        color={getVerdictColor(result.classification.label)}
                                    />
                                    <View style={styles.verdictInfo}>
                                        <Text style={[styles.verdictLabel, { color: getVerdictColor(result.classification.label) }]}>
                                            {result.classification.label.toUpperCase()}
                                        </Text>
                                        <Text style={styles.confidenceText}>
                                            Confidence: {Math.round(result.classification.confidence * 100)}%
                                        </Text>
                                    </View>
                                </View>
                            </CardHeader>
                            <CardContent>
                                <Text style={styles.explanationText}>{result.classification.explanation}</Text>

                                {/* Tags */}
                                <View style={styles.tagsRow}>
                                    {result.classification.reason_tags.map((tag, i) => (
                                        <View key={i} style={styles.tag}>
                                            <Text style={styles.tagText}>{tag.replace(/_/g, " ")}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Prediction Feedback */}
                                {userGuess && (
                                    <View style={[
                                        styles.feedbackBox,
                                        { backgroundColor: userGuess === result.classification.label ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)" }
                                    ]}>
                                        <Ionicons
                                            name={userGuess === result.classification.label ? "checkmark-circle" : "warning"}
                                            size={20}
                                            color={userGuess === result.classification.label ? colors.success : colors.destructive}
                                        />
                                        <Text style={[
                                            styles.feedbackText,
                                            { color: userGuess === result.classification.label ? colors.success : colors.destructive }
                                        ]}>
                                            {userGuess === result.classification.label
                                                ? "Nice! Your prediction was correct."
                                                : `Your prediction was "${userGuess}" — the AI classified it as "${result.classification.label}".`}
                                        </Text>
                                    </View>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tips Card */}
                        <Card style={styles.tipsCard}>
                            <CardHeader>
                                <View style={styles.titleWithIcon}>
                                    <Ionicons name="bulb" size={20} color={colors.primary} />
                                    <CardTitle style={styles.cardTitleText}>Safety Tips</CardTitle>
                                </View>
                            </CardHeader>
                            <CardContent>
                                {result.coach_response.tips.map((tip, i) => (
                                    <View key={i} style={styles.tipItem}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text style={styles.tipText}>{tip}</Text>
                                    </View>
                                ))}
                            </CardContent>
                        </Card>
                    </View>
                ) : (
                    <View style={styles.resultsPlaceholder}>
                        <Ionicons name="shield" size={48} color={colors.mutedForeground} style={{ opacity: 0.3 }} />
                        <Text style={styles.placeholderText}>
                            Enter a message to see the analysis results here.
                        </Text>
                    </View>
                )}
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
    errorAlert: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 1,
        borderColor: colors.destructive,
        borderRadius: radius.md,
        padding: spacing[3],
        marginBottom: spacing[4],
    },
    errorText: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.destructive,
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
    skipText: {
        color: colors.mutedForeground,
        fontSize: fontSize.sm,
    },
    results: {
        gap: spacing[4],
    },
    verdictCard: {
        borderLeftWidth: 4,
    },
    verdictHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
    },
    verdictInfo: {
        flex: 1,
    },
    verdictLabel: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        textTransform: "capitalize",
    },
    confidenceText: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
    explanationText: {
        fontSize: fontSize.base,
        color: colors.foreground,
        lineHeight: fontSize.base * 1.5,
        marginBottom: spacing[4],
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    tag: {
        backgroundColor: colors.secondary,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2.5],
        borderRadius: radius.full,
    },
    tagText: {
        fontSize: fontSize.xs,
        color: colors.secondaryForeground,
        textTransform: "capitalize",
    },
    feedbackBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        padding: spacing[3],
        borderRadius: radius.md,
    },
    feedbackText: {
        flex: 1,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    tipsCard: {
        marginTop: spacing[2],
    },
    titleWithIcon: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
    },
    cardTitleText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
    },
    tipItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    tipText: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.foreground,
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

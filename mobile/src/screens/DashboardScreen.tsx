/**
 * Dashboard Screen
 * Main hub matching web mobile layout
 */

import React from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardContent, Button, StatPill } from "../components/ui";
import { Colors, Spacing, FontSizes, BorderRadius } from "../config";

export default function DashboardScreen() {
    // Placeholder data - will be replaced with API calls in Part 2
    const stats = {
        totalAnalyzed: 42,
        accuracy: 85,
        streak: 7,
        level: 3,
    };

    const todayLesson = {
        title: "Spotting Phishing Links",
        topic: "links",
        completed: false,
    };

    const gmailConnected = false;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                    <Text style={styles.subtitle}>
                        Welcome back! Here's your security training overview.
                    </Text>
                </View>

                {/* Quick Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="shield-checkmark" size={20} color={Colors.mutedForeground} />
                        <Text style={styles.statValue}>{stats.totalAnalyzed}</Text>
                        <Text style={styles.statLabel}>Analyzed</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="analytics" size={20} color={Colors.mutedForeground} />
                        <Text style={styles.statValue}>{stats.accuracy}%</Text>
                        <Text style={styles.statLabel}>Accuracy</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={20} color={Colors.orange} />
                        <Text style={[styles.statValue, { color: Colors.orange }]}>{stats.streak}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="trending-up" size={20} color={Colors.blue} />
                        <Text style={[styles.statValue, { color: Colors.blue }]}>Lv.{stats.level}</Text>
                        <Text style={styles.statLabel}>Level</Text>
                    </View>
                </View>

                {/* Daily Lesson Card */}
                <Card variant="primary" style={styles.card}>
                    <CardHeader>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.cardTitleRow}>
                                <Ionicons name="book" size={20} color={Colors.primary} />
                                <Text style={styles.cardTitle}>Daily Lessons</Text>
                            </View>
                            {todayLesson.completed && (
                                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                            )}
                        </View>
                        <Text style={styles.cardDescription}>{todayLesson.title}</Text>
                    </CardHeader>
                    <CardContent>
                        <View style={styles.lessonMeta}>
                            <View style={styles.topicBadge}>
                                <Text style={styles.topicText}>{todayLesson.topic}</Text>
                            </View>
                            <Text style={styles.lessonCount}>0 lessons completed</Text>
                        </View>
                        <Button onPress={() => { }} style={styles.cardButton}>
                            {todayLesson.completed ? "View Lessons" : "Start Today's Lesson"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Gmail Integration Card */}
                <Card style={styles.card}>
                    <CardHeader>
                        <View style={styles.cardTitleRow}>
                            <Ionicons name="mail" size={20} color={Colors.foreground} />
                            <Text style={styles.cardTitle}>Gmail Integration</Text>
                        </View>
                        <Text style={styles.cardDescription}>
                            Scan your inbox for phishing threats
                        </Text>
                    </CardHeader>
                    <CardContent>
                        <View style={styles.gmailStatus}>
                            {gmailConnected ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                    <Text style={[styles.statusText, { color: Colors.success }]}>Connected</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="close-circle" size={16} color={Colors.mutedForeground} />
                                    <Text style={styles.statusText}>Not connected</Text>
                                </>
                            )}
                        </View>
                        <Button
                            variant={gmailConnected ? "outline" : "default"}
                            onPress={() => { }}
                            style={styles.cardButton}
                        >
                            {gmailConnected ? "Manage Gmail" : "Connect Gmail"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Progress Card */}
                <Card style={styles.card}>
                    <CardHeader>
                        <View style={styles.cardTitleRow}>
                            <Ionicons name="flame" size={20} color={Colors.orange} />
                            <Text style={styles.cardTitle}>Progress & Stats</Text>
                        </View>
                        <Text style={styles.cardDescription}>
                            Track your learning journey
                        </Text>
                    </CardHeader>
                    <CardContent>
                        <View style={styles.progressStats}>
                            <View style={styles.progressStat}>
                                <Text style={styles.progressLabel}>XP:</Text>
                                <Text style={styles.progressValue}>250</Text>
                            </View>
                            <View style={styles.progressStat}>
                                <Text style={styles.progressLabel}>Best:</Text>
                                <Text style={styles.progressValue}>12 days</Text>
                            </View>
                        </View>
                        <Button variant="outline" onPress={() => { }} style={styles.cardButton}>
                            View Full Stats
                        </Button>
                    </CardContent>
                </Card>

                {/* Weak Spots Alert (placeholder) */}
                <Card style={[styles.card, styles.weakSpotsCard]}>
                    <CardHeader>
                        <View style={styles.cardTitleRow}>
                            <Ionicons name="warning" size={20} color={Colors.warning} />
                            <Text style={styles.cardTitle}>Areas for Improvement</Text>
                        </View>
                    </CardHeader>
                    <CardContent>
                        <View style={styles.weakSpotsList}>
                            <View style={styles.weakSpotBadge}>
                                <Text style={styles.weakSpotText}>suspicious links</Text>
                            </View>
                            <View style={styles.weakSpotBadge}>
                                <Text style={styles.weakSpotText}>attachments</Text>
                            </View>
                        </View>
                        <Text style={styles.viewAnalytics}>View detailed analytics →</Text>
                    </CardContent>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl * 2,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes["2xl"],
        fontWeight: "700",
        color: Colors.foreground,
    },
    subtitle: {
        fontSize: FontSizes.base,
        color: Colors.mutedForeground,
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        marginHorizontal: Spacing.xs,
        alignItems: "center",
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: "700",
        color: Colors.foreground,
        marginTop: Spacing.xs,
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: Colors.mutedForeground,
    },
    card: {
        marginBottom: Spacing.lg,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    cardTitle: {
        fontSize: FontSizes.base,
        fontWeight: "600",
        color: Colors.foreground,
    },
    cardDescription: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
        marginTop: Spacing.xs,
    },
    lessonMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    topicBadge: {
        backgroundColor: `${Colors.primary}15`,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    topicText: {
        fontSize: FontSizes.xs,
        color: Colors.primary,
        fontWeight: "500",
    },
    lessonCount: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
    },
    cardButton: {
        marginTop: Spacing.sm,
    },
    gmailStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    statusText: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
    },
    progressStats: {
        flexDirection: "row",
        gap: Spacing.lg,
        marginBottom: Spacing.md,
    },
    progressStat: {
        flexDirection: "row",
        gap: Spacing.xs,
    },
    progressLabel: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
    },
    progressValue: {
        fontSize: FontSizes.sm,
        fontWeight: "600",
        color: Colors.foreground,
    },
    weakSpotsCard: {
        marginBottom: 0,
    },
    weakSpotsList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    weakSpotBadge: {
        backgroundColor: `${Colors.warning}15`,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
    },
    weakSpotText: {
        fontSize: FontSizes.sm,
        color: Colors.warning,
        textTransform: "capitalize",
    },
    viewAnalytics: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: "500",
    },
});

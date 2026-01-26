/**
 * Dashboard Screen - Matches web mobile layout exactly
 */

import React from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from "../components/ui";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";

export default function DashboardScreen() {
    // Placeholder data
    const stats = {
        totalAnalyzed: 42,
        accuracy: 85,
        streak: 7,
        level: 3,
    };

    const lessonProgress = {
        xp_total: 250,
        lessons_completed: 12,
        streak_best: 14,
    };

    const todayLesson = {
        title: "Spotting Phishing Links",
        topic: "links",
        already_completed: false,
    };

    const gmailConnected = false;

    const weakSpots = ["suspicious links", "attachments"];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header - matches web: text-3xl font-bold mb-2, text-muted-foreground mb-8 */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                    <Text style={styles.subtitle}>
                        Welcome back! Here's your security training overview.
                    </Text>
                </View>

                {/* Quick Stats - matches web: grid gap-4 md:grid-cols-4 mb-8 */}
                <View style={styles.statsGrid}>
                    {/* Total Analyzed */}
                    <Card style={styles.statCard}>
                        <CardHeader style={styles.statHeader}>
                            <Text style={styles.statLabel}>Total Analyzed</Text>
                            <Ionicons name="shield-checkmark" size={16} color={colors.mutedForeground} />
                        </CardHeader>
                        <CardContent style={styles.statContent}>
                            <Text style={styles.statValue}>{stats.totalAnalyzed}</Text>
                        </CardContent>
                    </Card>

                    {/* Accuracy */}
                    <Card style={styles.statCard}>
                        <CardHeader style={styles.statHeader}>
                            <Text style={styles.statLabel}>Accuracy</Text>
                            <Ionicons name="analytics" size={16} color={colors.mutedForeground} />
                        </CardHeader>
                        <CardContent style={styles.statContent}>
                            <Text style={styles.statValue}>{stats.accuracy}%</Text>
                        </CardContent>
                    </Card>

                    {/* Day Streak */}
                    <Card style={styles.statCard}>
                        <CardHeader style={styles.statHeader}>
                            <Text style={styles.statLabel}>Day Streak</Text>
                            <Ionicons name="flame" size={16} color={colors.orange} />
                        </CardHeader>
                        <CardContent style={styles.statContent}>
                            <Text style={[styles.statValue, { color: colors.orange }]}>{stats.streak}</Text>
                        </CardContent>
                    </Card>

                    {/* Level */}
                    <Card style={styles.statCard}>
                        <CardHeader style={styles.statHeader}>
                            <Text style={styles.statLabel}>Level</Text>
                            <Ionicons name="trending-up" size={16} color={colors.blue} />
                        </CardHeader>
                        <CardContent style={styles.statContent}>
                            <Text style={[styles.statValue, { color: colors.blue }]}>Lv. {stats.level}</Text>
                        </CardContent>
                    </Card>
                </View>

                {/* Feature Cards - matches web: grid gap-6 md:grid-cols-3 */}
                <View style={styles.featureCards}>
                    {/* Daily Lessons Card - matches web: border-2 border-primary/20 */}
                    <Card variant="primary" style={styles.featureCard}>
                        <CardHeader>
                            <View style={styles.cardTitleRow}>
                                <View style={styles.titleWithIcon}>
                                    <Ionicons name="book" size={20} color={colors.primary} />
                                    <CardTitle style={styles.cardTitleText}>Daily Lessons</CardTitle>
                                </View>
                                {todayLesson.already_completed && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                )}
                            </View>
                            <CardDescription>
                                {todayLesson.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Text style={styles.mutedText}>
                                {lessonProgress.lessons_completed} lessons completed
                            </Text>
                            <Button fullWidth style={styles.cardButton}>
                                <Text style={styles.buttonText}>
                                    {todayLesson.already_completed ? "View Lessons" : "Start Today's Lesson"}
                                </Text>
                                <Ionicons name="arrow-forward" size={16} color={colors.primaryForeground} />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Gmail Integration Card */}
                    <Card style={styles.featureCard}>
                        <CardHeader>
                            <View style={styles.titleWithIcon}>
                                <Ionicons name="mail" size={20} color={colors.foreground} />
                                <CardTitle style={styles.cardTitleText}>Gmail Integration</CardTitle>
                            </View>
                            <CardDescription>
                                Scan your inbox for phishing threats
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <View style={styles.statusRow}>
                                {gmailConnected ? (
                                    <>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text style={[styles.statusText, { color: colors.success }]}>Connected</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
                                        <Text style={styles.statusText}>Not connected</Text>
                                    </>
                                )}
                            </View>
                            <Button
                                variant={gmailConnected ? "outline" : "default"}
                                fullWidth
                                style={styles.cardButton}
                            >
                                <Text style={gmailConnected ? styles.outlineButtonText : styles.buttonText}>
                                    {gmailConnected ? "Manage Gmail" : "Connect Gmail"}
                                </Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={16}
                                    color={gmailConnected ? colors.foreground : colors.primaryForeground}
                                />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Progress & Stats Card */}
                    <Card style={styles.featureCard}>
                        <CardHeader>
                            <View style={styles.titleWithIcon}>
                                <Ionicons name="flame" size={20} color={colors.orange} />
                                <CardTitle style={styles.cardTitleText}>Progress & Stats</CardTitle>
                            </View>
                            <CardDescription>
                                Track your learning journey
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <View style={styles.progressStats}>
                                <View style={styles.progressItem}>
                                    <Text style={styles.progressLabel}>XP: </Text>
                                    <Text style={styles.progressValue}>{lessonProgress.xp_total}</Text>
                                </View>
                                <View style={styles.progressItem}>
                                    <Text style={styles.progressLabel}>Best: </Text>
                                    <Text style={styles.progressValue}>{lessonProgress.streak_best} days</Text>
                                </View>
                            </View>
                            <Button variant="outline" fullWidth style={styles.cardButton}>
                                <Text style={styles.outlineButtonText}>View Full Stats</Text>
                                <Ionicons name="arrow-forward" size={16} color={colors.foreground} />
                            </Button>
                        </CardContent>
                    </Card>
                </View>

                {/* Weak Spots Alert - matches web: mt-8 */}
                {weakSpots.length > 0 && (
                    <Card style={styles.weakSpotsCard}>
                        <CardHeader>
                            <View style={styles.titleWithIcon}>
                                <Ionicons name="warning" size={20} color={colors.warning} />
                                <CardTitle style={styles.cardTitleText}>Areas for Improvement</CardTitle>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <View style={styles.badgeRow}>
                                {weakSpots.map((spot, i) => (
                                    <View key={i} style={styles.weakSpotBadge}>
                                        <Text style={styles.weakSpotText}>{spot}</Text>
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.linkText}>View detailed analytics →</Text>
                        </CardContent>
                    </Card>
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
        marginBottom: spacing[8],
    },
    title: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        letterSpacing: -0.5,
        marginBottom: spacing[0.5],
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
        lineHeight: fontSize.base * 1.5,
    },
    // Stats Grid - 2x2 on mobile
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[4],
        marginBottom: spacing[8],
    },
    statCard: {
        width: "47%",
    },
    statHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: spacing[2],
    },
    statLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.foreground,
    },
    statContent: {
        paddingTop: 0,
    },
    statValue: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
    },
    // Feature Cards
    featureCards: {
        gap: spacing[6],
    },
    featureCard: {
        marginBottom: 0,
    },
    cardTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    mutedText: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        marginBottom: spacing[4],
    },
    cardButton: {
        marginTop: spacing[1],
    },
    buttonText: {
        color: colors.primaryForeground,
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
    },
    outlineButtonText: {
        color: colors.foreground,
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    statusText: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
    progressStats: {
        flexDirection: "row",
        gap: spacing[4],
        marginBottom: spacing[4],
    },
    progressItem: {
        flexDirection: "row",
    },
    progressLabel: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
    progressValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.foreground,
    },
    // Weak Spots
    weakSpotsCard: {
        marginTop: spacing[8],
    },
    badgeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    weakSpotBadge: {
        backgroundColor: colors.warningLight,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3],
        borderRadius: radius.full,
    },
    weakSpotText: {
        fontSize: fontSize.sm,
        color: "#a16207", // Tailwind yellow-700
        textTransform: "capitalize",
    },
    linkText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
});

/**
 * Dashboard Screen - With real API data
 */

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from "../components/ui";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";
import { useAuth } from "../context/AuthContext";
import { getUserSummary, getLessonProgress, getTodayLesson, getGmailStatus } from "../lib/api";

interface LessonProgress {
    xp_total: number;
    level: number;
    streak_current: number;
    streak_best: number;
    lessons_completed: number;
}

interface TodayLessonData {
    lesson: { lesson_id: string; title: string; topic: string };
    date: string;
    already_completed: boolean;
}

export default function DashboardScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
    const [todayLesson, setTodayLesson] = useState<TodayLessonData | null>(null);
    const [gmailConnected, setGmailConnected] = useState(false);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const [summaryData, progressData, lessonData, gmailData] = await Promise.all([
                getUserSummary(user.uid).catch(() => null),
                getLessonProgress().catch(() => null),
                getTodayLesson().catch(() => null),
                getGmailStatus().catch(() => ({ connected: false })),
            ]);

            setSummary(summaryData);
            setLessonProgress(progressData);
            setTodayLesson(lessonData);
            setGmailConnected(gmailData?.connected || false);
        } catch (error) {
            console.error("[Dashboard] Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalAnalyzed: summary?.total_analyzed || 0,
        accuracy: summary?.accuracy || 0,
        streak: lessonProgress?.streak_current || 0,
        level: lessonProgress?.level || 1,
    };

    const weakSpots = summary?.weak_spots || [];

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
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

                {/* Quick Stats */}
                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <CardHeader style={styles.statHeader}>
                            <Text style={styles.statLabel}>Total Analyzed</Text>
                            <Ionicons name="shield-checkmark" size={16} color={colors.mutedForeground} />
                        </CardHeader>
                        <CardContent style={styles.statContent}>
                            <Text style={styles.statValue}>{stats.totalAnalyzed}</Text>
                        </CardContent>
                    </Card>

                    <Card style={styles.statCard}>
                        <CardHeader style={styles.statHeader}>
                            <Text style={styles.statLabel}>Accuracy</Text>
                            <Ionicons name="analytics" size={16} color={colors.mutedForeground} />
                        </CardHeader>
                        <CardContent style={styles.statContent}>
                            <Text style={styles.statValue}>{stats.accuracy}%</Text>
                        </CardContent>
                    </Card>

                    <Card style={styles.statCard}>
                        <CardHeader style={styles.statHeader}>
                            <Text style={styles.statLabel}>Day Streak</Text>
                            <Ionicons name="flame" size={16} color={colors.orange} />
                        </CardHeader>
                        <CardContent style={styles.statContent}>
                            <Text style={[styles.statValue, { color: colors.orange }]}>{stats.streak}</Text>
                        </CardContent>
                    </Card>

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

                {/* Feature Cards */}
                <View style={styles.featureCards}>
                    {/* Daily Lessons Card */}
                    <Card variant="primary" style={styles.featureCard}>
                        <CardHeader>
                            <View style={styles.cardTitleRow}>
                                <View style={styles.titleWithIcon}>
                                    <Ionicons name="book" size={20} color={colors.primary} />
                                    <CardTitle style={styles.cardTitleText}>Daily Lessons</CardTitle>
                                </View>
                                {todayLesson?.already_completed && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                )}
                            </View>
                            <CardDescription>
                                {todayLesson?.lesson?.title || "Complete daily micro-lessons"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Text style={styles.mutedText}>
                                {lessonProgress?.lessons_completed || 0} lessons completed
                            </Text>
                            <Button fullWidth style={styles.cardButton}>
                                <Text style={styles.buttonText}>
                                    {todayLesson?.already_completed ? "View Lessons" : "Start Today's Lesson"}
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
                            <CardDescription>Scan your inbox for phishing threats</CardDescription>
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

                    {/* Progress Card */}
                    <Card style={styles.featureCard}>
                        <CardHeader>
                            <View style={styles.titleWithIcon}>
                                <Ionicons name="flame" size={20} color={colors.orange} />
                                <CardTitle style={styles.cardTitleText}>Progress & Stats</CardTitle>
                            </View>
                            <CardDescription>Track your learning journey</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <View style={styles.progressStats}>
                                <View style={styles.progressItem}>
                                    <Text style={styles.progressLabel}>XP: </Text>
                                    <Text style={styles.progressValue}>{lessonProgress?.xp_total || 0}</Text>
                                </View>
                                <View style={styles.progressItem}>
                                    <Text style={styles.progressLabel}>Best: </Text>
                                    <Text style={styles.progressValue}>{lessonProgress?.streak_best || 0} days</Text>
                                </View>
                            </View>
                            <Button variant="outline" fullWidth style={styles.cardButton}>
                                <Text style={styles.outlineButtonText}>View Full Stats</Text>
                                <Ionicons name="arrow-forward" size={16} color={colors.foreground} />
                            </Button>
                        </CardContent>
                    </Card>
                </View>

                {/* Weak Spots */}
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
                                {weakSpots.slice(0, 3).map((spot: string, i: number) => (
                                    <View key={i} style={styles.weakSpotBadge}>
                                        <Text style={styles.weakSpotText}>{spot.replace("_", " ")}</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: spacing[4],
    },
    loadingText: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
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
        backgroundColor: "rgba(234, 179, 8, 0.15)",
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3],
        borderRadius: radius.full,
    },
    weakSpotText: {
        fontSize: fontSize.sm,
        color: "#a16207",
        textTransform: "capitalize",
    },
    linkText: {
        fontSize: fontSize.sm,
        color: colors.foreground,
        fontWeight: fontWeight.medium,
    },
});

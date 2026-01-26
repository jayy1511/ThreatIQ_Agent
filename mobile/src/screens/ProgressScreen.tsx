/**
 * Progress Screen - With real API integration
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
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";
import { useAuth } from "../context/AuthContext";
import { getLessonProgress, getUserSummary } from "../lib/api";

interface ProgressData {
    xp_total: number;
    level: number;
    streak_current: number;
    streak_best: number;
    lessons_completed: number;
    last_7_days?: { date: string; completed: boolean }[];
}

export default function ProgressScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const [progressData, summaryData] = await Promise.all([
                getLessonProgress().catch(() => null),
                getUserSummary(user.uid).catch(() => null),
            ]);

            setProgress(progressData);
            setSummary(summaryData);
        } catch (error) {
            console.error("[Progress] Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Generate last 7 days for streak visualization
    const getLast7Days = () => {
        if (progress?.last_7_days) return progress.last_7_days;

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const today = new Date().getDay();
        return days.map((day, idx) => ({
            day,
            completed: idx <= (progress?.streak_current || 0) - 1,
        }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading progress...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const xpTotal = progress?.xp_total || 0;
    const level = progress?.level || 1;
    const xpForNextLevel = level * 100;
    const xpProgress = (xpTotal % 100) / 100;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Your Progress</Text>
                    <Text style={styles.subtitle}>
                        Track your learning journey and achievements.
                    </Text>
                </View>

                {/* XP & Level Card */}
                <Card style={styles.xpCard}>
                    <CardContent style={styles.xpContent}>
                        <View style={styles.xpMain}>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Lv. {level}</Text>
                            </View>
                            <View style={styles.xpInfo}>
                                <Text style={styles.xpValue}>{xpTotal} XP</Text>
                                <Text style={styles.xpLabel}>Total Experience</Text>
                            </View>
                        </View>
                        <View style={styles.xpProgress}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${xpProgress * 100}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{100 - (xpTotal % 100)} XP to next level</Text>
                        </View>
                    </CardContent>
                </Card>

                {/* Streak Card */}
                <Card style={styles.streakCard}>
                    <CardHeader>
                        <View style={styles.titleWithIcon}>
                            <Ionicons name="flame" size={20} color={colors.orange} />
                            <CardTitle style={styles.cardTitleText}>Current Streak</CardTitle>
                        </View>
                    </CardHeader>
                    <CardContent>
                        <View style={styles.streakMain}>
                            <Text style={styles.streakValue}>{progress?.streak_current || 0}</Text>
                            <Text style={styles.streakLabel}>days</Text>
                        </View>

                        {/* 7-day visualization */}
                        <View style={styles.weekView}>
                            {getLast7Days().map((day: any, idx: number) => (
                                <View key={idx} style={styles.dayColumn}>
                                    <View style={[
                                        styles.dayCircle,
                                        day.completed ? styles.dayCompleted : styles.dayMissed
                                    ]}>
                                        {day.completed && (
                                            <Ionicons name="checkmark" size={14} color={colors.primaryForeground} />
                                        )}
                                    </View>
                                    <Text style={styles.dayLabel}>{day.day || ""}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.bestStreak}>
                            <Ionicons name="trophy" size={16} color={colors.warning} />
                            <Text style={styles.bestStreakText}>Best: {progress?.streak_best || 0} days</Text>
                        </View>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Analysis Stats</Text>
                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <CardContent style={styles.statContent}>
                            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                            <Text style={styles.statValue}>{summary?.total_analyzed || 0}</Text>
                            <Text style={styles.statLabel}>Messages Analyzed</Text>
                        </CardContent>
                    </Card>
                    <Card style={styles.statCard}>
                        <CardContent style={styles.statContent}>
                            <Ionicons name="analytics" size={24} color={colors.success} />
                            <Text style={styles.statValue}>{summary?.accuracy || 0}%</Text>
                            <Text style={styles.statLabel}>Accuracy Rate</Text>
                        </CardContent>
                    </Card>
                    <Card style={styles.statCard}>
                        <CardContent style={styles.statContent}>
                            <Ionicons name="layers" size={24} color={colors.purple} />
                            <Text style={styles.statValue}>{summary?.categories_seen || 0}</Text>
                            <Text style={styles.statLabel}>Categories Seen</Text>
                        </CardContent>
                    </Card>
                    <Card style={styles.statCard}>
                        <CardContent style={styles.statContent}>
                            <Ionicons name="book" size={24} color={colors.blue} />
                            <Text style={styles.statValue}>{progress?.lessons_completed || 0}</Text>
                            <Text style={styles.statLabel}>Lessons Done</Text>
                        </CardContent>
                    </Card>
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
    xpCard: {
        marginBottom: spacing[4],
        backgroundColor: colors.primary,
    },
    xpContent: {
        paddingVertical: spacing[5],
    },
    xpMain: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[4],
        marginBottom: spacing[4],
    },
    levelBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderRadius: radius.lg,
    },
    levelText: {
        color: colors.primaryForeground,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    xpInfo: {
        flex: 1,
    },
    xpValue: {
        color: colors.primaryForeground,
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
    },
    xpLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: fontSize.sm,
    },
    xpProgress: {
        gap: spacing[2],
    },
    progressBar: {
        height: 8,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: radius.full,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: colors.primaryForeground,
        borderRadius: radius.full,
    },
    progressText: {
        color: "rgba(255,255,255,0.8)",
        fontSize: fontSize.xs,
        textAlign: "center",
    },
    streakCard: {
        marginBottom: spacing[6],
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
    streakMain: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
        marginBottom: spacing[5],
    },
    streakValue: {
        fontSize: 48,
        fontWeight: fontWeight.bold,
        color: colors.orange,
    },
    streakLabel: {
        fontSize: fontSize.lg,
        color: colors.mutedForeground,
        marginLeft: spacing[2],
    },
    weekView: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing[4],
    },
    dayColumn: {
        alignItems: "center",
        gap: spacing[1],
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    dayCompleted: {
        backgroundColor: colors.success,
    },
    dayMissed: {
        backgroundColor: colors.muted,
    },
    dayLabel: {
        fontSize: fontSize.xs,
        color: colors.mutedForeground,
    },
    bestStreak: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[2],
    },
    bestStreakText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.foreground,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[4],
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[3],
    },
    statCard: {
        width: "48%",
    },
    statContent: {
        alignItems: "center",
        paddingVertical: spacing[4],
    },
    statValue: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        marginTop: spacing[2],
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.mutedForeground,
        textAlign: "center",
        marginTop: spacing[1],
    },
});

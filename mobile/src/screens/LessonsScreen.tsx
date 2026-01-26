/**
 * Lessons Screen - With real API integration
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
import { getTodayLesson, getRecentLessons, getLessonProgress } from "../lib/api";

interface LessonData {
    lesson: {
        lesson_id: string;
        title: string;
        topic: string;
        content: string[];
    };
    date: string;
    already_completed: boolean;
}

export default function LessonsScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [todayLesson, setTodayLesson] = useState<LessonData | null>(null);
    const [recentLessons, setRecentLessons] = useState<any[]>([]);
    const [lessonsCompleted, setLessonsCompleted] = useState(0);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const [lessonData, recentData, progressData] = await Promise.all([
                getTodayLesson().catch(() => null),
                getRecentLessons(5).catch(() => ({ completions: [] })),
                getLessonProgress().catch(() => null),
            ]);

            setTodayLesson(lessonData);
            setRecentLessons(recentData?.completions || []);
            setLessonsCompleted(progressData?.lessons_completed || 0);
        } catch (error) {
            console.error("[Lessons] Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTopicColor = (topic: string) => {
        const topicColors: Record<string, string> = {
            passwords: colors.purple,
            "2fa": colors.blue,
            links: colors.destructive,
            attachments: colors.orange,
            social_engineering: colors.warning,
        };
        return topicColors[topic] || colors.primary;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading lessons...</Text>
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
                    <Text style={styles.title}>Daily Lessons</Text>
                    <Text style={styles.subtitle}>
                        Complete micro-lessons to improve your security awareness.
                    </Text>
                </View>

                {/* Today's Lesson Card */}
                {todayLesson ? (
                    <Card variant="primary" style={styles.todayCard}>
                        <CardHeader>
                            <View style={styles.cardTitleRow}>
                                <View style={styles.titleWithIcon}>
                                    <Ionicons name="book" size={20} color={colors.primary} />
                                    <CardTitle style={styles.cardTitleText}>Today's Lesson</CardTitle>
                                </View>
                                {todayLesson.already_completed && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                )}
                            </View>
                        </CardHeader>
                        <CardContent>
                            <Text style={styles.lessonTitle}>{todayLesson.lesson.title}</Text>
                            <View style={styles.topicRow}>
                                <View style={[styles.topicBadge, { backgroundColor: `${getTopicColor(todayLesson.lesson.topic)}15` }]}>
                                    <Text style={[styles.topicText, { color: getTopicColor(todayLesson.lesson.topic) }]}>
                                        {todayLesson.lesson.topic}
                                    </Text>
                                </View>
                                <Text style={styles.duration}>~3 min</Text>
                            </View>
                            <Button fullWidth style={styles.startButton}>
                                <Text style={styles.buttonText}>
                                    {todayLesson.already_completed ? "Review Lesson" : "Start Lesson"}
                                </Text>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card style={styles.noLessonCard}>
                        <CardContent style={styles.noLessonContent}>
                            <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
                            <Text style={styles.noLessonText}>No lesson available</Text>
                            <Text style={styles.noLessonSubtext}>Check back tomorrow!</Text>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Lessons */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Lessons</Text>
                    {recentLessons.length > 0 ? (
                        recentLessons.map((lesson, idx) => (
                            <Card key={idx} style={styles.lessonCard}>
                                <CardContent style={styles.lessonCardContent}>
                                    <View style={styles.lessonInfo}>
                                        <Text style={styles.lessonCardTitle}>{lesson.lesson_title || lesson.lesson_id}</Text>
                                        <View style={[styles.topicBadge, { backgroundColor: `${getTopicColor(lesson.lesson_topic || "general")}15` }]}>
                                            <Text style={[styles.topicText, { color: getTopicColor(lesson.lesson_topic || "general") }]}>
                                                {lesson.lesson_topic || "general"}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.scoreContainer}>
                                        <Text style={[
                                            styles.scoreText,
                                            { color: lesson.score_percent >= 80 ? colors.success : lesson.score_percent >= 60 ? colors.warning : colors.destructive }
                                        ]}>
                                            {lesson.score_percent || 0}%
                                        </Text>
                                        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                                    </View>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <CardContent style={styles.emptyContent}>
                                <Text style={styles.emptyText}>No lessons completed yet</Text>
                                <Text style={styles.emptySubtext}>Start your first lesson above!</Text>
                            </CardContent>
                        </Card>
                    )}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{lessonsCompleted}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
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
    todayCard: {
        marginBottom: spacing[6],
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
    lessonTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[3],
    },
    topicRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
        marginBottom: spacing[4],
    },
    topicBadge: {
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2.5],
        borderRadius: radius.full,
    },
    topicText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
    duration: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
    startButton: {
        marginTop: spacing[1],
    },
    buttonText: {
        color: colors.primaryForeground,
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
    },
    noLessonCard: {
        marginBottom: spacing[6],
    },
    noLessonContent: {
        alignItems: "center",
        paddingVertical: spacing[8],
    },
    noLessonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.medium,
        color: colors.foreground,
        marginTop: spacing[4],
    },
    noLessonSubtext: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        marginTop: spacing[1],
    },
    section: {
        marginBottom: spacing[6],
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[4],
    },
    lessonCard: {
        marginBottom: spacing[3],
    },
    lessonCardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing[4],
    },
    lessonInfo: {
        flex: 1,
        gap: spacing[2],
    },
    lessonCardTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.foreground,
    },
    scoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
    },
    scoreText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    emptyCard: {
        marginBottom: spacing[3],
    },
    emptyContent: {
        alignItems: "center",
        paddingVertical: spacing[6],
    },
    emptyText: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
    emptySubtext: {
        fontSize: fontSize.xs,
        color: colors.mutedForeground,
        marginTop: spacing[1],
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: spacing[8],
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
});

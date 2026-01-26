/**
 * Lessons Screen - Matches web lessons layout
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

export default function LessonsScreen() {
    // Placeholder data
    const todayLesson = {
        lesson_id: "lesson_1",
        title: "Spotting Phishing Links",
        topic: "links",
        already_completed: false,
    };

    const recentLessons = [
        { id: "1", title: "Creating Strong Passwords", topic: "passwords", score: 100 },
        { id: "2", title: "Two-Factor Authentication", topic: "2fa", score: 85 },
        { id: "3", title: "Email Attachments", topic: "attachments", score: 67 },
    ];

    const getTopicColor = (topic: string) => {
        const topicColors: Record<string, string> = {
            passwords: colors.purple,
            "2fa": colors.blue,
            links: colors.destructive,
            attachments: colors.orange,
        };
        return topicColors[topic] || colors.primary;
    };

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
                        <Text style={styles.lessonTitle}>{todayLesson.title}</Text>
                        <View style={styles.topicRow}>
                            <View style={[styles.topicBadge, { backgroundColor: `${getTopicColor(todayLesson.topic)}15` }]}>
                                <Text style={[styles.topicText, { color: getTopicColor(todayLesson.topic) }]}>
                                    {todayLesson.topic}
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

                {/* Recent Lessons */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Lessons</Text>
                    {recentLessons.map((lesson) => (
                        <Card key={lesson.id} style={styles.lessonCard}>
                            <CardContent style={styles.lessonCardContent}>
                                <View style={styles.lessonInfo}>
                                    <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
                                    <View style={[styles.topicBadge, { backgroundColor: `${getTopicColor(lesson.topic)}15` }]}>
                                        <Text style={[styles.topicText, { color: getTopicColor(lesson.topic) }]}>
                                            {lesson.topic}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.scoreContainer}>
                                    <Text style={[
                                        styles.scoreText,
                                        { color: lesson.score >= 80 ? colors.success : lesson.score >= 60 ? colors.warning : colors.destructive }
                                    ]}>
                                        {lesson.score}%
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                                </View>
                            </CardContent>
                        </Card>
                    ))}
                </View>

                {/* All Lessons Link */}
                <Button variant="outline" fullWidth>
                    <Text style={styles.outlineButtonText}>View All Lessons</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.foreground} />
                </Button>
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
    outlineButtonText: {
        color: colors.foreground,
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
    },
});

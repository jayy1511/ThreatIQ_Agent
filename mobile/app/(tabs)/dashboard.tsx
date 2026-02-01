// Dashboard Screen - Matches Web UI layout
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Tag, LoadingSpinner } from '../../src/components';
import { useAuth } from '../../src/lib/auth';
import {
    getTodayLesson,
    getLessonProgress,
    getProfileSummary,
    getGmailStatus,
    TodayLesson,
    LessonProgress,
    ProfileSummary,
} from '../../src/lib/api';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function DashboardScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lesson, setLesson] = useState<TodayLesson | null>(null);
    const [progress, setProgress] = useState<LessonProgress | null>(null);
    const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
    const [gmailStatus, setGmailStatus] = useState<any>(null);

    const loadData = useCallback(async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            const [lessonData, progressData, summaryData, gmailData] = await Promise.all([
                getTodayLesson().catch(() => null),
                getLessonProgress().catch(() => null),
                getProfileSummary(user.uid).catch(() => null),
                getGmailStatus().catch(() => ({ connected: false })),
            ]);
            setLesson(lessonData);
            setProgress(progressData);
            setProfileSummary(summaryData);
            setGmailStatus(gmailData);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.uid]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const accuracy = profileSummary?.accuracy ?? 0;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>
                        {user?.email?.split('@')[0] || 'User'}
                    </Text>
                </View>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {/* Stats Grid (matches web layout) */}
                        <View style={styles.statsGrid}>
                            <Card style={styles.statCard}>
                                <Text style={styles.statValue}>{profileSummary?.total_analyzed || 0}</Text>
                                <Text style={styles.statLabel}>Total Analyzed</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <Text style={[styles.statValue, { color: colors.success }]}>
                                    {Math.round(accuracy)}%
                                </Text>
                                <Text style={styles.statLabel}>Accuracy</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <Text style={[styles.statValue, { color: colors.warning }]}>
                                    {progress?.streak_current || 0}
                                </Text>
                                <Text style={styles.statLabel}>🔥 Streak</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <Text style={[styles.statValue, { color: colors.primary }]}>
                                    {progress?.level || 1}
                                </Text>
                                <Text style={styles.statLabel}>Level</Text>
                            </Card>
                        </View>

                        {/* XP Progress (matches web) */}
                        {progress && (
                            <Card style={styles.xpCard}>
                                <View style={styles.xpHeader}>
                                    <Text style={styles.xpTitle}>⭐ Experience Points</Text>
                                    <Text style={styles.xpValue}>{progress.xp_total} XP</Text>
                                </View>
                                <View style={styles.xpBar}>
                                    <View
                                        style={[
                                            styles.xpFill,
                                            { width: `${Math.min((progress.xp_total % 500) / 5, 100)}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.xpNext}>
                                    {500 - (progress.xp_total % 500)} XP to next level
                                </Text>
                            </Card>
                        )}

                        {/* Daily Lesson Card (prominent like web) */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => router.push('/(tabs)/lessons')}
                        >
                            <Card
                                variant={lesson && !lesson.already_completed ? 'accent' : 'default'}
                                style={styles.lessonCard}
                            >
                                <View style={styles.lessonHeader}>
                                    <View style={styles.lessonIcon}>
                                        <Text style={styles.lessonEmoji}>📚</Text>
                                    </View>
                                    <View style={styles.lessonInfo}>
                                        <Text style={styles.lessonTitle}>Daily Lesson</Text>
                                        {lesson?.already_completed ? (
                                            <Tag label="✅ Completed" variant="success" size="sm" />
                                        ) : (
                                            <Tag label="Ready" variant="accent" size="sm" />
                                        )}
                                    </View>
                                </View>

                                {lesson?.lesson && (
                                    <Text style={styles.lessonPreview} numberOfLines={2}>
                                        {lesson.lesson.title}
                                    </Text>
                                )}

                                <Button
                                    title={lesson?.already_completed ? "Review Lesson" : "Start Learning"}
                                    onPress={() => router.push('/(tabs)/lessons')}
                                    variant={lesson?.already_completed ? "secondary" : "primary"}
                                    fullWidth
                                />
                            </Card>
                        </TouchableOpacity>

                        {/* Gmail Integration Card */}
                        <Card style={styles.gmailCard}>
                            <View style={styles.gmailHeader}>
                                <Text style={styles.gmailEmoji}>📧</Text>
                                <View style={styles.gmailInfo}>
                                    <Text style={styles.gmailTitle}>Gmail Integration</Text>
                                    <Text style={styles.gmailStatus}>
                                        {gmailStatus?.connected ? 'Connected' : 'Not connected'}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusDot,
                                    gmailStatus?.connected ? styles.statusConnected : styles.statusDisconnected
                                ]} />
                            </View>
                            <Text style={styles.gmailDesc}>
                                Scan your inbox for potential phishing emails
                            </Text>
                            <Button
                                title="Coming Soon"
                                variant="secondary"
                                fullWidth
                                disabled
                            />
                        </Card>

                        {/* Progress & Stats Card */}
                        <Card>
                            <Text style={styles.sectionTitle}>📊 Progress & Stats</Text>

                            {/* Weekly Activity */}
                            {progress?.last_7_days && (
                                <View style={styles.weekActivity}>
                                    <Text style={styles.weekLabel}>This Week</Text>
                                    <View style={styles.weekDots}>
                                        {progress.last_7_days.map((day, i) => (
                                            <View key={i} style={styles.dayColumn}>
                                                <View style={[
                                                    styles.dayDot,
                                                    day.completed && styles.dayDotCompleted
                                                ]} />
                                                <Text style={styles.dayLabel}>
                                                    {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={styles.statsRow}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsItemValue}>{profileSummary?.correct || 0}</Text>
                                    <Text style={styles.statsItemLabel}>Correct</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsItemValue}>{profileSummary?.incorrect || 0}</Text>
                                    <Text style={styles.statsItemLabel}>Incorrect</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsItemValue}>{progress?.lessons_completed || 0}</Text>
                                    <Text style={styles.statsItemLabel}>Lessons</Text>
                                </View>
                            </View>

                            <Button
                                title="View Full Profile"
                                variant="outline"
                                fullWidth
                                onPress={() => router.push('/(tabs)/profile')}
                            />
                        </Card>

                        {/* Quick Analyze CTA */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => router.push('/(tabs)/analyze')}
                        >
                            <Card variant="accent" style={styles.analyzeCta}>
                                <Text style={styles.ctaEmoji}>🔍</Text>
                                <View style={styles.ctaContent}>
                                    <Text style={styles.ctaTitle}>Analyze a Message</Text>
                                    <Text style={styles.ctaSubtitle}>
                                        Check if an email or SMS is a phishing attempt
                                    </Text>
                                </View>
                                <Text style={styles.ctaArrow}>→</Text>
                            </Card>
                        </TouchableOpacity>
                    </>
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    header: {
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: fontSize.md,
        color: colors.textMuted,
    },
    userName: {
        fontSize: fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.text,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    statCard: {
        width: '48%',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    statValue: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    xpCard: {
        marginBottom: spacing.md,
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    xpTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    xpValue: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.primary,
    },
    xpBar: {
        height: 12,
        backgroundColor: colors.inputBackground,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    xpFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 6,
    },
    xpNext: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    lessonCard: {
        marginBottom: spacing.md,
    },
    lessonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    lessonIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    lessonEmoji: {
        fontSize: 24,
    },
    lessonInfo: {
        flex: 1,
        gap: spacing.xs,
    },
    lessonTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    lessonPreview: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    gmailCard: {
        marginBottom: spacing.md,
    },
    gmailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    gmailEmoji: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    gmailInfo: {
        flex: 1,
    },
    gmailTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    gmailStatus: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusConnected: {
        backgroundColor: colors.success,
    },
    statusDisconnected: {
        backgroundColor: colors.textMuted,
    },
    gmailDesc: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    weekActivity: {
        marginBottom: spacing.md,
    },
    weekLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.sm,
    },
    weekDots: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    dayColumn: {
        alignItems: 'center',
    },
    dayDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.inputBackground,
        marginBottom: 4,
    },
    dayDotCompleted: {
        backgroundColor: colors.success,
    },
    dayLabel: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
        marginBottom: spacing.md,
    },
    statsItem: {
        alignItems: 'center',
    },
    statsItemValue: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
    },
    statsItemLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: 2,
    },
    analyzeCta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    ctaEmoji: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    ctaContent: {
        flex: 1,
    },
    ctaTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    ctaSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: 2,
    },
    ctaArrow: {
        fontSize: 24,
        color: colors.primary,
    },
});

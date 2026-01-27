// Dashboard Screen - Full Implementation
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Input, Tag, LoadingSpinner } from '../../src/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/lib/auth';
import {
    getTodayLesson,
    getLessonProgress,
    analyzePublic,
    TodayLesson,
    LessonProgress,
    AnalysisResponse,
    ApiError
} from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/theme/colors';

export default function DashboardScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lesson, setLesson] = useState<TodayLesson | null>(null);
    const [progress, setProgress] = useState<LessonProgress | null>(null);

    // Quick analyze state
    const [quickMessage, setQuickMessage] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [quickResult, setQuickResult] = useState<AnalysisResponse | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [lessonData, progressData] = await Promise.all([
                getTodayLesson().catch(() => null),
                getLessonProgress().catch(() => null),
            ]);
            setLesson(lessonData);
            setProgress(progressData);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setQuickResult(null);
        loadData();
    }, [loadData]);

    const handleQuickAnalyze = async () => {
        if (!quickMessage.trim()) return;

        setAnalyzing(true);
        try {
            const result = await analyzePublic(quickMessage);
            setQuickResult(result);
        } catch (err) {
            console.error('Quick analyze error:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    const getLabelColor = (label: string) => {
        switch (label.toLowerCase()) {
            case 'safe': return colors.success;
            case 'suspicious': return colors.warning;
            case 'phishing': return colors.error;
            default: return colors.textMuted;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.accent}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.greeting}>
                    Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
                </Text>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <Card style={styles.statCard}>
                                <Text style={styles.statValue}>{progress?.xp_total || 0}</Text>
                                <Text style={styles.statLabel}>XP</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <Text style={[styles.statValue, { color: colors.warning }]}>
                                    {progress?.streak_current || 0}
                                </Text>
                                <Text style={styles.statLabel}>🔥 Streak</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <Text style={[styles.statValue, { color: colors.accent }]}>
                                    {progress?.level || 1}
                                </Text>
                                <Text style={styles.statLabel}>Level</Text>
                            </Card>
                        </View>

                        {/* Daily Lesson Card */}
                        <Card
                            variant={lesson && !lesson.already_completed ? 'accent' : 'default'}
                            onPress={() => router.push('/(tabs)/lessons')}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardEmoji}>📚</Text>
                                <View style={styles.cardHeaderText}>
                                    <Text style={styles.cardTitle}>Daily Lesson</Text>
                                    {lesson?.already_completed ? (
                                        <Text style={styles.completedText}>✅ Completed today!</Text>
                                    ) : (
                                        <Text style={styles.pendingText}>Ready to learn</Text>
                                    )}
                                </View>
                            </View>

                            {lesson?.lesson && (
                                <Text style={styles.lessonPreview} numberOfLines={2}>
                                    {lesson.lesson.title}
                                </Text>
                            )}

                            <Button
                                title={lesson?.already_completed ? "Review" : "Start Lesson"}
                                onPress={() => router.push('/(tabs)/lessons')}
                                variant={lesson?.already_completed ? "outline" : "primary"}
                                fullWidth
                                style={styles.cardButton}
                            />
                        </Card>

                        {/* Quick Analyze Card */}
                        <Card>
                            <Text style={styles.cardTitle}>🔍 Quick Analyze</Text>
                            <Text style={styles.cardDescription}>
                                Paste a suspicious message to check for phishing
                            </Text>

                            <Input
                                placeholder="Paste message here..."
                                value={quickMessage}
                                onChangeText={(text) => {
                                    setQuickMessage(text);
                                    if (quickResult) setQuickResult(null);
                                }}
                                multiline
                                numberOfLines={3}
                                containerStyle={styles.quickInput}
                            />

                            {quickResult && (
                                <View style={styles.quickResult}>
                                    <View style={styles.quickResultRow}>
                                        <Text style={styles.quickResultLabel}>Result:</Text>
                                        <Tag
                                            label={quickResult.classification.label.toUpperCase()}
                                            variant={
                                                quickResult.classification.label === 'safe' ? 'success' :
                                                    quickResult.classification.label === 'suspicious' ? 'warning' : 'error'
                                            }
                                        />
                                    </View>
                                    <Text style={styles.quickConfidence}>
                                        {Math.round(quickResult.classification.confidence * 100)}% confidence
                                    </Text>
                                </View>
                            )}

                            <Button
                                title={analyzing ? "Analyzing..." : "Analyze"}
                                onPress={handleQuickAnalyze}
                                loading={analyzing}
                                disabled={!quickMessage.trim()}
                                variant="outline"
                                fullWidth
                            />

                            <Button
                                title="Full Analysis →"
                                onPress={() => router.push('/(tabs)/analyze')}
                                variant="ghost"
                                fullWidth
                                style={styles.fullAnalysisButton}
                            />
                        </Card>

                        {/* Recent Activity Placeholder */}
                        <Card>
                            <Text style={styles.cardTitle}>📈 Recent Activity</Text>
                            <Text style={styles.emptyText}>
                                Your recent analyses and lessons will appear here
                            </Text>
                            <Button
                                title="View Profile"
                                onPress={() => router.push('/(tabs)/profile')}
                                variant="ghost"
                                fullWidth
                            />
                        </Card>
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
    title: {
        fontSize: fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    greeting: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        marginBottom: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardEmoji: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    completedText: {
        fontSize: fontSize.sm,
        color: colors.success,
        marginTop: 2,
    },
    pendingText: {
        fontSize: fontSize.sm,
        color: colors.accent,
        marginTop: 2,
    },
    lessonPreview: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    cardDescription: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
    cardButton: {
        marginTop: spacing.xs,
    },
    quickInput: {
        marginBottom: spacing.sm,
    },
    quickResult: {
        backgroundColor: colors.inputBackground,
        padding: spacing.md,
        borderRadius: 8,
        marginBottom: spacing.md,
    },
    quickResultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    quickResultLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    quickConfidence: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    fullAnalysisButton: {
        marginTop: spacing.sm,
    },
    emptyText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        textAlign: 'center',
        marginVertical: spacing.md,
    },
});

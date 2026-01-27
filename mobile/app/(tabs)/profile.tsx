// Profile Screen - Full Implementation
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ScreenContainer, Card, Button, Tag, LoadingSpinner } from '../../src/components';
import { useAuth } from '../../src/lib/auth';
import {
    getProfileSummary,
    getLessonProgress,
    getAnalysisHistory,
    ProfileSummary,
    LessonProgress,
    ApiError
} from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/theme/colors';

export default function ProfileScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState<ProfileSummary | null>(null);
    const [progress, setProgress] = useState<LessonProgress | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!user?.uid) return;

        try {
            setError(null);
            const [summaryData, progressData, historyData] = await Promise.all([
                getProfileSummary(user.uid).catch(() => null),
                getLessonProgress().catch(() => null),
                getAnalysisHistory(user.uid).catch(() => ({ history: [] })),
            ]);
            setSummary(summaryData);
            setProgress(progressData);
            setHistory(historyData?.history || []);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to load profile');
            }
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

    const accuracy = summary?.accuracy ?? 0;

    return (
        <ScreenContainer scroll={false}>
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
                <Text style={styles.title}>Profile</Text>

                {/* User Info Card */}
                <Card>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.email?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.email}>{user?.email || 'Not signed in'}</Text>

                    {progress && (
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>Level {progress.level}</Text>
                            <Text style={styles.xpText}>{progress.xp_total} XP</Text>
                        </View>
                    )}
                </Card>

                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <Card>
                        <Text style={styles.errorText}>{error}</Text>
                        <Button title="Retry" onPress={loadData} variant="outline" />
                    </Card>
                ) : (
                    <>
                        {/* Stats Card */}
                        <Card>
                            <Text style={styles.cardTitle}>📊 Analysis Statistics</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.stat}>
                                    <Text style={styles.statValue}>{summary?.total_analyzed || 0}</Text>
                                    <Text style={styles.statLabel}>Analyzed</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={[styles.statValue, { color: colors.success }]}>
                                        {summary?.correct || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Correct</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={[styles.statValue, { color: colors.error }]}>
                                        {summary?.incorrect || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Incorrect</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={[styles.statValue, { color: colors.accent }]}>
                                        {Math.round(accuracy)}%
                                    </Text>
                                    <Text style={styles.statLabel}>Accuracy</Text>
                                </View>
                            </View>

                            {/* Accuracy bar */}
                            <View style={styles.accuracyBar}>
                                <View style={[styles.accuracyFill, { width: `${accuracy}%` }]} />
                            </View>
                        </Card>

                        {/* Lesson Progress */}
                        {progress && (
                            <Card>
                                <Text style={styles.cardTitle}>📚 Learning Progress</Text>
                                <View style={styles.progressStats}>
                                    <View style={styles.stat}>
                                        <Text style={[styles.statValue, { color: colors.warning }]}>
                                            {progress.streak_current}
                                        </Text>
                                        <Text style={styles.statLabel}>🔥 Current Streak</Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Text style={styles.statValue}>{progress.streak_best}</Text>
                                        <Text style={styles.statLabel}>Best Streak</Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Text style={styles.statValue}>{progress.lessons_completed}</Text>
                                        <Text style={styles.statLabel}>Lessons Done</Text>
                                    </View>
                                </View>
                            </Card>
                        )}

                        {/* Weak Spots */}
                        {summary?.weak_spots && summary.weak_spots.length > 0 && (
                            <Card>
                                <Text style={styles.cardTitle}>⚠️ Areas to Improve</Text>
                                <View style={styles.tagsContainer}>
                                    {summary.weak_spots.map((spot, i) => (
                                        <Tag key={i} label={spot} variant="warning" size="sm" style={styles.tag} />
                                    ))}
                                </View>
                            </Card>
                        )}

                        {/* Recent Activity */}
                        {history.length > 0 && (
                            <Card>
                                <Text style={styles.cardTitle}>🕒 Recent Activity</Text>
                                {history.slice(0, 5).map((item, i) => (
                                    <View key={i} style={styles.historyItem}>
                                        <View style={styles.historyHeader}>
                                            <Tag
                                                label={item.classification?.label || 'unknown'}
                                                variant={
                                                    item.classification?.label === 'safe' ? 'success' :
                                                        item.classification?.label === 'suspicious' ? 'warning' : 'error'
                                                }
                                                size="sm"
                                            />
                                            {item.was_correct !== null && item.was_correct !== undefined && (
                                                <Text style={styles.correctBadge}>
                                                    {item.was_correct ? '✅' : '❌'}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.historyMessage} numberOfLines={1}>
                                            {item.message}
                                        </Text>
                                        {item.timestamp && (
                                            <Text style={styles.historyTime}>
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </Card>
                        )}
                    </>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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
        marginBottom: spacing.lg,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
    },
    email: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    levelBadge: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    levelText: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.accent,
    },
    xpText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    errorText: {
        color: colors.error,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    cardTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        width: '50%',
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    accuracyBar: {
        height: 8,
        backgroundColor: colors.inputBackground,
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: spacing.md,
    },
    accuracyFill: {
        height: '100%',
        backgroundColor: colors.success,
        borderRadius: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    tag: {
        marginBottom: spacing.xs,
    },
    historyItem: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    correctBadge: {
        fontSize: 14,
    },
    historyMessage: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    historyTime: {
        fontSize: fontSize.xs,
        color: colors.textDim,
        marginTop: 4,
    },
});

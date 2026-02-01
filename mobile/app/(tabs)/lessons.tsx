// Lessons Screen - Full Implementation
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ScreenContainer, Card, Button, LoadingState } from '../../src/components';
import { useAuth } from '../../src/lib/auth';
import {
    getTodayLesson,
    completeLesson,
    getLessonProgress,
    TodayLesson,
    LessonProgress,
    LessonCompleteResponse,
    ApiError
} from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/theme/colors';

export default function LessonsScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lesson, setLesson] = useState<TodayLesson | null>(null);
    const [progress, setProgress] = useState<LessonProgress | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [quizResult, setQuizResult] = useState<LessonCompleteResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const [lessonData, progressData] = await Promise.all([
                getTodayLesson(),
                getLessonProgress(),
            ]);
            setLesson(lessonData);
            setProgress(progressData);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to load lessons');
            }
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
        loadData();
    }, [loadData]);

    const startQuiz = () => {
        if (lesson?.lesson?.quiz) {
            setSelectedAnswers(new Array(lesson.lesson.quiz.length).fill(-1));
            setShowQuiz(true);
            setQuizResult(null);
        }
    };

    const selectAnswer = (questionIndex: number, answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[questionIndex] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const submitQuiz = async () => {
        if (!lesson?.lesson?.lesson_id) return;

        setSubmitting(true);
        try {
            const result = await completeLesson(
                lesson.lesson.lesson_id,
                selectedAnswers
            );
            setQuizResult(result);
            // Refresh progress
            const newProgress = await getLessonProgress();
            setProgress(newProgress);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to submit quiz');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const allAnswered = selectedAnswers.every(a => a >= 0);

    if (loading) {
        return (
            <ScreenContainer>
                <LoadingState loading={true}><View /></LoadingState>
            </ScreenContainer>
        );
    }

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
                <Text style={styles.title}>Daily Lessons</Text>
                <Text style={styles.subtitle}>
                    Learn to identify phishing with daily micro-lessons
                </Text>

                {error && (
                    <Card>
                        <Text style={styles.errorText}>{error}</Text>
                        <Button title="Retry" onPress={loadData} variant="outline" size="sm" />
                    </Card>
                )}

                {/* Progress Card */}
                {progress && (
                    <Card>
                        <Text style={styles.cardTitle}>📊 Your Progress</Text>
                        <View style={styles.progressStats}>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{progress.xp_total}</Text>
                                <Text style={styles.statLabel}>XP</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={[styles.statValue, { color: colors.accent }]}>
                                    Lv.{progress.level}
                                </Text>
                                <Text style={styles.statLabel}>Level</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={[styles.statValue, { color: colors.warning }]}>
                                    {progress.streak_current}
                                </Text>
                                <Text style={styles.statLabel}>🔥 Streak</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{progress.lessons_completed}</Text>
                                <Text style={styles.statLabel}>Done</Text>
                            </View>
                        </View>

                        {/* Last 7 days */}
                        {progress.last_7_days && progress.last_7_days.length > 0 && (
                            <View style={styles.weekRow}>
                                {progress.last_7_days.map((day, i) => (
                                    <View key={i} style={styles.dayDot}>
                                        <View style={[
                                            styles.dot,
                                            day.completed && styles.dotCompleted
                                        ]} />
                                        <Text style={styles.dayLabel}>
                                            {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Card>
                )}

                {/* Quiz Result */}
                {quizResult && (
                    <Card variant="accent">
                        <Text style={styles.cardTitle}>
                            {quizResult.already_completed_today ? '✅ Already Completed!' : '🎉 Lesson Complete!'}
                        </Text>
                        <Text style={styles.resultMessage}>{quizResult.message}</Text>

                        <View style={styles.resultStats}>
                            <View style={styles.resultStat}>
                                <Text style={styles.resultValue}>{quizResult.score_percent}%</Text>
                                <Text style={styles.resultLabel}>Score</Text>
                            </View>
                            <View style={styles.resultStat}>
                                <Text style={[styles.resultValue, { color: colors.success }]}>
                                    +{quizResult.xp_earned}
                                </Text>
                                <Text style={styles.resultLabel}>XP Earned</Text>
                            </View>
                        </View>

                        <Button
                            title="Back to Lesson"
                            onPress={() => {
                                setShowQuiz(false);
                                setQuizResult(null);
                            }}
                            variant="outline"
                            fullWidth
                        />
                    </Card>
                )}

                {/* Today's Lesson */}
                {lesson && !showQuiz && !quizResult && (
                    <Card variant={lesson.already_completed ? 'default' : 'accent'}>
                        <View style={styles.lessonHeader}>
                            <Text style={styles.lessonEmoji}>📖</Text>
                            <View style={styles.lessonInfo}>
                                <Text style={styles.lessonTitle}>{lesson.lesson.title}</Text>
                                <Text style={styles.lessonTopic}>{lesson.lesson.topic}</Text>
                            </View>
                            {lesson.already_completed && (
                                <Text style={styles.completedBadge}>✅</Text>
                            )}
                        </View>

                        <Text style={styles.lessonContent}>{lesson.lesson.content}</Text>

                        <Button
                            title={lesson.already_completed ? "Review Quiz" : "Take Quiz"}
                            onPress={startQuiz}
                            fullWidth
                            variant={lesson.already_completed ? "outline" : "primary"}
                            style={styles.quizButton}
                        />
                    </Card>
                )}

                {/* Quiz */}
                {showQuiz && lesson?.lesson?.quiz && !quizResult && (
                    <Card>
                        <Text style={styles.cardTitle}>📝 Quiz</Text>

                        {lesson.lesson.quiz.map((q, qIndex) => (
                            <View key={qIndex} style={styles.questionContainer}>
                                <Text style={styles.questionText}>
                                    {qIndex + 1}. {q.question}
                                </Text>
                                {q.options.map((option, oIndex) => (
                                    <Button
                                        key={oIndex}
                                        title={option}
                                        onPress={() => selectAnswer(qIndex, oIndex)}
                                        variant={selectedAnswers[qIndex] === oIndex ? 'primary' : 'secondary'}
                                        size="sm"
                                        fullWidth
                                        style={styles.optionButton}
                                        textStyle={styles.optionText}
                                    />
                                ))}
                            </View>
                        ))}

                        <View style={styles.quizActions}>
                            <Button
                                title="Cancel"
                                onPress={() => setShowQuiz(false)}
                                variant="ghost"
                                style={styles.cancelButton}
                            />
                            <Button
                                title={submitting ? "Submitting..." : "Submit Quiz"}
                                onPress={submitQuiz}
                                loading={submitting}
                                disabled={!allAnswered}
                                style={styles.submitButton}
                            />
                        </View>
                    </Card>
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
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        marginBottom: spacing.lg,
    },
    errorText: {
        color: colors.error,
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
    },
    dayDot: {
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.inputBackground,
        marginBottom: 4,
    },
    dotCompleted: {
        backgroundColor: colors.success,
    },
    dayLabel: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
    },
    lessonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    lessonEmoji: {
        fontSize: 40,
        marginRight: spacing.md,
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    lessonTopic: {
        fontSize: fontSize.sm,
        color: colors.accent,
        marginTop: 2,
    },
    completedBadge: {
        fontSize: 24,
    },
    lessonContent: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        lineHeight: 24,
        marginBottom: spacing.md,
    },
    quizButton: {
        marginTop: spacing.sm,
    },
    questionContainer: {
        marginBottom: spacing.lg,
    },
    questionText: {
        fontSize: fontSize.md,
        fontWeight: '500',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    optionButton: {
        marginBottom: spacing.xs,
        justifyContent: 'flex-start',
    },
    optionText: {
        textAlign: 'left',
    },
    quizActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    cancelButton: {
        flex: 1,
    },
    submitButton: {
        flex: 2,
    },
    resultMessage: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    resultStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.lg,
    },
    resultStat: {
        alignItems: 'center',
    },
    resultValue: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
    },
    resultLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: 4,
    },
});

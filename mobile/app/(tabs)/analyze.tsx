// Analyze Screen - Full Implementation
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Card, Button, Input, Tag } from '../../src/components';
import { useAuth } from '../../src/lib/auth';
import { analyze, analyzePublic, AnalysisResponse, ApiError } from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/theme/colors';

export default function AnalyzeScreen() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [userGuess, setUserGuess] = useState<'phishing' | 'safe' | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResponse | null>(null);

    const handleAnalyze = async () => {
        if (!message.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let response: AnalysisResponse;

            if (user) {
                // Authenticated analysis - saves to history
                response = await analyze(message, user.uid, userGuess || undefined);
            } else {
                // Public analysis - no history
                response = await analyzePublic(message, userGuess || undefined);
            }

            setResult(response);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to analyze message. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const clearResult = () => {
        setResult(null);
        setMessage('');
        setUserGuess(null);
        setError(null);
    };

    const getLabelVariant = (label: string): 'success' | 'warning' | 'error' => {
        switch (label.toLowerCase()) {
            case 'safe':
                return 'success';
            case 'suspicious':
                return 'warning';
            case 'phishing':
                return 'error';
            default:
                return 'warning';
        }
    };

    return (
        <ScreenContainer keyboard>
            <Text style={styles.title}>Analyze Message</Text>
            <Text style={styles.subtitle}>
                Paste a suspicious email or message to check for phishing
            </Text>

            {!result ? (
                <>
                    <Input
                        label="Message Content"
                        placeholder="Paste your message here..."
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        numberOfLines={6}
                    />

                    {/* Optional: User prediction */}
                    <Text style={styles.guessLabel}>Your prediction (optional):</Text>
                    <View style={styles.guessButtons}>
                        <Button
                            title="🎣 Phishing"
                            onPress={() => setUserGuess(userGuess === 'phishing' ? null : 'phishing')}
                            variant={userGuess === 'phishing' ? 'primary' : 'outline'}
                            size="sm"
                            style={styles.guessButton}
                        />
                        <Button
                            title="✅ Safe"
                            onPress={() => setUserGuess(userGuess === 'safe' ? null : 'safe')}
                            variant={userGuess === 'safe' ? 'primary' : 'outline'}
                            size="sm"
                            style={styles.guessButton}
                        />
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <Button
                        title={loading ? "Analyzing..." : "Analyze"}
                        onPress={handleAnalyze}
                        fullWidth
                        loading={loading}
                        disabled={!message.trim()}
                        style={styles.analyzeButton}
                    />
                </>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Classification Result */}
                    <Card style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultTitle}>Classification</Text>
                            <Tag
                                label={result.classification.label.toUpperCase()}
                                variant={getLabelVariant(result.classification.label)}
                            />
                        </View>

                        <View style={styles.confidenceRow}>
                            <Text style={styles.confidenceLabel}>Confidence:</Text>
                            <Text style={styles.confidenceValue}>
                                {Math.round(result.classification.confidence * 100)}%
                            </Text>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${result.classification.confidence * 100}%`,
                                        backgroundColor: result.classification.label === 'safe'
                                            ? colors.success
                                            : result.classification.label === 'suspicious'
                                                ? colors.warning
                                                : colors.error
                                    }
                                ]}
                            />
                        </View>

                        {/* User guess feedback */}
                        {result.was_correct !== null && result.was_correct !== undefined && (
                            <View style={[
                                styles.feedbackBanner,
                                result.was_correct ? styles.feedbackCorrect : styles.feedbackIncorrect
                            ]}>
                                <Text style={styles.feedbackText}>
                                    {result.was_correct ? '✅ Your prediction was correct!' : '❌ Your prediction was incorrect'}
                                </Text>
                            </View>
                        )}
                    </Card>

                    {/* Reason Tags */}
                    {result.classification.reason_tags && result.classification.reason_tags.length > 0 && (
                        <Card>
                            <Text style={styles.sectionTitle}>Reason Tags</Text>
                            <View style={styles.tagsContainer}>
                                {result.classification.reason_tags.map((tag, i) => (
                                    <Tag key={i} label={tag} variant="accent" size="sm" style={styles.tag} />
                                ))}
                            </View>
                        </Card>
                    )}

                    {/* Explanation */}
                    <Card>
                        <Text style={styles.sectionTitle}>Explanation</Text>
                        <Text style={styles.explanationText}>{result.explanation}</Text>
                    </Card>

                    {/* AI Coach Response */}
                    {result.coach_response && (
                        <Card variant="accent">
                            <Text style={styles.sectionTitle}>🎓 AI Coach</Text>
                            <Text style={styles.coachText}>{result.coach_response}</Text>
                        </Card>
                    )}

                    {/* Similar Examples */}
                    {result.similar_examples && result.similar_examples.length > 0 && (
                        <Card>
                            <Text style={styles.sectionTitle}>Similar Examples</Text>
                            {result.similar_examples.slice(0, 3).map((example, i) => (
                                <View key={i} style={styles.exampleItem}>
                                    <View style={styles.exampleHeader}>
                                        <Tag
                                            label={example.label}
                                            variant={getLabelVariant(example.label)}
                                            size="sm"
                                        />
                                        <Text style={styles.similarityText}>
                                            {Math.round(example.similarity * 100)}% similar
                                        </Text>
                                    </View>
                                    <Text style={styles.exampleText} numberOfLines={2}>
                                        {example.text}
                                    </Text>
                                </View>
                            ))}
                        </Card>
                    )}

                    {/* Analyze Another */}
                    <Button
                        title="Analyze Another Message"
                        onPress={clearResult}
                        variant="outline"
                        fullWidth
                        style={styles.newAnalysisButton}
                    />
                </ScrollView>
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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
    guessLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.sm,
    },
    guessButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    guessButton: {
        flex: 1,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.sm,
        textAlign: 'center',
    },
    analyzeButton: {
        marginBottom: spacing.lg,
    },
    resultCard: {
        marginBottom: spacing.md,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    resultTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    confidenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    confidenceLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    confidenceValue: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.inputBackground,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    feedbackBanner: {
        padding: spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
    },
    feedbackCorrect: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    feedbackIncorrect: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    feedbackText: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        color: colors.text,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    tag: {
        marginBottom: spacing.xs,
    },
    explanationText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    coachText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        lineHeight: 24,
        fontStyle: 'italic',
    },
    exampleItem: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    exampleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    similarityText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    exampleText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    newAnalysisButton: {
        marginTop: spacing.md,
        marginBottom: spacing.xxl,
    },
});

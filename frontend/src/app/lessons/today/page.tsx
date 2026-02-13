"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTodayLesson, completeLesson, getLessonProgress } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Flame, Trophy, BookOpen, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

interface QuizQuestion {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

interface Lesson {
    lesson_id: string;
    title: string;
    topic: string;
    content: string[];
    quiz: QuizQuestion[];
}

interface LessonData {
    lesson: Lesson;
    date: string;
    already_completed: boolean;
    completion_score: number | null;
}

interface CompletionResult {
    score_percent: number;
    xp_earned: number;
    xp_total: number;
    level: number;
    streak_current: number;
    streak_best: number;
    already_completed_today: boolean;
    message: string;
    correct_answers: number[];
}

export default function TodayLessonPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [lessonData, setLessonData] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Quiz state
    const [currentSection, setCurrentSection] = useState<"content" | "quiz" | "results">("content");
    const [contentIndex, setContentIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<CompletionResult | null>(null);

    useEffect(() => {
        if (!authLoading && user) {
            fetchTodayLesson();
        }
    }, [authLoading, user]);

    const fetchTodayLesson = async () => {
        try {
            setLoading(true);
            const data = await getTodayLesson();
            setLessonData(data);

            if (data.already_completed) {
                setCurrentSection("results");
                // Fetch progress to show current stats
                const progress = await getLessonProgress();
                setResult({
                    score_percent: data.completion_score || 0,
                    xp_earned: 0,
                    xp_total: progress.xp_total,
                    level: progress.level,
                    streak_current: progress.streak_current,
                    streak_best: progress.streak_best,
                    already_completed_today: true,
                    message: "You have already completed your lesson for today!",
                    correct_answers: []
                });
            }
        } catch (err: unknown) {
            console.error("Error fetching lesson:", err);
            setError("Failed to load today's lesson");
        } finally {
            setLoading(false);
        }
    };

    const handleNextContent = () => {
        if (lessonData && contentIndex < lessonData.lesson.content.length - 1) {
            setContentIndex(contentIndex + 1);
        } else {
            setCurrentSection("quiz");
            setAnswers([]);
            setCurrentQuestion(0);
        }
    };

    const handleSelectAnswer = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        if (lessonData && currentQuestion < lessonData.lesson.quiz.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!lessonData || answers.length !== lessonData.lesson.quiz.length) {
            return;
        }

        try {
            setSubmitting(true);
            const result = await completeLesson(lessonData.lesson.lesson_id, answers);
            setResult(result);
            setCurrentSection("results");
        } catch (err: unknown) {
            console.error("Error submitting quiz:", err);
            setError("Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    };

    const getTopicColor = (topic: string): string => {
        const colors: Record<string, string> = {
            passwords: "bg-purple-500",
            "2fa": "bg-blue-500",
            links: "bg-red-500",
            attachments: "bg-orange-500",
            updates: "bg-green-500",
            devices: "bg-cyan-500",
        };
        return colors[topic] || "bg-gray-500";
    };

    if (loading || authLoading) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto py-10 px-4 max-w-3xl">
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !lessonData) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto py-10 px-4 max-w-3xl">
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive text-center">{error || "Lesson not found"}</p>
                            <div className="flex justify-center mt-4">
                                <Button onClick={() => router.push("/dashboard")}>
                                    Back to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    const lesson = lessonData.lesson;
    const quiz = lesson.quiz;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-10 px-4 max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{lesson.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={getTopicColor(lesson.topic)}>{lesson.topic}</Badge>
                            <span className="text-sm text-muted-foreground">Today&apos;s Lesson</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {currentSection === "content" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Section {contentIndex + 1} of {lesson.content.length}
                            </CardTitle>
                            <Progress value={((contentIndex + 1) / lesson.content.length) * 100} className="h-2" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg leading-relaxed">{lesson.content[contentIndex]}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleNextContent}>
                                {contentIndex < lesson.content.length - 1 ? "Next" : "Start Quiz"}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Quiz Section */}
                {currentSection === "quiz" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Question {currentQuestion + 1} / {quiz.length}
                            </CardTitle>
                            <Progress value={((currentQuestion + 1) / quiz.length) * 100} className="h-2" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium mb-4">{quiz[currentQuestion].question}</p>
                            <div className="space-y-3">
                                {quiz[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectAnswer(idx)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[currentQuestion] === idx
                                            ? "border-primary bg-primary/10"
                                            : "border-muted hover:border-primary/50"
                                            }`}
                                    >
                                        <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={handlePrevQuestion}
                                disabled={currentQuestion === 0}
                            >
                                Previous
                            </Button>

                            {currentQuestion < quiz.length - 1 ? (
                                <Button
                                    onClick={handleNextQuestion}
                                    disabled={answers[currentQuestion] === undefined}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmitQuiz}
                                    disabled={answers.length !== quiz.length || answers.some(a => a === undefined) || submitting}
                                >
                                    {submitting ? "Submitting..." : "Submit"}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                )}

                {/* Results Section */}
                {currentSection === "results" && result && (
                    <div className="space-y-6">
                        {/* Score Card */}
                        <Card className={result.already_completed_today ? "border-emerald-500" : "border-green-500"}>
                            <CardHeader className="text-center pb-2">
                                {!result.already_completed_today ? (
                                    <div className="flex flex-col items-center">
                                        <div className="text-6xl mb-2">🎉</div>
                                        <CardTitle className="text-2xl">{result.message}</CardTitle>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="mb-2"><CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" /></div>
                                        <CardTitle className="text-xl">{result.message}</CardTitle>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {result.score_percent}%
                                </div>
                                <p className="text-muted-foreground">Quiz Score</p>

                                {!result.already_completed_today && (
                                    <div className="mt-4 p-4 bg-primary/10 rounded-lg inline-block">
                                        <div className="text-2xl font-bold text-primary">+{result.xp_earned} XP</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                                    <div className="text-2xl font-bold">{result.streak_current}</div>
                                    <p className="text-sm text-muted-foreground">Day Streak</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                                    <div className="text-2xl font-bold">{result.xp_total}</div>
                                    <p className="text-sm text-muted-foreground">Total XP</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Sparkles className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                                    <div className="text-2xl font-bold">Lv. {result.level}</div>
                                    <p className="text-sm text-muted-foreground">Level</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Show correct answers if not already completed */}
                        {!result.already_completed_today && result.correct_answers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Answers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {quiz.map((q, idx) => (
                                        <div key={idx} className="p-4 rounded-lg bg-muted/50">
                                            <p className="font-medium mb-2">{q.question}</p>
                                            <div className="flex items-center gap-2">
                                                {answers[idx] === result.correct_answers[idx] ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                                <span>
                                                    Your answer: {String.fromCharCode(65 + answers[idx])}
                                                    {answers[idx] !== result.correct_answers[idx] && (
                                                        <span className="text-green-600 ml-2">
                                                            (Correct: {String.fromCharCode(65 + result.correct_answers[idx])})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">{q.explanation}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Back to Dashboard */}
                        <div className="text-center">
                            <Link href="/dashboard">
                                <Button size="lg">Back to Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

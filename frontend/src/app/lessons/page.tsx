'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { getLessonProgress, getTodayLesson, getLessonsList } from '@/lib/api';
import { BookOpen, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface LessonMeta {
    lesson_id: string;
    title: string;
    topic: string;
}

interface LessonProgress {
    xp_total: number;
    level: number;
    streak_current: number;
    streak_best: number;
    lessons_completed: number;
    lessons_completed_list?: Array<{ lesson_id: string; date: string; score_percent: number }>;
}

interface TodayLessonData {
    lesson: LessonMeta;
    date: string;
    already_completed: boolean;
}

export default function LessonsPage() {
    const { user } = useAuth();
    const [todayLesson, setTodayLesson] = useState<TodayLessonData | null>(null);
    const [lessonsList, setLessonsList] = useState<LessonMeta[]>([]);
    const [progress, setProgress] = useState<LessonProgress | null>(null);
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    const [lessonData, progressData, listData] = await Promise.all([
                        getTodayLesson().catch(() => null),
                        getLessonProgress().catch(() => null),
                        getLessonsList().catch(() => []),
                    ]);
                    setTodayLesson(lessonData);
                    setProgress(progressData);
                    setLessonsList(listData);

                    // Build set of completed lesson IDs
                    if (progressData?.lessons_completed_list) {
                        setCompletedIds(new Set(progressData.lessons_completed_list.map((l: { lesson_id: string }) => l.lesson_id)));
                    }
                } catch (error) {
                    console.error('Error fetching lessons data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    Loading lessons...
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Daily Lessons
                </h1>
                <p className="text-muted-foreground mb-8">
                    Complete daily micro-lessons to improve your security awareness and earn XP.
                </p>

                {/* Today's Lesson Card */}
                {todayLesson && (
                    <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Today&apos;s Lesson
                                </CardTitle>
                                {todayLesson.already_completed && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Completed
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="text-lg font-medium">
                                {todayLesson.lesson.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary">{todayLesson.lesson.topic}</Badge>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-4 w-4" /> ~3 min
                                    </span>
                                </div>
                                <Link href="/lessons/today">
                                    <Button size="lg">
                                        {todayLesson.already_completed ? 'Review' : 'Start'} Lesson
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Progress Summary */}
                {progress && (
                    <div className="grid gap-4 md:grid-cols-4 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-primary">{progress.lessons_completed}</div>
                                <p className="text-sm text-muted-foreground">Lessons Completed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-purple-500">{progress.xp_total}</div>
                                <p className="text-sm text-muted-foreground">Total XP</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-orange-500">{progress.streak_current}</div>
                                <p className="text-sm text-muted-foreground">Day Streak</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-blue-500">Lv. {progress.level}</div>
                                <p className="text-sm text-muted-foreground">Level</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* All Lessons */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Lessons</CardTitle>
                        <CardDescription>
                            Browse all available cybersecurity lessons. New lesson unlocks daily.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            {lessonsList.map((lesson) => (
                                <div
                                    key={lesson.lesson_id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        {completedIds.has(lesson.lesson_id) ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <div>
                                            <p className="font-medium">{lesson.title}</p>
                                            <p className="text-sm text-muted-foreground">{lesson.topic}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}

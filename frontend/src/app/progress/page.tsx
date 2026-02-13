'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getLessonProgress, getUserSummary, getUserProfile } from '@/lib/api';
import { Flame, Trophy, Sparkles, Target, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface LessonProgress {
    xp_total: number;
    level: number;
    streak_current: number;
    streak_best: number;
    last_7_days: Array<{ date: string; day_name: string; completed: boolean }>;
    lessons_completed: number;
}

interface CategoryStats {
    seen: number;
    mistakes: number;
}

interface AnalysisSummary {
    total_analyzed: number;
    accuracy: number;
    categories_seen: number;
}

interface UserProfile {
    total_messages: number;
    correct_guesses: number;
    by_category: Record<string, CategoryStats>;
}

export default function ProgressPage() {
    const { user } = useAuth();
    const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
    const [summary, setSummary] = useState<AnalysisSummary | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    const [progressData, summaryData, profileData] = await Promise.all([
                        getLessonProgress().catch(() => null),
                        getUserSummary(user.uid).catch(() => null),
                        getUserProfile(user.uid).catch(() => null),
                    ]);
                    setLessonProgress(progressData);
                    setSummary(summaryData);
                    setProfile(profileData);
                } catch (error) {
                    console.error('Error fetching progress data:', error);
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
                    Loading progress...
                </div>
            </ProtectedRoute>
        );
    }

    const categoryData =
        profile?.by_category
            ? Object.entries(profile.by_category).map(
                ([name, stats]: [string, CategoryStats]) => ({
                    name: name.replace('_', ' '),
                    seen: stats.seen,
                    mistakes: stats.mistakes,
                }),
            )
            : [];

    const totalMessages = profile?.total_messages || 0;
    const correctGuesses = profile?.correct_guesses || 0;
    const incorrectGuesses = Math.max(totalMessages - correctGuesses, 0);

    const performanceData =
        totalMessages > 0
            ? [
                { name: 'Correct', value: correctGuesses, color: '#22c55e' },
                { name: 'Incorrect', value: incorrectGuesses, color: '#ef4444' },
            ]
            : [];

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Progress & Stats
                </h1>
                <p className="text-muted-foreground mb-8">
                    Track your learning progress, streaks, and phishing detection performance.
                </p>

                {/* Gamification Stats */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-orange-500">
                                {lessonProgress?.streak_current || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Day Streak</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-yellow-500">
                                {lessonProgress?.streak_best || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Best Streak</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-purple-500">
                                {lessonProgress?.xp_total || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Total XP</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-blue-500">
                                Lv. {lessonProgress?.level || 1}
                            </div>
                            <p className="text-sm text-muted-foreground">Level</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 7-Day Streak Calendar */}
                {lessonProgress?.last_7_days && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Last 7 Days</CardTitle>
                            <CardDescription>Your daily lesson completion streak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between gap-2">
                                {lessonProgress.last_7_days.map((day, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${day.completed
                                                ? 'bg-green-500 text-white'
                                                : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {day.completed ? <CheckCircle2 className="h-6 w-6" /> : day.day_name.charAt(0)}
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-2">
                                            {day.day_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analysis Stats */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Total Analyzed</span>
                            </div>
                            <div className="text-2xl font-bold mt-2">{summary?.total_analyzed || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Accuracy</span>
                            </div>
                            <div className="text-2xl font-bold mt-2">{summary?.accuracy || 0}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Categories Seen</span>
                            </div>
                            <div className="text-2xl font-bold mt-2">{summary?.categories_seen || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Lessons Done</span>
                            </div>
                            <div className="text-2xl font-bold mt-2">{lessonProgress?.lessons_completed || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Performance by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance by Category</CardTitle>
                            <CardDescription>Your detection accuracy across threat types</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {categoryData.length > 0 ? (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="seen" fill="#3b82f6" name="Total Seen" />
                                            <Bar dataKey="mistakes" fill="#ef4444" name="Mistakes" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md text-sm text-muted-foreground">
                                    No category data yet. Analyze some messages first.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Accuracy Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Accuracy</CardTitle>
                            <CardDescription>Correct vs incorrect identifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {performanceData.length > 0 ? (
                                <>
                                    <div className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={performanceData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {performanceData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-6 mt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <span className="text-sm">Correct ({correctGuesses})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span className="text-sm">Incorrect ({incorrectGuesses})</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md text-sm text-muted-foreground">
                                    Not enough data to calculate accuracy yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}

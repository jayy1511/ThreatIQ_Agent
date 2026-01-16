'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { getUserSummary, getUserProfile, getLessonProgress, getTodayLesson } from '@/lib/api';
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
import { Shield, Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Flame, BookOpen, Trophy, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import GmailIntegration from '@/components/GmailIntegration';

interface LessonProgress {
  xp_total: number;
  level: number;
  streak_current: number;
  streak_best: number;
  last_lesson_completed_date: string | null;
  last_7_days: Array<{ date: string; day_name: string; completed: boolean }>;
  lessons_completed: number;
}

interface TodayLessonData {
  lesson: { lesson_id: string; title: string; topic: string };
  date: string;
  already_completed: boolean;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [todayLesson, setTodayLesson] = useState<TodayLessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gmailToast, setGmailToast] = useState<'connected' | 'error' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gmailParam = searchParams.get('gmail');
    if (gmailParam === 'connected') {
      setGmailToast('connected');
      setTimeout(() => setGmailToast(null), 5000);
    } else if (gmailParam === 'error') {
      setGmailToast('error');
      setTimeout(() => setGmailToast(null), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [summaryData, profileData, progressData, lessonData] = await Promise.all([
            getUserSummary(user.uid),
            getUserProfile(user.uid),
            getLessonProgress().catch(() => null),
            getTodayLesson().catch(() => null),
          ]);
          setSummary(summaryData);
          setProfile(profileData);
          setLessonProgress(progressData);
          setTodayLesson(lessonData);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (loading || authLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          Loading dashboard...
        </div>
      </ProtectedRoute>
    );
  }

  const categoryData =
    profile?.by_category
      ? Object.entries(profile.by_category).map(
        ([name, stats]: [string, any]) => ({
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
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Security Dashboard
        </h1>

        {gmailToast && (
          <div className="mb-6">
            {gmailToast === 'connected' ? (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Gmail connected successfully! You can now triage your inbox.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to connect Gmail. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Daily Lesson & Streak Section */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Daily Lesson Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Daily Lesson
                </CardTitle>
                {todayLesson?.already_completed && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
              {todayLesson && (
                <CardDescription className="text-base font-medium">
                  {todayLesson.lesson.title}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {todayLesson ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {todayLesson.lesson.topic}
                    </span>
                    <span className="text-sm text-muted-foreground">~3 min</span>
                  </div>
                  <Link href="/lessons/today">
                    <Button className="w-full" size="lg">
                      {todayLesson.already_completed ? "Review Lesson" : "Start Lesson"}
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading...</p>
              )}
            </CardContent>
          </Card>

          {/* Streak & XP Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessonProgress ? (
                <div className="space-y-4">
                  {/* Streak and XP */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-500">
                        {lessonProgress.streak_current}
                      </div>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-500">
                        {lessonProgress.xp_total}
                      </div>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">
                        Nv. {lessonProgress.level}
                      </div>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </div>
                  </div>

                  {/* 7-day streak visualization */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Last 7 days</p>
                    <div className="flex justify-between gap-1">
                      {lessonProgress.last_7_days.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${day.completed
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {day.completed ? '✓' : day.day_name.charAt(0)}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {day.day_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best streak */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Best Streak</span>
                    <span className="font-medium flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      {lessonProgress.streak_best} days
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No progress yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gmail Integration Section */}
        <div className="mb-8">
          <GmailIntegration />
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Analyzed"
            value={summary?.total_analyzed || 0}
            icon={<Shield className="h-4 w-4 text-muted-foreground" />}
            description="Messages processed"
          />
          <StatCard
            title="Accuracy Score"
            value={`${summary?.accuracy || 0}%`}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
            description="Detection rate"
          />
          <StatCard
            title="Categories Seen"
            value={summary?.categories_seen || 0}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            description="Threat types encountered"
          />
          <StatCard
            title="Weak Spots"
            value={summary?.weak_spots?.length || 0}
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            description="Areas for improvement"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW TAB ===== */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Performance Chart */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Performance by Category</CardTitle>
                  <CardDescription>
                    Your detection accuracy across different threat types.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {categoryData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="seen"
                            fill="#3b82f6"
                            name="Total Seen"
                          />
                          <Bar
                            dataKey="mistakes"
                            fill="#ef4444"
                            name="Mistakes"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md text-sm text-muted-foreground">
                      No category performance data yet. Analyze a few messages
                      to see stats here.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accuracy Pie Chart */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Overall Accuracy</CardTitle>
                  <CardDescription>
                    Ratio of correct identifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceData.length > 0 ? (
                    <>
                      <div className="h-[300px]">
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
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm text-muted-foreground">
                            Correct
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm text-muted-foreground">
                            Incorrect
                          </span>
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
          </TabsContent>

          {/* ===== ANALYTICS TAB ===== */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Weak Spots Analysis</CardTitle>
                <CardDescription>
                  Categories where you need more practice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.weak_spots?.length > 0 ? (
                  <div className="space-y-4">
                    {summary.weak_spots.map((spot: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center p-4 border rounded-lg bg-red-50 dark:bg-red-900/10"
                      >
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-4" />
                        <div>
                          <h4 className="font-semibold capitalize">
                            {spot.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            High mistake rate detected in this category.
                            Recommended: Review examples in the Analyze tool.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Shield className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold">
                      No Weak Spots Detected!
                    </h3>
                    <p className="text-muted-foreground">
                      Great job – you&apos;re identifying threats accurately
                      across all categories.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { LogOut, Flame, Trophy, Zap, Award, Calendar, BookOpen, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLessonProgress, getRecentLessons, getUserHistory } from '@/lib/api';

import ProtectedRoute from "@/components/ProtectedRoute"

interface ProgressData {
  xp_total: number;
  level: number;
  streak_current: number;
  streak_best: number;
  last_7_days: Array<{ date: string; day_name: string; completed: boolean }>;
  lessons_completed: number;
}

interface RecentLesson {
  lesson_id: string;
  date: string;
  score_percent: number;
  xp_earned: number;
  lesson_title: string;
  lesson_topic: string;
}

interface HistoryItem {
  id: string;
  message: string;
  classification: {
    label: string;
    confidence: number;
  };
  timestamp: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const [progressData, lessonsData, historyData] = await Promise.all([
          getLessonProgress(),
          getRecentLessons(5),
          getUserHistory(user.uid)
        ]);

        setProgress(progressData);
        setRecentLessons(lessonsData.recent_completions || []);
        setRecentAnalyses(historyData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-10 px-4 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const getClassificationColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'phishing':
        return 'destructive';
      case 'safe':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and cybersecurity journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Progress & Lessons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gamification Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progress?.streak_current || 0} days</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep it going!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progress?.streak_best || 0} days</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personal record
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                  <Zap className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progress?.xp_total || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Experience points
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Level</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progress?.level || 1}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {progress ? `${100 - (progress.xp_total % 100)} XP to next` : 'Start learning!'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 7-Day Streak Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Last 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between gap-2">
                  {progress?.last_7_days?.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all ${day.completed
                            ? 'bg-primary text-primary-foreground'
                            : 'border-2 border-muted text-muted-foreground'
                          }`}
                      >
                        {day.completed ? '✓' : day.day_name.charAt(0)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {day.day_name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Lesson Completions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Lessons
                </CardTitle>
                <CardDescription>Your latest completed lessons</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLessons.length > 0 ? (
                  <div className="space-y-3">
                    {recentLessons.map((lesson, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{lesson.lesson_title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(lesson.date).toLocaleDateString()} • {lesson.lesson_topic}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {lesson.score_percent}%
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              +{lesson.xp_earned} XP
                            </Badge>
                          </div>
                        </div>
                        {i < recentLessons.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No lessons completed yet. Start your first lesson today!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Analyses & Account */}
          <div className="space-y-6">
            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Recent Analyses
                </CardTitle>
                <CardDescription>Your latest threat assessments</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAnalyses.length > 0 ? (
                  <div className="space-y-3">
                    {recentAnalyses.map((item, i) => (
                      <div key={i}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getClassificationColor(item.classification?.label)} className="text-xs capitalize">
                                {item.classification?.label || 'Unknown'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {item.classification?.confidence ? `${Math.round(item.classification.confidence * 100)}%` : ''}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.message?.substring(0, 60)}...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown'}
                            </p>
                          </div>
                        </div>
                        {i < recentAnalyses.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No analyses yet. Try analyzing a message!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Account Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.photoURL || "https://github.com/shadcn.png"} alt="@user" />
                    <AvatarFallback>{user?.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Provider: </span>
                    <span className="font-medium">{user?.providerData?.[0]?.providerId || 'N/A'}</span>
                  </div>
                </div>

                <Button variant="destructive" onClick={handleLogout} className="w-full" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

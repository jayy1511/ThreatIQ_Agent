'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { getUserSummary, getUserProfile } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Auth check handled by ProtectedRoute
    if (user) {
      const fetchData = async () => {
        try {
          const [summaryData, profileData] = await Promise.all([
            getUserSummary(user.uid),
            getUserProfile(user.uid)
          ]);
          setSummary(summaryData);
          setProfile(profileData);
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
    return <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>;
  }

  // Prepare chart data
  const categoryData = profile?.by_category ? Object.entries(profile.by_category).map(([name, stats]: [string, any]) => ({
    name: name.replace('_', ' '),
    seen: stats.seen,
    mistakes: stats.mistakes
  })) : [];

  const performanceData = [
    { name: 'Correct', value: profile?.correct_guesses || 0, color: '#22c55e' },
    { name: 'Incorrect', value: (profile?.total_messages || 0) - (profile?.correct_guesses || 0), color: '#ef4444' }
  ];

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Security Dashboard</h1>

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

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Performance Chart */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Performance by Category</CardTitle>
                  <CardDescription>Your detection accuracy across different threat types.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
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
                </CardContent>
              </Card>

              {/* Accuracy Pie Chart */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Overall Accuracy</CardTitle>
                  <CardDescription>Ratio of correct identifications.</CardDescription>
                </CardHeader>
                <CardContent>
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-muted-foreground">Correct</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-muted-foreground">Incorrect</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                      <div key={i} className="flex items-center p-4 border rounded-lg bg-red-50 dark:bg-red-900/10">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-4" />
                        <div>
                          <h4 className="font-semibold capitalize">{spot.replace('_', ' ')}</h4>
                          <p className="text-sm text-muted-foreground">
                            High mistake rate detected in this category. Recommended: Review examples in the Analyze tool.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Shield className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold">No Weak Spots Detected!</h3>
                    <p className="text-muted-foreground">Great job! You're identifying threats accurately across all categories.</p>
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

function StatCard({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) {
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

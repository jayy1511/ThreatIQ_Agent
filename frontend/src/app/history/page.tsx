'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserHistory } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

type HistoryItem = {
  id?: string;
  message: string;
  classification?: {
    label?: string;
    confidence?: number;
  };
  was_correct?: boolean | null;
  session_id?: string;
  timestamp?: string | null;
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const data = await getUserHistory(user.uid);
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading history:', err);
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading || authLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          Loading history...
        </div>
      </ProtectedRoute>
    );
  }

  const sorted = [...history].sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground mt-2">
            Review your past analyses and see how your detection skills evolve over time.
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-500/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Error
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {sorted.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No history available yet. Analyze a few messages to see them listed here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sorted.map((item) => {
              const label = item.classification?.label ?? 'unknown';
              const confidence =
                item.classification?.confidence != null
                  ? Math.round(item.classification.confidence * 100)
                  : null;

              const isPhishing = label === 'phishing';
              const isSafe = label === 'safe';

              const ts = item.timestamp ? new Date(item.timestamp) : null;
              const timeLabel = ts ? ts.toLocaleString() : 'Unknown time';

              return (
                <Card key={item.id ?? timeLabel + item.message}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold">
                        {item.message?.slice(0, 80) || 'No message text'}
                        {item.message && item.message.length > 80 && '…'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{timeLabel}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          isPhishing ? 'destructive' : isSafe ? 'outline' : 'secondary'
                        }
                        className="uppercase"
                      >
                        {label}
                      </Badge>
                      {confidence !== null && (
                        <span className="text-xs text-muted-foreground">
                          Confidence: {confidence}%
                        </span>
                      )}
                      {item.was_correct != null && (
                        <span className="flex items-center gap-1 text-xs">
                          {item.was_correct ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">You were right</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span className="text-red-500">Your guess was incorrect</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.message && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {item.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

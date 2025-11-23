'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Zap, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { analyzePublicMessage } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();

  const handleAnalyze = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const data = await analyzePublicMessage(message, 'unclear', user ? user.uid : 'guest');
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                New: AI-Powered Detection
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                Detect Phishing with <span className="text-primary">AI Precision</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                ThreatIQ uses advanced multi-agent AI to analyze messages, identify threats, and teach you how to spot scams before they happen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/analyze">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    Start Analysis <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Analysis Card */}
            <Card className="w-full shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Scan
                </CardTitle>
                <CardDescription>
                  Paste a suspicious message to check it instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste email or SMS content here..."
                  className="min-h-[120px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={loading || !message.trim()}
                >
                  {loading ? 'Analyzing...' : 'Scan Now'}
                </Button>

                {result && (
                  <div className={`mt-4 p-4 rounded-lg border ${result.classification.label === 'phishing' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                      result.classification.label === 'safe' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                        'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {result.classification.label === 'phishing' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : result.classification.label === 'safe' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="font-bold capitalize text-lg">
                        {result.classification.label}
                      </span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {Math.round(result.classification.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.classification.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why ThreatIQ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our multi-agent system doesn't just detect threats—it explains them, helping you build long-term security awareness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Multi-Agent AI"
              description="Five specialized AI agents work together to analyze content, verify evidence, and provide accurate verdicts."
            />
            <FeatureCard
              icon={<Lock className="h-10 w-10 text-primary" />}
              title="Personalized Coaching"
              description="Get tailored tips and quizzes based on your specific weak spots and learning history."
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-primary" />}
              title="Real-time Evidence"
              description="See similar real-world phishing examples to understand exactly why a message is suspicious."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-background border-none shadow-none">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

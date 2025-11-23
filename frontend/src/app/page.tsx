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
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
              New: AI-Powered Detection
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">
              Detect Phishing with <span className="text-primary">AI Precision</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ThreatIQ uses advanced multi-agent AI to analyze messages, identify threats, and teach you how to spot scams before they happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analyze">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-lg h-12 px-8">
                  Start Analysis <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
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

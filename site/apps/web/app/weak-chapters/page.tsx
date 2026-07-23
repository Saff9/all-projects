'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Target, TrendingDown } from 'lucide-react';

export default function WeakChaptersPage() {
  const weakChapters = [
    { 
      id: '1', 
      name: 'Chemical Bonding', 
      subject: 'Chemistry',
      accuracy: 45,
      attempts: 20 
    },
    { 
      id: '2', 
      name: 'Thermodynamics', 
      subject: 'Physics',
      accuracy: 52,
      attempts: 25 
    },
    { 
      id: '3', 
      name: 'Integration', 
      subject: 'Mathematics',
      accuracy: 48,
      attempts: 18 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Weak Chapters</h1>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              These chapters need more practice. Focus on improving your accuracy in these areas.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {weakChapters.map((chapter) => (
            <Card key={chapter.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{chapter.name}</CardTitle>
                  <span className="text-sm text-muted-foreground">{chapter.subject}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="text-lg font-semibold">{chapter.accuracy}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Attempts</p>
                      <p className="text-lg font-semibold">{chapter.attempts}</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/pyqs?chapter=${chapter.id}&mode=practice`}>
                    Practice Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

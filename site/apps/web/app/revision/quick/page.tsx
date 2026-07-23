'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Zap, Clock, Target } from 'lucide-react';

export default function QuickRevisionPage() {
  const topics = [
    { id: '1', name: 'Chemistry', chapters: 10, estimatedMinutes: 30 },
    { id: '2', name: 'Physics', chapters: 8, estimatedMinutes: 25 },
    { id: '3', name: 'Biology', chapters: 12, estimatedMinutes: 35 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/revision">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Quick Revision</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  {topic.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    {topic.chapters} chapters
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    ~{topic.estimatedMinutes} minutes
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/pyqs?subject=${topic.id}&mode=revision`}>
                    Start Revision
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

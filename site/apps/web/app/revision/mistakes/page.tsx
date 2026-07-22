'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, BookOpen, RotateCcw } from 'lucide-react';

export default function MistakesPage() {
  const [mistakes] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/revision">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Mistake Notebook</h1>
        </div>

        {mistakes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">No Mistakes Yet!</h2>
              <p className="text-muted-foreground mb-4">
                Keep practicing to build your mistake notebook
              </p>
              <Button asChild>
                <Link href="/pyqs">Start Practice</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mistakes.map((mistake: any) => (
              <Card key={mistake.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{mistake.question?.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your Answer: {mistake.userAnswer?.join(', ')}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Correct Answer: {mistake.correctAnswer?.join(', ')}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Practice Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

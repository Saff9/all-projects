'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Calculator, BookOpen } from 'lucide-react';

export default function FormulasPage() {
  const formulas = [
    { subject: 'Physics', chapters: ['Mechanics', 'Thermodynamics', 'Electromagnetism'] },
    { subject: 'Chemistry', chapters: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'] },
    { subject: 'Mathematics', chapters: ['Calculus', 'Algebra', 'Trigonometry'] },
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
          <h1 className="text-2xl font-bold">Important Formulas</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {formulas.map((subject) => (
            <Card key={subject.subject}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  {subject.subject}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {subject.chapters.map((chapter) => (
                    <li key={chapter} className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      {chapter}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href={`/resources?subject=${subject.subject}&type=formulas`}>
                    View Formulas
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

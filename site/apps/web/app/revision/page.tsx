import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { NotebookPen, RefreshCw, BookOpen } from 'lucide-react';

export default function RevisionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12">
          <div className="container">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold">Revision Mode</h1>
              <p className="mt-4 text-muted-foreground">
                Spaced repetition and smart revision tools
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <NotebookPen className="h-5 w-5 text-destructive" />
                    Mistake Notebook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Review and learn from your mistakes with spaced repetition
                  </p>
                  <div className="text-sm mb-4">
                    <span className="font-semibold">23</span> mistakes to review
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/revision/mistakes">Review Now</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-chemistry" />
                    Quick Revision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Quick revision quizzes for completed chapters
                  </p>
                  <div className="text-sm mb-4">
                    <span className="font-semibold">12</span> chapters due
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/revision/quick">Start Revision</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-physics" />
                    Formula Sheets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Quick reference formula sheets for all subjects
                  </p>
                  <div className="text-sm mb-4">
                    <span className="font-semibold">150+</span> formulas
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/revision/formulas">View Formulas</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Timer, Users, Trophy } from 'lucide-react';

const mockTests = [
  {
    id: 1,
    title: 'NEET 2024 Full Test',
    type: 'NEET',
    duration: '3h 20min',
    questions: 200,
    attempts: 1250,
  },
  {
    id: 2,
    title: 'JEE Main Full Test',
    type: 'JEE Main',
    duration: '3h',
    questions: 90,
    attempts: 980,
  },
  {
    id: 3,
    title: 'Physics Chapter Test',
    type: 'Chapter',
    duration: '45min',
    questions: 30,
    attempts: 560,
  },
];

export default function MockTestsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12">
          <div className="container">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold">Mock Tests</h1>
              <p className="mt-4 text-muted-foreground">
                Real exam simulation with detailed analytics
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Timer className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">100+</p>
                    <p className="text-sm text-muted-foreground">Mock Tests</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-lg bg-chemistry/10">
                    <Users className="h-6 w-6 text-chemistry" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">10K+</p>
                    <p className="text-sm text-muted-foreground">Test Attempts</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-lg bg-biology/10">
                    <Trophy className="h-6 w-6 text-biology" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">95%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test List */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Available Tests</h2>
              <div className="grid gap-4">
                {mockTests.map((test) => (
                  <Card key={test.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-6">
                      <div>
                        <p className="font-semibold text-lg">{test.title}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{test.type}</span>
                          <span>•</span>
                          <span>{test.duration}</span>
                          <span>•</span>
                          <span>{test.questions} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {test.attempts} attempts
                        </span>
                        <Button asChild>
                          <Link href={`/mock-tests/${test.id}` as any}>Start Test</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

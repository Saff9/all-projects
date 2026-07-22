import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Search, Filter, FileText } from 'lucide-react';

export default function PYQsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12">
          <div className="container">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold">Previous Year Questions</h1>
              <p className="mt-4 text-muted-foreground">
                Practice 50,000+ PYQs from NEET, JEE Main & Advanced
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Exam Type Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-biology">NEET</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    20,000+ NEET PYQs from 2007-2024
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/pyqs?exam=NEET">Practice NEET PYQs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-physics">JEE Main</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    18,000+ JEE Main PYQs from 2002-2024
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/pyqs?exam=JEE_MAIN">Practice JEE Main PYQs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-mathematics">JEE Advanced</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    12,000+ JEE Advanced PYQs from 2002-2024
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/pyqs?exam=JEE_ADVANCED">Practice JEE Advanced PYQs</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent PYQs */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent PYQs</h2>
              <div className="grid gap-4">
                {[2024, 2023, 2022, 2021].map((year) => (
                  <Card key={year} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{year} Papers</p>
                          <p className="text-sm text-muted-foreground">
                            All subjects • All sessions
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/pyqs?year=${year}`}>View Papers</Link>
                      </Button>
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

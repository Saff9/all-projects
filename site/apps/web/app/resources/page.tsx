import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, FileText, Video, Calculator } from 'lucide-react';

const resources = [
  {
    title: 'NCERT PDFs',
    description: 'Download NCERT textbooks for Physics, Chemistry, Maths & Biology',
    icon: BookOpen,
    href: '/resources/ncert',
    color: 'bg-physics',
  },
  {
    title: 'Formula Sheets',
    description: 'Quick revision formula sheets for all subjects',
    icon: Calculator,
    href: '/resources/formula-sheets',
    color: 'bg-chemistry',
  },
  {
    title: 'Syllabus',
    description: 'Complete NEET & JEE syllabus with weightage',
    icon: FileText,
    href: '/resources/syllabus',
    color: 'bg-mathematics',
  },
  {
    title: 'Video Lectures',
    description: 'Free video lectures from top educators',
    icon: Video,
    href: '/resources/videos',
    color: 'bg-biology',
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12">
          <div className="container">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold">Study Resources</h1>
              <p className="mt-4 text-muted-foreground">
                Free resources to boost your preparation
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <Card key={resource.title} className="hover:shadow-lg transition-shadow">
                  <div className={`h-2 ${resource.color}`} />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <resource.icon className="h-5 w-5" />
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {resource.description}
                    </p>
                    <Button asChild>
                      <Link href={resource.href}>Access Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

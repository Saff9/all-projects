'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { 
  BookOpen, 
  FileText, 
  Timer, 
  Brain, 
  TrendingUp, 
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  RefreshCw,
  Zap,
  Quote,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!start) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);
  
  return count;
}

// Intersection observer hook
function useInView(threshold: number = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return { ref, inView };
}

const features = [
  {
    icon: Target,
    title: 'Smart Dashboard',
    description: 'Track your progress, identify weak areas, and get personalized recommendations.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: FileText,
    title: 'Chapter-wise PYQs',
    description: 'Practice 50,000+ previous year questions organized by chapter and topic.',
    color: 'text-physics bg-physics/10',
  },
  {
    icon: Timer,
    title: 'Mock Tests with Analytics',
    description: 'Real exam simulation with detailed analytics and performance insights.',
    color: 'text-chemistry bg-chemistry/10',
  },
  {
    icon: BookOpen,
    title: 'Error Notebook',
    description: 'Track and learn from your mistakes with our intelligent error tracking system.',
    color: 'text-biology bg-biology/10',
  },
  {
    icon: RefreshCw,
    title: 'Revision Mode',
    description: 'Spaced repetition system to help you remember concepts longer.',
    color: 'text-mathematics bg-mathematics/10',
  },
  {
    icon: Brain,
    title: 'AI Doubt Helper',
    description: 'Get instant doubt resolution with AI-powered explanations.',
    color: 'text-primary bg-primary/10',
  },
];

const exams = [
  {
    name: 'NEET',
    description: 'Medical Entrance Exam',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    color: 'bg-biology',
    href: '/neet',
    stats: '35,000+ Questions',
  },
  {
    name: 'JEE Main',
    description: 'Engineering Entrance Exam',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    color: 'bg-mathematics',
    href: '/jee',
    stats: '40,000+ Questions',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'NEET 2024 - AIR 156',
    content: 'The structured approach and PYQ practice helped me crack NEET in my first attempt. The analytics showed me exactly where I needed to improve.',
    avatar: 'PS',
  },
  {
    name: 'Rahul Kumar',
    role: 'JEE Main 2024 - 99.2%ile',
    content: 'Best free platform for JEE preparation. The mock tests are very close to the actual exam pattern.',
    avatar: 'RK',
  },
  {
    name: 'Ananya Singh',
    role: 'NEET 2024 - AIR 89',
    content: 'The error notebook feature is a game-changer. I could track my mistakes and avoid repeating them in the actual exam.',
    avatar: 'AS',
  },
];

export default function LandingPage() {
  const statsRef = useInView(0.3);
  const questionsCount = useCounter(50000, 2000, statsRef.inView);
  const mockTestsCount = useCounter(100, 1500, statsRef.inView);
  const studentsCount = useCounter(10000, 2000, statsRef.inView);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          
          {/* Animated Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
          
          <div className="container relative py-20 md:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5">
                <Sparkles className="h-3 w-3 mr-1" />
                100% Free Platform
              </Badge>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                India's Most Structured{' '}
                <span className="text-primary">NEET/JEE</span>
                <br />
                Preparation Platform
              </h1>
              
              <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                Practice 50,000+ PYQs, take mock tests, track your progress, and achieve your dream college. 
                Completely free, forever.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="min-w-[200px]" asChild>
                  <Link href="/register">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="min-w-[200px]" asChild>
                  <Link href="/pyqs">
                    Explore PYQs
                  </Link>
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Instant access
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section 
          ref={statsRef.ref}
          className="py-16 border-y bg-muted/30"
        >
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {questionsCount.toLocaleString()}+
                </div>
                <div className="text-muted-foreground">Questions</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {mockTestsCount}+
                </div>
                <div className="text-muted-foreground">Mock Tests</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {studentsCount.toLocaleString()}+
                </div>
                <div className="text-muted-foreground">Students</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">95%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools designed by toppers and educators to help you prepare effectively.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    "animate-in fade-in-0 slide-in-from-bottom-4"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                      feature.color
                    )}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Exam Paths Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Exam Paths</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">
                Choose Your Path
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Structured preparation paths designed specifically for your target exam.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {exams.map((exam) => (
                <Link
                  key={exam.name}
                  href={exam.href}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`absolute top-0 left-0 h-1.5 w-full ${exam.color}`} />
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{exam.name}</h3>
                      <p className="mt-1 text-muted-foreground">{exam.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {exam.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-primary" />
                    {exam.stats}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">
                Loved by Students
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                See what our students have to say about their preparation journey.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index}
                  className="relative overflow-hidden"
                >
                  <CardContent className="p-6">
                    <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/20" />
                    
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Start Your Journey Today
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
              Join thousands of students who are already preparing smartly. 
              It's free, and always will be.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="min-w-[200px]" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Free forever
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                No credit card
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Instant access
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Cancel anytime
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

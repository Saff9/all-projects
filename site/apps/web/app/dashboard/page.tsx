'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BookOpen, 
  FileText, 
  Timer, 
  TrendingUp,
  Flame,
  Target,
  Clock,
  ArrowRight,
  Play,
  Calendar,
  BarChart3,
  Zap,
  AlertTriangle,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { StatsCard } from '@/components/features/stats-card';
import { StreakCounter, StreakMilestone } from '@/components/features/streak-counter';
import { SubjectProgressGrid, SubjectProgressList } from '@/components/features/subject-progress';
import { ActivityList } from '@/components/features/activity-item';
import { WeakChapterList } from '@/components/features/weak-chapter-card';
import { ProgressRing } from '@/components/features/progress-ring';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';

// Mock data
const mockStats = [
  { title: 'Questions Solved', value: '1,234', icon: FileText, change: '+12%', changeType: 'positive' as const },
  { title: 'Mock Tests Taken', value: '23', icon: Timer, change: '+5%', changeType: 'positive' as const },
  { title: 'Accuracy', value: '78%', icon: Target, change: '+3%', changeType: 'positive' as const },
  { title: 'Study Streak', value: '15 days', icon: Flame, change: '🔥', changeType: 'neutral' as const },
];

const mockSubjects = [
  { name: 'Physics', progress: 65, chaptersCompleted: 15, totalChapters: 23, questionsSolved: 450, color: 'physics' as const },
  { name: 'Chemistry', progress: 72, chaptersCompleted: 18, totalChapters: 25, questionsSolved: 520, color: 'chemistry' as const },
  { name: 'Mathematics', progress: 58, chaptersCompleted: 12, totalChapters: 20, questionsSolved: 380, color: 'mathematics' as const },
  { name: 'Biology', progress: 80, chaptersCompleted: 22, totalChapters: 28, questionsSolved: 680, color: 'biology' as const },
];

const mockActivities = [
  { type: 'test' as const, title: 'NEET 2023 Physics', score: '156/180', time: '2 hours ago', href: '/mock-tests/1', status: 'success' as const },
  { type: 'practice' as const, title: 'Thermodynamics', description: 'Chapter Practice', score: '45/50', time: '5 hours ago', href: '/pyqs?chapter=thermo', status: 'success' as const },
  { type: 'test' as const, title: 'JEE Main Maths', score: '89/120', time: 'Yesterday', href: '/mock-tests/2', status: 'failure' as const },
  { type: 'chapter' as const, title: 'Organic Chemistry', description: 'Completed Chapter 5', time: '2 days ago', href: '/chapters/5' },
];

const mockWeakChapters = [
  { id: '1', name: 'Electrochemistry', subject: 'Chemistry', subjectColor: 'chemistry' as const, accuracy: 45, attemptedQuestions: 32 },
  { id: '2', name: 'Rotational Motion', subject: 'Physics', subjectColor: 'physics' as const, accuracy: 52, attemptedQuestions: 28 },
  { id: '3', name: 'Integral Calculus', subject: 'Mathematics', subjectColor: 'mathematics' as const, accuracy: 58, attemptedQuestions: 45 },
];

const mockUpcomingTests = [
  { id: '1', name: 'NEET Full Syllabus Test', date: 'Tomorrow', time: '10:00 AM', duration: '3h 20min', type: 'Full Test' },
  { id: '2', name: 'Physics Part Test', date: 'Feb 18', time: '2:00 PM', duration: '1h', type: 'Part Test' },
  { id: '3', name: 'Chemistry Booster', date: 'Feb 20', time: '4:00 PM', duration: '45min', type: 'Quick Test' },
];

const mockWeeklyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.0 },
  { day: 'Fri', hours: 2.1 },
  { day: 'Sat', hours: 3.5 },
  { day: 'Sun', hours: 2.8 },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();

  const firstName = user?.fullName?.split(' ')[0] || 'Student';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="flex">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {greeting}, {firstName}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's your progress overview
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StreakCounter currentStreak={15} size="sm" />
                <Button asChild>
                  <Link href="/mock-tests">
                    <Play className="h-4 w-4 mr-2" />
                    Start Daily Test
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {mockStats.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Progress Overview</CardTitle>
                    <CardDescription>Your subject-wise preparation progress</CardDescription>
                  </div>
                  <Tabs defaultValue="grid" className="hidden md:block">
                    <TabsList className="h-8">
                      <TabsTrigger value="grid" className="text-xs px-3">Grid</TabsTrigger>
                      <TabsTrigger value="list" className="text-xs px-3">List</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="grid">
                    <TabsContent value="grid" className="mt-0">
                      <SubjectProgressGrid subjects={mockSubjects} />
                    </TabsContent>
                    <TabsContent value="list" className="mt-0">
                      <SubjectProgressList 
                        subjects={mockSubjects.map(s => ({ 
                          name: s.name, 
                          progress: s.progress, 
                          color: s.color 
                        }))} 
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Continue your preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                      href="/pyqs"
                      className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50"
                    >
                      <div className="p-3 rounded-lg bg-physics/10">
                        <FileText className="h-6 w-6 text-physics" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">Practice PYQs</p>
                        <p className="text-sm text-muted-foreground">50K+ questions</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/mock-tests"
                      className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50"
                    >
                      <div className="p-3 rounded-lg bg-chemistry/10">
                        <Timer className="h-6 w-6 text-chemistry" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">Take Mock Test</p>
                        <p className="text-sm text-muted-foreground">100+ tests</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/revision"
                      className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50"
                    >
                      <div className="p-3 rounded-lg bg-mathematics/10">
                        <Clock className="h-6 w-6 text-mathematics" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">Revision Mode</p>
                        <p className="text-sm text-muted-foreground">Review mistakes</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/resources"
                      className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50"
                    >
                      <div className="p-3 rounded-lg bg-biology/10">
                        <BookOpen className="h-6 w-6 text-biology" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">Study Resources</p>
                        <p className="text-sm text-muted-foreground">NCERT & more</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest learning activities</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={"/activity" as any}>
                      View all
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <ActivityList activities={mockActivities} maxItems={4} />
                </CardContent>
              </Card>

              {/* Weekly Study Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Weekly Study Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 h-40">
                    {mockWeeklyData.map((day, index) => {
                      const maxHours = Math.max(...mockWeeklyData.map(d => d.hours));
                      const height = (day.hours / maxHours) * 100;
                      return (
                        <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center justify-end h-32">
                            <span className="text-xs text-muted-foreground mb-1">{day.hours}h</span>
                            <div
                              className={cn(
                                "w-full max-w-[40px] rounded-t-md transition-all",
                                index === mockWeeklyData.length - 2 
                                  ? "bg-primary" 
                                  : "bg-primary/40"
                              )}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{day.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Today's Goal */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Today's Goal</h3>
                    <Badge variant="secondary">68% Complete</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <ProgressRing progress={68} size={80} />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        34 of 50 questions completed
                      </p>
                      <Button size="sm" className="w-full" asChild>
                        <Link href="/pyqs">Continue Practice</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Milestone */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-orange-500" />
                    Streak Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StreakMilestone currentStreak={15} milestones={[7, 14, 30, 60, 100]} />
                </CardContent>
              </Card>

              {/* Weak Chapters */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Areas to Improve
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={"/weak-chapters" as any}>View all</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <WeakChapterList chapters={mockWeakChapters} maxItems={3} />
                </CardContent>
              </Card>

              {/* Upcoming Tests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockUpcomingTests.map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{test.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{test.date}</span>
                            <span>•</span>
                            <span>{test.time}</span>
                            <span>•</span>
                            <span>{test.duration}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {test.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/mock-tests">
                      <Calendar className="h-4 w-4 mr-2" />
                      View All Tests
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* AI Recommendation */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Zap className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">AI Recommendation</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Based on your recent performance, focus on Electrochemistry to improve your Chemistry score.
                      </p>
                      <Button size="sm" variant="secondary" asChild>
                        <Link href="/pyqs?chapter=electrochemistry">
                          Start Practice
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

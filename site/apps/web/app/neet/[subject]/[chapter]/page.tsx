'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PYQCard } from '@/components/features/pyq-card';
import {
  BookOpen,
  FileText,
  Clock,
  Target,
  ChevronLeft,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Video,
  FileQuestion,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Sample chapter data - in real app, this would come from API
const chapterData = {
  id: 'p5',
  name: 'Laws of Motion',
  subject: 'Physics',
  subjectSlug: 'physics',
  examType: 'NEET',
  chapterNumber: 5,
  weightage: 7,
  difficultyLevel: 'medium' as const,
  totalTopics: 8,
  totalQuestions: 120,
  estimatedHours: 10,
  description: 'This chapter covers Newton\'s three laws of motion, concepts of force, friction, and their applications in various physical situations.',
  status: 'not_started' as const,
  completionPercentage: 0,
  topics: [
    { id: 't1', name: 'Aristotle\'s Fallacy', topicNumber: 1, difficultyLevel: 'easy' as const },
    { id: 't2', name: "Newton's First Law of Motion", topicNumber: 2, difficultyLevel: 'easy' as const },
    { id: 't3', name: "Newton's Second Law of Motion", topicNumber: 3, difficultyLevel: 'medium' as const },
    { id: 't4', name: "Newton's Third Law of Motion", topicNumber: 4, difficultyLevel: 'medium' as const },
    { id: 't5', name: 'Conservation of Momentum', topicNumber: 5, difficultyLevel: 'medium' as const },
    { id: 't6', name: 'Equilibrium of a Particle', topicNumber: 6, difficultyLevel: 'medium' as const },
    { id: 't7', name: 'Common Forces in Mechanics', topicNumber: 7, difficultyLevel: 'medium' as const },
    { id: 't8', name: 'Friction', topicNumber: 8, difficultyLevel: 'hard' as const },
  ],
  keyConcepts: [
    'Force is a vector quantity that causes acceleration',
    'Inertia is the tendency of a body to resist change in its state of motion',
    'Momentum (p = mv) is conserved in isolated systems',
    'Action and reaction forces act on different bodies',
    'Static friction is self-adjusting up to a maximum value',
    'Kinetic friction is constant and less than maximum static friction',
  ],
  importantFormulas: [
    'F = ma (Newton\'s Second Law)',
    'p = mv (Momentum)',
    'F_net = dp/dt (Force as rate of change of momentum)',
    'f_s(max) = µ_s N (Maximum static friction)',
    'f_k = µ_k N (Kinetic friction)',
    'W = mg (Weight)',
  ],
  ncertLink: 'https://ncert.nic.in/textbook.php?leph1=5-6',
};

// Sample PYQs
const samplePYQs = [
  {
    id: 'q1',
    questionText: 'A block of mass 2 kg is placed on a rough inclined plane of inclination 30°. The coefficient of friction between the block and the plane is 0.5. Find the acceleration of the block. (g = 10 m/s²)',
    questionType: 'mcq' as const,
    options: [
      { id: 'o1', optionLabel: 'A', optionText: 'Zero', isCorrect: false },
      { id: 'o2', optionLabel: 'B', optionText: '2.5 m/s²', isCorrect: false },
      { id: 'o3', optionLabel: 'C', optionText: '5 m/s²', isCorrect: false },
      { id: 'o4', optionLabel: 'D', optionText: '0.67 m/s²', isCorrect: true },
    ],
    difficultyLevel: 'medium' as const,
    sourceExam: 'NEET',
    sourceYear: 2023,
    subjectName: 'Physics',
    chapterName: 'Laws of Motion',
    solutionText: 'The block will slide if mg sin(30°) > µ mg cos(30°). Here, sin(30°) = 0.5 and µ cos(30°) = 0.5 × 0.866 = 0.433. Since 0.5 > 0.433, the block will slide. Net force = mg sin(30°) - µ mg cos(30°) = m × 10 × (0.5 - 0.433) = m × 0.67. Therefore, acceleration = 0.67 m/s².',
    hint: 'Compare the component of weight along the plane with the maximum friction force.',
  },
  {
    id: 'q2',
    questionText: 'A body of mass 5 kg is acted upon by two perpendicular forces of 12 N and 5 N. The magnitude of acceleration of the body is:',
    questionType: 'mcq' as const,
    options: [
      { id: 'o5', optionLabel: 'A', optionText: '2.6 m/s²', isCorrect: true },
      { id: 'o6', optionLabel: 'B', optionText: '3.4 m/s²', isCorrect: false },
      { id: 'o7', optionLabel: 'C', optionText: '1.7 m/s²', isCorrect: false },
      { id: 'o8', optionLabel: 'D', optionText: '2.0 m/s²', isCorrect: false },
    ],
    difficultyLevel: 'easy' as const,
    sourceExam: 'NEET',
    sourceYear: 2022,
    subjectName: 'Physics',
    chapterName: 'Laws of Motion',
    solutionText: 'The resultant force F = sqrt(12² + 5²) = sqrt(144 + 25) = sqrt(169) = 13 N. Using F = ma, acceleration a = F/m = 13/5 = 2.6 m/s².',
  },
  {
    id: 'q3',
    questionText: 'Two blocks of masses 2 kg and 4 kg are connected by a light string passing over a light frictionless pulley. The acceleration of the system is:',
    questionType: 'mcq' as const,
    options: [
      { id: 'o9', optionLabel: 'A', optionText: 'g/3', isCorrect: true },
      { id: 'o10', optionLabel: 'B', optionText: 'g/2', isCorrect: false },
      { id: 'o11', optionLabel: 'C', optionText: '2g/3', isCorrect: false },
      { id: 'o12', optionLabel: 'D', optionText: 'g/4', isCorrect: false },
    ],
    difficultyLevel: 'medium' as const,
    sourceExam: 'NEET',
    sourceYear: 2021,
    subjectName: 'Physics',
    chapterName: 'Laws of Motion',
    solutionText: 'For the Atwood machine, acceleration a = (m2 - m1)g / (m1 + m2) = (4 - 2)g / (4 + 2) = 2g/6 = g/3.',
  },
];

// Sample mistake traps
const mistakeTraps = [
  {
    id: 'm1',
    title: 'Confusing Action-Reaction Pairs',
    description: 'Students often think action and reaction forces cancel each other. Remember: they act on different bodies!',
    commonMistake: 'Assuming F_AB + F_BA = 0 for a single body',
    correctApproach: 'Action and reaction never act on the same body. For a single body, consider only forces acting ON it.',
  },
  {
    id: 'm2',
    title: 'Static vs Kinetic Friction',
    description: 'Static friction is self-adjusting and equals the applied force until it reaches maximum value.',
    commonMistake: 'Using f_s = µ_s N always',
    correctApproach: 'Use f_s = µ_s N only when the body is about to move. Otherwise, f_s equals the applied force.',
  },
  {
    id: 'm3',
    title: 'Weight and Normal Reaction',
    description: 'Normal reaction is not always equal to weight.',
    commonMistake: 'Assuming N = mg in all situations',
    correctApproach: 'N = mg only on a horizontal surface with no vertical acceleration. On inclined planes, N = mg cos(30°).',
  },
];

interface PageProps {
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
}

export default function ChapterDetailPage({ params }: PageProps) {
  const { subject, chapter } = use(params);
  const [activeTab, setActiveTab] = useState('overview');

  const difficultyConfig = {
    easy: { label: 'Easy', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    hard: { label: 'Hard', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  };

  const difficulty = difficultyConfig[chapterData.difficultyLevel];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/neet" className="hover:text-foreground">NEET</Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <Link href={`/neet/${subject}`} className="hover:text-foreground capitalize">{subject}</Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-foreground">{chapterData.name}</span>
          </div>
        </div>

        {/* Chapter Header */}
        <section className="container pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-physics/10 to-physics/5 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline">Chapter {chapterData.chapterNumber}</Badge>
                      <Badge variant="outline" className={difficulty.color}>
                        {difficulty.label}
                      </Badge>
                      <Badge variant="outline" className="text-red-500 border-red-500/50">
                        {chapterData.weightage}% Weightage
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{chapterData.name}</h1>
                    <p className="text-muted-foreground mb-4">{chapterData.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{chapterData.totalTopics} topics</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{chapterData.totalQuestions} PYQs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{chapterData.estimatedHours} hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="lg" asChild>
                      <Link href={`/pyqs/practice?chapter=${chapter}`}>
                        <Play className="h-5 w-5 mr-2" />
                        Start Learning
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/pyqs?chapter=${chapter}&exam=NEET`}>
                        <FileText className="h-5 w-5 mr-2" />
                        Practice PYQs
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{chapterData.completionPercentage}%</span>
                  </div>
                  <Progress value={chapterData.completionPercentage} className="h-2" />
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Content Tabs */}
        <section className="container pb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pyqs">PYQs</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="mini-test">Mini Test</TabsTrigger>
              <TabsTrigger value="mistakes">Mistake Traps</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Topics List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Topics Covered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {chapterData.topics.map((topic) => (
                        <li
                          key={topic.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {topic.topicNumber}
                            </span>
                            <span>{topic.name}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              difficultyConfig[topic.difficultyLevel || 'medium'].color
                            )}
                          >
                            {topic.difficultyLevel}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Key Concepts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Key Concepts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {chapterData.keyConcepts.map((concept, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Important Formulas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Important Formulas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {chapterData.importantFormulas.map((formula, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-muted/50 font-mono text-sm"
                        >
                          {formula}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {chapterData.ncertLink && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={chapterData.ncertLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          NCERT Chapter PDF
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="h-4 w-4 mr-2" />
                      Video Lectures
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileQuestion className="h-4 w-4 mr-2" />
                      Practice Problems
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* PYQs Tab */}
            <TabsContent value="pyqs" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Previous Year Questions</h2>
                  <p className="text-muted-foreground">{chapterData.totalQuestions} questions available</p>
                </div>
                <Button asChild>
                  <Link href={`/pyqs?chapter=${chapter}&exam=NEET`}>
                    View All PYQs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {samplePYQs.map((pyq) => (
                  <PYQCard
                    key={pyq.id}
                    id={pyq.id}
                    questionText={pyq.questionText}
                    questionType={pyq.questionType}
                    options={pyq.options}
                    difficultyLevel={pyq.difficultyLevel}
                    sourceExam={pyq.sourceExam}
                    sourceYear={pyq.sourceYear}
                    subjectName={pyq.subjectName}
                    chapterName={pyq.chapterName}
                    solutionText={pyq.solutionText}
                    hint={pyq.hint}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chapter Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h3>Newton's Laws of Motion</h3>
                    <p>
                      Newton's laws of motion are three physical laws that, together, laid the foundation for classical mechanics. They describe the relationship between a body and the forces acting upon it, and its motion in response to those forces.
                    </p>
                    
                    <h4>First Law (Law of Inertia)</h4>
                    <p>
                      A body at rest will remain at rest, and a body in motion will continue in motion with constant velocity, unless acted upon by an external unbalanced force.
                    </p>
                    
                    <h4>Second Law</h4>
                    <p>
                      The rate of change of momentum of a body is directly proportional to the applied force and takes place in the direction in which the force acts.
                    </p>
                    <p>
                      Mathematically: <strong>F = ma</strong> or <strong>F = dp/dt</strong>
                    </p>
                    
                    <h4>Third Law</h4>
                    <p>
                      For every action, there is an equal and opposite reaction. Forces always occur in pairs.
                    </p>
                    
                    <h3>Types of Forces</h3>
                    <ul>
                      <li><strong>Contact Forces:</strong> Normal reaction, Friction, Tension</li>
                      <li><strong>Non-contact Forces:</strong> Gravitational, Electromagnetic</li>
                    </ul>
                    
                    <h3>Friction</h3>
                    <p>
                      Friction is a force that opposes relative motion between surfaces in contact.
                    </p>
                    <ul>
                      <li><strong>Static Friction (f_s):</strong> Self-adjusting, f_s(max) = µ_s N</li>
                      <li><strong>Kinetic Friction (f_k):</strong> Constant, f_k = µ_k N</li>
                    </ul>
                    <p>
                      Generally, µ_s &gt; µ_k, so static friction is greater than kinetic friction.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mini Test Tab */}
            <TabsContent value="mini-test" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5" />
                    Quick Mini Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">10 Question Quick Test</h3>
                    <p className="text-muted-foreground mb-6">
                      Test your understanding of {chapterData.name} with a quick 10-minute assessment
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button size="lg" asChild>
                        <Link href={`/mock-tests/mini?chapter=${chapter}`}>
                          <Play className="h-5 w-5 mr-2" />
                          Start Mini Test
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href={`/pyqs/practice?chapter=${chapter}&limit=10`}>
                          Practice 10 Random PYQs
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mistake Traps Tab */}
            <TabsContent value="mistakes" className="space-y-6">
              <div className="grid gap-4">
                {mistakeTraps.map((trap) => (
                  <Card key={trap.id} className="border-orange-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        {trap.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{trap.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium text-sm">Common Mistake</span>
                          </div>
                          <p className="text-sm">{trap.commonMistake}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 text-green-600 mb-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-medium text-sm">Correct Approach</span>
                          </div>
                          <p className="text-sm">{trap.correctApproach}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
}
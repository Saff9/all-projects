'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  SubjectTabs,
  SubjectHeader,
  ChapterList,
  jeeSubjects,
} from '@/components/features';
import {
  BookOpen,
  FileText,
  Timer,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Play,
  CheckCircle2,
  Zap,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// JEE Chapter Data
const jeeChaptersData = {
  physics: [
    { id: 'jp1', name: 'Units and Dimensions', chapterNumber: 1, jeeMainWeightage: 3, jeeAdvancedWeightage: 2, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 60, estimatedHours: 4 },
    { id: 'jp2', name: 'Kinematics', chapterNumber: 2, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 85, estimatedHours: 6 },
    { id: 'jp3', name: 'Laws of Motion', chapterNumber: 3, jeeMainWeightage: 6, jeeAdvancedWeightage: 7, difficultyLevel: 'medium' as const, totalTopics: 7, totalQuestions: 110, estimatedHours: 8 },
    { id: 'jp4', name: 'Work, Energy and Power', chapterNumber: 4, jeeMainWeightage: 5, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 95, estimatedHours: 7 },
    { id: 'jp5', name: 'Rotational Motion', chapterNumber: 5, jeeMainWeightage: 7, jeeAdvancedWeightage: 10, difficultyLevel: 'hard' as const, totalTopics: 9, totalQuestions: 150, estimatedHours: 12 },
    { id: 'jp6', name: 'Gravitation', chapterNumber: 6, jeeMainWeightage: 3, jeeAdvancedWeightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 5 },
    { id: 'jp7', name: 'Properties of Solids and Liquids', chapterNumber: 7, jeeMainWeightage: 5, jeeAdvancedWeightage: 4, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 88, estimatedHours: 7 },
    { id: 'jp8', name: 'Thermodynamics', chapterNumber: 8, jeeMainWeightage: 6, jeeAdvancedWeightage: 8, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 120, estimatedHours: 9 },
    { id: 'jp9', name: 'Kinetic Theory of Gases', chapterNumber: 9, jeeMainWeightage: 3, jeeAdvancedWeightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 4 },
    { id: 'jp10', name: 'Oscillations and Waves', chapterNumber: 10, jeeMainWeightage: 5, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 92, estimatedHours: 7 },
    { id: 'jp11', name: 'Electrostatics', chapterNumber: 11, jeeMainWeightage: 7, jeeAdvancedWeightage: 9, difficultyLevel: 'hard' as const, totalTopics: 8, totalQuestions: 140, estimatedHours: 10 },
    { id: 'jp12', name: 'Current Electricity', chapterNumber: 12, jeeMainWeightage: 8, jeeAdvancedWeightage: 8, difficultyLevel: 'hard' as const, totalTopics: 8, totalQuestions: 135, estimatedHours: 10 },
    { id: 'jp13', name: 'Magnetic Effects of Current', chapterNumber: 13, jeeMainWeightage: 6, jeeAdvancedWeightage: 7, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 115, estimatedHours: 9 },
    { id: 'jp14', name: 'Magnetism and Matter', chapterNumber: 14, jeeMainWeightage: 3, jeeAdvancedWeightage: 3, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 60, estimatedHours: 5 },
    { id: 'jp15', name: 'EMI and AC', chapterNumber: 15, jeeMainWeightage: 6, jeeAdvancedWeightage: 7, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 110, estimatedHours: 9 },
    { id: 'jp16', name: 'Optics', chapterNumber: 16, jeeMainWeightage: 7, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 8, totalQuestions: 125, estimatedHours: 9 },
    { id: 'jp17', name: 'Dual Nature of Matter', chapterNumber: 17, jeeMainWeightage: 4, jeeAdvancedWeightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 75, estimatedHours: 6 },
    { id: 'jp18', name: 'Atoms and Nuclei', chapterNumber: 18, jeeMainWeightage: 4, jeeAdvancedWeightage: 3, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 5 },
    { id: 'jp19', name: 'Semiconductors', chapterNumber: 19, jeeMainWeightage: 4, jeeAdvancedWeightage: 2, difficultyLevel: 'easy' as const, totalTopics: 5, totalQuestions: 65, estimatedHours: 5 },
    { id: 'jp20', name: 'Communication Systems', chapterNumber: 20, jeeMainWeightage: 2, jeeAdvancedWeightage: 1, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 40, estimatedHours: 3 },
  ],
  chemistry: [
    { id: 'jc1', name: 'Some Basic Concepts of Chemistry', chapterNumber: 1, jeeMainWeightage: 3, jeeAdvancedWeightage: 2, difficultyLevel: 'easy' as const, totalTopics: 5, totalQuestions: 65, estimatedHours: 5 },
    { id: 'jc2', name: 'Atomic Structure', chapterNumber: 2, jeeMainWeightage: 5, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 95, estimatedHours: 7 },
    { id: 'jc3', name: 'Periodic Table and Properties', chapterNumber: 3, jeeMainWeightage: 4, jeeAdvancedWeightage: 3, difficultyLevel: 'easy' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 5 },
    { id: 'jc4', name: 'Chemical Bonding', chapterNumber: 4, jeeMainWeightage: 8, jeeAdvancedWeightage: 10, difficultyLevel: 'hard' as const, totalTopics: 9, totalQuestions: 160, estimatedHours: 12 },
    { id: 'jc5', name: 'States of Matter', chapterNumber: 5, jeeMainWeightage: 3, jeeAdvancedWeightage: 4, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 60, estimatedHours: 5 },
    { id: 'jc6', name: 'Thermodynamics', chapterNumber: 6, jeeMainWeightage: 5, jeeAdvancedWeightage: 7, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 105, estimatedHours: 8 },
    { id: 'jc7', name: 'Chemical Equilibrium', chapterNumber: 7, jeeMainWeightage: 7, jeeAdvancedWeightage: 8, difficultyLevel: 'hard' as const, totalTopics: 8, totalQuestions: 130, estimatedHours: 10 },
    { id: 'jc8', name: 'Ionic Equilibrium', chapterNumber: 8, jeeMainWeightage: 5, jeeAdvancedWeightage: 6, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 100, estimatedHours: 8 },
    { id: 'jc9', name: 'Redox Reactions', chapterNumber: 9, jeeMainWeightage: 3, jeeAdvancedWeightage: 4, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 65, estimatedHours: 5 },
    { id: 'jc10', name: 'Electrochemistry', chapterNumber: 10, jeeMainWeightage: 5, jeeAdvancedWeightage: 7, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 110, estimatedHours: 9 },
    { id: 'jc11', name: 'Chemical Kinetics', chapterNumber: 11, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 85, estimatedHours: 6 },
    { id: 'jc12', name: 'Surface Chemistry', chapterNumber: 12, jeeMainWeightage: 2, jeeAdvancedWeightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 50, estimatedHours: 4 },
    { id: 'jc13', name: 's-Block Elements', chapterNumber: 13, jeeMainWeightage: 3, jeeAdvancedWeightage: 2, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 4 },
    { id: 'jc14', name: 'p-Block Elements', chapterNumber: 14, jeeMainWeightage: 6, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 7, totalQuestions: 105, estimatedHours: 8 },
    { id: 'jc15', name: 'd and f Block Elements', chapterNumber: 15, jeeMainWeightage: 4, jeeAdvancedWeightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 80, estimatedHours: 6 },
    { id: 'jc16', name: 'Coordination Compounds', chapterNumber: 16, jeeMainWeightage: 6, jeeAdvancedWeightage: 8, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 125, estimatedHours: 10 },
    { id: 'jc17', name: 'Metallurgy', chapterNumber: 17, jeeMainWeightage: 2, jeeAdvancedWeightage: 3, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 45, estimatedHours: 3 },
    { id: 'jc18', name: 'GOC - Organic Chemistry Basics', chapterNumber: 18, jeeMainWeightage: 8, jeeAdvancedWeightage: 10, difficultyLevel: 'hard' as const, totalTopics: 10, totalQuestions: 170, estimatedHours: 14 },
    { id: 'jc19', name: 'Hydrocarbons', chapterNumber: 19, jeeMainWeightage: 5, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 95, estimatedHours: 7 },
    { id: 'jc20', name: 'Haloalkanes and Haloarenes', chapterNumber: 20, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 85, estimatedHours: 6 },
    { id: 'jc21', name: 'Alcohols, Phenols and Ethers', chapterNumber: 21, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 80, estimatedHours: 6 },
    { id: 'jc22', name: 'Aldehydes, Ketones', chapterNumber: 22, jeeMainWeightage: 6, jeeAdvancedWeightage: 8, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 130, estimatedHours: 10 },
    { id: 'jc23', name: 'Carboxylic Acids and Derivatives', chapterNumber: 23, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 85, estimatedHours: 7 },
    { id: 'jc24', name: 'Amines', chapterNumber: 24, jeeMainWeightage: 3, jeeAdvancedWeightage: 4, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 70, estimatedHours: 5 },
    { id: 'jc25', name: 'Biomolecules and Polymers', chapterNumber: 25, jeeMainWeightage: 3, jeeAdvancedWeightage: 2, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 4 },
  ],
  mathematics: [
    { id: 'jm1', name: 'Sets, Relations and Functions', chapterNumber: 1, jeeMainWeightage: 4, jeeAdvancedWeightage: 3, difficultyLevel: 'easy' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 5 },
    { id: 'jm2', name: 'Complex Numbers', chapterNumber: 2, jeeMainWeightage: 5, jeeAdvancedWeightage: 7, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 95, estimatedHours: 7 },
    { id: 'jm3', name: 'Quadratic Equations', chapterNumber: 3, jeeMainWeightage: 5, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 90, estimatedHours: 6 },
    { id: 'jm4', name: 'Sequences and Series', chapterNumber: 4, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 85, estimatedHours: 6 },
    { id: 'jm5', name: 'Permutations and Combinations', chapterNumber: 5, jeeMainWeightage: 4, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 80, estimatedHours: 6 },
    { id: 'jm6', name: 'Binomial Theorem', chapterNumber: 6, jeeMainWeightage: 3, jeeAdvancedWeightage: 4, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 65, estimatedHours: 5 },
    { id: 'jm7', name: 'Matrices and Determinants', chapterNumber: 7, jeeMainWeightage: 6, jeeAdvancedWeightage: 7, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 110, estimatedHours: 8 },
    { id: 'jm8', name: 'Limits, Continuity and Differentiability', chapterNumber: 8, jeeMainWeightage: 7, jeeAdvancedWeightage: 9, difficultyLevel: 'hard' as const, totalTopics: 8, totalQuestions: 140, estimatedHours: 11 },
    { id: 'jm9', name: 'Integral Calculus', chapterNumber: 9, jeeMainWeightage: 8, jeeAdvancedWeightage: 10, difficultyLevel: 'hard' as const, totalTopics: 9, totalQuestions: 160, estimatedHours: 13 },
    { id: 'jm10', name: 'Differential Equations', chapterNumber: 10, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 80, estimatedHours: 6 },
    { id: 'jm11', name: 'Coordinate Geometry - Straight Lines', chapterNumber: 11, jeeMainWeightage: 5, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 95, estimatedHours: 7 },
    { id: 'jm12', name: 'Coordinate Geometry - Circles', chapterNumber: 12, jeeMainWeightage: 4, jeeAdvancedWeightage: 6, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 90, estimatedHours: 7 },
    { id: 'jm13', name: 'Coordinate Geometry - Conic Sections', chapterNumber: 13, jeeMainWeightage: 6, jeeAdvancedWeightage: 8, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 125, estimatedHours: 10 },
    { id: 'jm14', name: 'Vector Algebra', chapterNumber: 14, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 75, estimatedHours: 6 },
    { id: 'jm15', name: '3D Geometry', chapterNumber: 15, jeeMainWeightage: 5, jeeAdvancedWeightage: 7, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 105, estimatedHours: 8 },
    { id: 'jm16', name: 'Probability', chapterNumber: 16, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 80, estimatedHours: 6 },
    { id: 'jm17', name: 'Trigonometric Functions and Equations', chapterNumber: 17, jeeMainWeightage: 4, jeeAdvancedWeightage: 5, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 85, estimatedHours: 6 },
    { id: 'jm18', name: 'Mathematical Reasoning', chapterNumber: 18, jeeMainWeightage: 2, jeeAdvancedWeightage: 0, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 35, estimatedHours: 3 },
  ],
};

// Calculate totals
const totalChapters = 20 + 25 + 18; // 63 chapters
const totalPYQs = Object.values(jeeChaptersData).flat().reduce((acc, ch) => acc + ch.totalQuestions, 0);
const totalEstimatedHours = Object.values(jeeChaptersData).flat().reduce((acc, ch) => acc + (ch.estimatedHours || 0), 0);

export default function JEEPage() {
  const [activeSubject, setActiveSubject] = useState('physics');
  const [examMode, setExamMode] = useState<'JEE_MAIN' | 'JEE_ADVANCED'>('JEE_MAIN');

  // Get current subject data
  const currentSubject = jeeSubjects.find((s) => s.id === activeSubject)!;
  const currentChapters = jeeChaptersData[activeSubject as keyof typeof jeeChaptersData] || [];

  // Transform chapters for ChapterList component
  const transformedChapters = currentChapters.map((ch) => ({
    ...ch,
    slug: ch.id,
    subjectId: activeSubject,
    subjectName: currentSubject.name,
    subjectSlug: currentSubject.slug,
    examType: examMode,
    weightage: examMode === 'JEE_MAIN' ? ch.jeeMainWeightage : ch.jeeAdvancedWeightage,
    status: 'not_started' as const,
    completionPercentage: 0,
    topics: [],
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-physics/10 via-chemistry/10 to-mathematics/10" />
          <div className="container relative py-12 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="outline" className="text-physics border-physics/50">
                  JEE Main 2025
                </Badge>
                <Badge variant="outline" className="text-mathematics border-mathematics/50">
                  JEE Advanced 2025
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                JEE Preparation Roadmap
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete syllabus coverage with chapter-wise PYQs, difficulty analysis, and 
                strategic study plans for Physics, Chemistry & Mathematics
              </p>
            </motion.div>

            {/* Exam Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex rounded-lg border p-1 bg-muted/50">
                <button
                  onClick={() => setExamMode('JEE_MAIN')}
                  className={cn(
                    'px-6 py-2 rounded-md text-sm font-medium transition-all',
                    examMode === 'JEE_MAIN'
                      ? 'bg-physics text-white shadow-md'
                      : 'hover:bg-muted'
                  )}
                >
                  <Zap className="h-4 w-4 inline mr-2" />
                  JEE Main
                </button>
                <button
                  onClick={() => setExamMode('JEE_ADVANCED')}
                  className={cn(
                    'px-6 py-2 rounded-md text-sm font-medium transition-all',
                    examMode === 'JEE_ADVANCED'
                      ? 'bg-mathematics text-white shadow-md'
                      : 'hover:bg-muted'
                  )}
                >
                  <GraduationCap className="h-4 w-4 inline mr-2" />
                  JEE Advanced
                </button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold">{totalChapters}</p>
                  <p className="text-sm text-muted-foreground">Total Chapters</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-mathematics" />
                  <p className="text-3xl font-bold">{totalPYQs.toLocaleString()}+</p>
                  <p className="text-sm text-muted-foreground">PYQs Available</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-physics" />
                  <p className="text-3xl font-bold">{Math.round(totalEstimatedHours / 10)}</p>
                  <p className="text-sm text-muted-foreground">Weeks to Complete</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-chemistry" />
                  <p className="text-3xl font-bold">{examMode === 'JEE_MAIN' ? '300' : '360'}</p>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" asChild>
                <Link href={`/pyqs?exam=${examMode}`}>
                  <FileText className="h-5 w-5 mr-2" />
                  Practice PYQs
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/mock-tests?exam=${examMode}`}>
                  <Timer className="h-5 w-5 mr-2" />
                  Take Mock Test
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/resources?exam=JEE">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Study Resources
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Subject Tabs & Chapters Section */}
        <section className="container py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Subject Tabs */}
            <div className="mb-6">
              <SubjectTabs
                subjects={jeeSubjects.map((s) => ({
                  ...s,
                  completedChapters: 0,
                }))}
                activeSubject={activeSubject}
                onSubjectChange={setActiveSubject}
                showProgress={true}
                variant="default"
                size="lg"
              />
            </div>

            {/* Subject Header */}
            <div className="mb-6">
              <SubjectHeader
                subject={currentSubject}
                examType={examMode}
                totalChapters={currentChapters.length}
                completedChapters={0}
                totalQuestions={currentChapters.reduce((acc, ch) => acc + ch.totalQuestions, 0)}
              />
            </div>

            {/* Chapter List */}
            <ChapterList
              chapters={transformedChapters}
              examType={examMode}
              subjectId={activeSubject}
              showFilters={true}
              showViewToggle={true}
            />
          </motion.div>
        </section>

        {/* High Weightage Chapters Section */}
        <section className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                High Weightage Chapters - {examMode === 'JEE_MAIN' ? 'JEE Main' : 'JEE Advanced'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(jeeChaptersData)
                  .flatMap(([subject, chapters]) =>
                    chapters.map((ch) => ({
                      ...ch,
                      subject,
                      weightage:
                        examMode === 'JEE_MAIN' ? ch.jeeMainWeightage : ch.jeeAdvancedWeightage,
                    }))
                  )
                  .filter((ch) => ch.weightage > 0)
                  .sort((a, b) => (b.weightage || 0) - (a.weightage || 0))
                  .slice(0, 6)
                  .map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/jee/${chapter.subject}/${chapter.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{chapter.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {chapter.subject}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'ml-2',
                          (chapter.weightage || 0) >= 8
                            ? 'text-red-500 border-red-500/50'
                            : 'text-orange-500 border-orange-500/50'
                        )}
                      >
                        {chapter.weightage}%
                      </Badge>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Exam Info Section */}
        <section className="container py-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {examMode === 'JEE_MAIN' ? 'JEE Main' : 'JEE Advanced'} Exam Pattern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {examMode === 'JEE_MAIN' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Questions</p>
                        <p className="text-xl font-semibold">90</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="text-xl font-semibold">300</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-xl font-semibold">3 Hours</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Marking Scheme</p>
                        <p className="text-xl font-semibold">+4 / -1</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Subject-wise Questions</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Physics</span>
                          <span className="text-sm font-medium">30 Questions (100 Marks)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Chemistry</span>
                          <span className="text-sm font-medium">30 Questions (100 Marks)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mathematics</span>
                          <span className="text-sm font-medium">30 Questions (100 Marks)</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Questions</p>
                        <p className="text-xl font-semibold">54</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="text-xl font-semibold">360</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-xl font-semibold">3 Hours (Each Paper)</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Papers</p>
                        <p className="text-xl font-semibold">2 (Paper 1 & 2)</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Question Types</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">MCQs</span>
                          <span className="text-sm font-medium">+4 / -2</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Numerical Type</span>
                          <span className="text-sm font-medium">+4 / 0</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Study Tips for {examMode === 'JEE_MAIN' ? 'JEE Main' : 'JEE Advanced'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {examMode === 'JEE_MAIN' ? (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Focus on NCERT for Chemistry - most questions are NCERT-based
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Practice speed and accuracy - time management is crucial
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Solve previous 10 years papers for pattern understanding
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Focus on high-weightage chapters for maximum ROI
                        </span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Focus on conceptual understanding over memorization
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Practice multi-concept problems that combine topics
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Master all question types: MCQs, numerical, comprehension-based
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Solve previous years papers to understand the depth required
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

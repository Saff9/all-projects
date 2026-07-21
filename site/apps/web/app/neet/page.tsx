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
  neetSubjects,
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
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// NEET Chapter Data
const neetChaptersData = {
  physics: [
    { id: 'p1', name: 'Physical World and Measurement', chapterNumber: 1, weightage: 2, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 45, estimatedHours: 4 },
    { id: 'p2', name: 'Units and Dimensions', chapterNumber: 2, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 52, estimatedHours: 5 },
    { id: 'p3', name: 'Motion in a Straight Line', chapterNumber: 3, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 78, estimatedHours: 6 },
    { id: 'p4', name: 'Motion in a Plane', chapterNumber: 4, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 85, estimatedHours: 7 },
    { id: 'p5', name: 'Laws of Motion', chapterNumber: 5, weightage: 7, difficultyLevel: 'medium' as const, totalTopics: 8, totalQuestions: 120, estimatedHours: 10 },
    { id: 'p6', name: 'Work, Energy and Power', chapterNumber: 6, weightage: 6, difficultyLevel: 'medium' as const, totalTopics: 7, totalQuestions: 95, estimatedHours: 8 },
    { id: 'p7', name: 'System of Particles and Rotational Motion', chapterNumber: 7, weightage: 8, difficultyLevel: 'hard' as const, totalTopics: 10, totalQuestions: 150, estimatedHours: 12 },
    { id: 'p8', name: 'Gravitation', chapterNumber: 8, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 6 },
    { id: 'p9', name: 'Mechanical Properties of Solids', chapterNumber: 9, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 5 },
    { id: 'p10', name: 'Mechanical Properties of Fluids', chapterNumber: 10, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 90, estimatedHours: 8 },
    { id: 'p11', name: 'Thermal Properties of Matter', chapterNumber: 11, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 75, estimatedHours: 6 },
    { id: 'p12', name: 'Thermodynamics', chapterNumber: 12, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 110, estimatedHours: 9 },
    { id: 'p13', name: 'Kinetic Theory', chapterNumber: 13, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 50, estimatedHours: 4 },
    { id: 'p14', name: 'Oscillations', chapterNumber: 14, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 72, estimatedHours: 6 },
    { id: 'p15', name: 'Waves', chapterNumber: 15, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 68, estimatedHours: 6 },
    { id: 'p16', name: 'Electric Charges and Fields', chapterNumber: 16, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 88, estimatedHours: 7 },
    { id: 'p17', name: 'Electrostatic Potential and Capacitance', chapterNumber: 17, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 105, estimatedHours: 9 },
    { id: 'p18', name: 'Current Electricity', chapterNumber: 18, weightage: 8, difficultyLevel: 'hard' as const, totalTopics: 9, totalQuestions: 140, estimatedHours: 11 },
    { id: 'p19', name: 'Moving Charges and Magnetism', chapterNumber: 19, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 100, estimatedHours: 8 },
    { id: 'p20', name: 'Magnetism and Matter', chapterNumber: 20, weightage: 3, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 5 },
    { id: 'p21', name: 'Electromagnetic Induction', chapterNumber: 21, weightage: 5, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 85, estimatedHours: 7 },
    { id: 'p22', name: 'Alternating Current', chapterNumber: 22, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 80, estimatedHours: 7 },
    { id: 'p23', name: 'Electromagnetic Waves', chapterNumber: 23, weightage: 2, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 40, estimatedHours: 3 },
    { id: 'p24', name: 'Ray Optics and Optical Instruments', chapterNumber: 24, weightage: 7, difficultyLevel: 'medium' as const, totalTopics: 8, totalQuestions: 125, estimatedHours: 10 },
    { id: 'p25', name: 'Wave Optics', chapterNumber: 25, weightage: 5, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 90, estimatedHours: 8 },
    { id: 'p26', name: 'Dual Nature of Radiation and Matter', chapterNumber: 26, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 6 },
    { id: 'p27', name: 'Atoms', chapterNumber: 27, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 50, estimatedHours: 4 },
    { id: 'p28', name: 'Nuclei', chapterNumber: 28, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 65, estimatedHours: 5 },
    { id: 'p29', name: 'Semiconductor Electronics', chapterNumber: 29, weightage: 6, difficultyLevel: 'medium' as const, totalTopics: 7, totalQuestions: 100, estimatedHours: 8 },
  ],
  chemistry: [
    { id: 'c1', name: 'Some Basic Concepts of Chemistry', chapterNumber: 1, weightage: 4, difficultyLevel: 'easy' as const, totalTopics: 5, totalQuestions: 75, estimatedHours: 6 },
    { id: 'c2', name: 'Structure of Atom', chapterNumber: 2, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 90, estimatedHours: 8 },
    { id: 'c3', name: 'Classification of Elements and Periodicity', chapterNumber: 3, weightage: 4, difficultyLevel: 'easy' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 5 },
    { id: 'c4', name: 'Chemical Bonding and Molecular Structure', chapterNumber: 4, weightage: 8, difficultyLevel: 'hard' as const, totalTopics: 10, totalQuestions: 150, estimatedHours: 12 },
    { id: 'c5', name: 'States of Matter', chapterNumber: 5, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 4 },
    { id: 'c6', name: 'Thermodynamics', chapterNumber: 6, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 110, estimatedHours: 9 },
    { id: 'c7', name: 'Equilibrium', chapterNumber: 7, weightage: 8, difficultyLevel: 'hard' as const, totalTopics: 9, totalQuestions: 145, estimatedHours: 11 },
    { id: 'c8', name: 'Redox Reactions', chapterNumber: 8, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 72, estimatedHours: 6 },
    { id: 'c9', name: 'Hydrogen', chapterNumber: 9, weightage: 2, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 40, estimatedHours: 3 },
    { id: 'c10', name: 'The s-Block Elements', chapterNumber: 10, weightage: 4, difficultyLevel: 'easy' as const, totalTopics: 5, totalQuestions: 65, estimatedHours: 5 },
    { id: 'c11', name: 'The p-Block Elements (Group 13-14)', chapterNumber: 11, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 85, estimatedHours: 7 },
    { id: 'c12', name: 'Organic Chemistry - Some Basic Principles', chapterNumber: 12, weightage: 7, difficultyLevel: 'medium' as const, totalTopics: 8, totalQuestions: 120, estimatedHours: 10 },
    { id: 'c13', name: 'Hydrocarbons', chapterNumber: 13, weightage: 6, difficultyLevel: 'medium' as const, totalTopics: 7, totalQuestions: 100, estimatedHours: 8 },
    { id: 'c14', name: 'Environmental Chemistry', chapterNumber: 14, weightage: 2, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 35, estimatedHours: 3 },
    { id: 'c15', name: 'Solid State', chapterNumber: 15, weightage: 3, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 5 },
    { id: 'c16', name: 'Solutions', chapterNumber: 16, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 90, estimatedHours: 7 },
    { id: 'c17', name: 'Electrochemistry', chapterNumber: 17, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 105, estimatedHours: 9 },
    { id: 'c18', name: 'Chemical Kinetics', chapterNumber: 18, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 100, estimatedHours: 8 },
    { id: 'c19', name: 'Surface Chemistry', chapterNumber: 19, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 50, estimatedHours: 4 },
    { id: 'c20', name: 'General Principles of Isolation of Elements', chapterNumber: 20, weightage: 3, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 4 },
    { id: 'c21', name: 'The p-Block Elements (Group 15-18)', chapterNumber: 21, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 88, estimatedHours: 7 },
    { id: 'c22', name: 'The d and f Block Elements', chapterNumber: 22, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 85, estimatedHours: 7 },
    { id: 'c23', name: 'Coordination Compounds', chapterNumber: 23, weightage: 7, difficultyLevel: 'hard' as const, totalTopics: 8, totalQuestions: 125, estimatedHours: 10 },
    { id: 'c24', name: 'Haloalkanes and Haloarenes', chapterNumber: 24, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 85, estimatedHours: 7 },
    { id: 'c25', name: 'Alcohols, Phenols and Ethers', chapterNumber: 25, weightage: 6, difficultyLevel: 'medium' as const, totalTopics: 7, totalQuestions: 100, estimatedHours: 8 },
    { id: 'c26', name: 'Aldehydes, Ketones and Carboxylic Acids', chapterNumber: 26, weightage: 8, difficultyLevel: 'hard' as const, totalTopics: 9, totalQuestions: 140, estimatedHours: 11 },
    { id: 'c27', name: 'Amines', chapterNumber: 27, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 72, estimatedHours: 6 },
    { id: 'c28', name: 'Biomolecules', chapterNumber: 28, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 85, estimatedHours: 7 },
    { id: 'c29', name: 'Polymers', chapterNumber: 29, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 50, estimatedHours: 4 },
    { id: 'c30', name: 'Chemistry in Everyday Life', chapterNumber: 30, weightage: 2, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 40, estimatedHours: 3 },
  ],
  biology: [
    { id: 'b1', name: 'The Living World', chapterNumber: 1, weightage: 2, difficultyLevel: 'easy' as const, totalTopics: 3, totalQuestions: 45, estimatedHours: 3 },
    { id: 'b2', name: 'Biological Classification', chapterNumber: 2, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 80, estimatedHours: 5 },
    { id: 'b3', name: 'Plant Kingdom', chapterNumber: 3, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 75, estimatedHours: 5 },
    { id: 'b4', name: 'Animal Kingdom', chapterNumber: 4, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 95, estimatedHours: 6 },
    { id: 'b5', name: 'Morphology of Flowering Plants', chapterNumber: 5, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 72, estimatedHours: 5 },
    { id: 'b6', name: 'Anatomy of Flowering Plants', chapterNumber: 6, weightage: 3, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 60, estimatedHours: 4 },
    { id: 'b7', name: 'Structural Organisation in Animals', chapterNumber: 7, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 4 },
    { id: 'b8', name: 'Cell: The Unit of Life', chapterNumber: 8, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 78, estimatedHours: 5 },
    { id: 'b9', name: 'Biomolecules', chapterNumber: 9, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 110, estimatedHours: 8 },
    { id: 'b10', name: 'Cell Cycle and Cell Division', chapterNumber: 10, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 90, estimatedHours: 6 },
    { id: 'b11', name: 'Transport in Plants', chapterNumber: 11, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 75, estimatedHours: 5 },
    { id: 'b12', name: 'Mineral Nutrition', chapterNumber: 12, weightage: 3, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 60, estimatedHours: 4 },
    { id: 'b13', name: 'Photosynthesis in Higher Plants', chapterNumber: 13, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 105, estimatedHours: 8 },
    { id: 'b14', name: 'Respiration in Plants', chapterNumber: 14, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 72, estimatedHours: 5 },
    { id: 'b15', name: 'Plant Growth and Development', chapterNumber: 15, weightage: 3, difficultyLevel: 'medium' as const, totalTopics: 4, totalQuestions: 58, estimatedHours: 4 },
    { id: 'b16', name: 'Digestion and Absorption', chapterNumber: 16, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 5 },
    { id: 'b17', name: 'Breathing and Exchange of Gases', chapterNumber: 17, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 68, estimatedHours: 5 },
    { id: 'b18', name: 'Body Fluids and Circulation', chapterNumber: 18, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 85, estimatedHours: 6 },
    { id: 'b19', name: 'Excretory Products and their Elimination', chapterNumber: 19, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 72, estimatedHours: 5 },
    { id: 'b20', name: 'Locomotion and Movement', chapterNumber: 20, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 4 },
    { id: 'b21', name: 'Neural Control and Coordination', chapterNumber: 21, weightage: 5, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 88, estimatedHours: 6 },
    { id: 'b22', name: 'Chemical Coordination and Integration', chapterNumber: 22, weightage: 5, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 90, estimatedHours: 6 },
    { id: 'b23', name: 'Reproduction in Organisms', chapterNumber: 23, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 50, estimatedHours: 3 },
    { id: 'b24', name: 'Sexual Reproduction in Flowering Plants', chapterNumber: 24, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 85, estimatedHours: 6 },
    { id: 'b25', name: 'Human Reproduction', chapterNumber: 25, weightage: 7, difficultyLevel: 'hard' as const, totalTopics: 8, totalQuestions: 120, estimatedHours: 8 },
    { id: 'b26', name: 'Reproductive Health', chapterNumber: 26, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 52, estimatedHours: 3 },
    { id: 'b27', name: 'Principles of Inheritance and Variation', chapterNumber: 27, weightage: 6, difficultyLevel: 'hard' as const, totalTopics: 7, totalQuestions: 105, estimatedHours: 7 },
    { id: 'b28', name: 'Molecular Basis of Inheritance', chapterNumber: 28, weightage: 8, difficultyLevel: 'hard' as const, totalTopics: 9, totalQuestions: 140, estimatedHours: 10 },
    { id: 'b29', name: 'Evolution', chapterNumber: 29, weightage: 5, difficultyLevel: 'medium' as const, totalTopics: 6, totalQuestions: 88, estimatedHours: 6 },
    { id: 'b30', name: 'Human Health and Disease', chapterNumber: 30, weightage: 6, difficultyLevel: 'medium' as const, totalTopics: 7, totalQuestions: 100, estimatedHours: 7 },
    { id: 'b31', name: 'Strategies for Enhancement in Food Production', chapterNumber: 31, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 50, estimatedHours: 3 },
    { id: 'b32', name: 'Microbes in Human Welfare', chapterNumber: 32, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 52, estimatedHours: 3 },
    { id: 'b33', name: 'Biotechnology: Principles and Processes', chapterNumber: 33, weightage: 5, difficultyLevel: 'hard' as const, totalTopics: 6, totalQuestions: 90, estimatedHours: 6 },
    { id: 'b34', name: 'Biotechnology and its Applications', chapterNumber: 34, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 75, estimatedHours: 5 },
    { id: 'b35', name: 'Organisms and Populations', chapterNumber: 35, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 70, estimatedHours: 5 },
    { id: 'b36', name: 'Ecosystem', chapterNumber: 36, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 72, estimatedHours: 5 },
    { id: 'b37', name: 'Biodiversity and Conservation', chapterNumber: 37, weightage: 4, difficultyLevel: 'medium' as const, totalTopics: 5, totalQuestions: 68, estimatedHours: 4 },
    { id: 'b38', name: 'Environmental Issues', chapterNumber: 38, weightage: 3, difficultyLevel: 'easy' as const, totalTopics: 4, totalQuestions: 55, estimatedHours: 3 },
  ],
};

// Calculate totals
const totalChapters = 29 + 30 + 38; // 97 chapters
const totalPYQs = Object.values(neetChaptersData).flat().reduce((acc, ch) => acc + ch.totalQuestions, 0);
const totalEstimatedHours = Object.values(neetChaptersData).flat().reduce((acc, ch) => acc + (ch.estimatedHours || 0), 0);

export default function NEETPage() {
  const [activeSubject, setActiveSubject] = useState('physics');

  // Get current subject data
  const currentSubject = neetSubjects.find((s) => s.id === activeSubject)!;
  const currentChapters = neetChaptersData[activeSubject as keyof typeof neetChaptersData] || [];

  // Transform chapters for ChapterList component
  const transformedChapters = currentChapters.map((ch) => ({
    ...ch,
    slug: ch.id,
    subjectId: activeSubject,
    subjectName: currentSubject.name,
    subjectSlug: currentSubject.slug,
    examType: 'NEET' as const,
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
          <div className="absolute inset-0 bg-gradient-to-r from-biology/10 via-physics/10 to-chemistry/10" />
          <div className="container relative py-12 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <Badge variant="outline" className="mb-4 text-biology border-biology/50">
                NEET 2025
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                NEET Preparation Roadmap
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete syllabus coverage with chapter-wise PYQs, progress tracking, and 
                personalized study recommendations for Physics, Chemistry & Biology
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
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
                  <FileText className="h-8 w-8 mx-auto mb-2 text-biology" />
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
                  <p className="text-3xl font-bold">720</p>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" asChild>
                <Link href="/pyqs?exam=NEET">
                  <FileText className="h-5 w-5 mr-2" />
                  Practice PYQs
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/mock-tests?exam=NEET">
                  <Timer className="h-5 w-5 mr-2" />
                  Take Mock Test
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/resources?exam=NEET">
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
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Subject Tabs */}
            <div className="mb-6">
              <SubjectTabs
                subjects={neetSubjects.map((s) => ({
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
                examType="NEET"
                totalChapters={currentChapters.length}
                completedChapters={0}
                totalQuestions={currentChapters.reduce((acc, ch) => acc + ch.totalQuestions, 0)}
              />
            </div>

            {/* Chapter List */}
            <ChapterList
              chapters={transformedChapters}
              examType="NEET"
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
                High Weightage Chapters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(neetChaptersData)
                  .flatMap(([subject, chapters]) =>
                    chapters.map((ch) => ({ ...ch, subject }))
                  )
                  .sort((a, b) => (b.weightage || 0) - (a.weightage || 0))
                  .slice(0, 6)
                  .map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/neet/${chapter.subject}/${chapter.id}`}
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
                          (chapter.weightage || 0) >= 7
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
                  NEET 2025 Exam Pattern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-xl font-semibold">200</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Marks</p>
                    <p className="text-xl font-semibold">720</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-xl font-semibold">3 Hours 20 Minutes</p>
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
                      <span className="text-sm font-medium">50 Questions (180 Marks)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Chemistry</span>
                      <span className="text-sm font-medium">50 Questions (180 Marks)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Biology (Botany + Zoology)</span>
                      <span className="text-sm font-medium">100 Questions (360 Marks)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Study Tips for NEET
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Focus on NCERT textbooks - 80%+ questions are directly from NCERT
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Biology carries 50% weightage - prioritize it for maximum marks
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Practice previous year questions to understand the pattern
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Take regular mock tests to improve speed and accuracy
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Focus on high-weightage chapters first for better ROI
                    </span>
                  </li>
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

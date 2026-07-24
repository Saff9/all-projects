'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  BookOpen,
  Calendar,
  Tag,
  Layers,
  Target,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PYQFilterState {
  examType: ExamType | 'all';
  years: number[];
  subject: string | 'all';
  chapter: string | 'all';
  topic: string | 'all';
  difficulty: DifficultyLevel | 'all';
  status: QuestionStatus | 'all';
  searchQuery: string;
}

export type ExamType = 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'all' | 'solved' | 'unsolved' | 'marked';

export interface PYQFilterProps {
  value: PYQFilterState;
  onChange: (filter: PYQFilterState) => void;
  subjects?: Subject[];
  chapters?: Chapter[];
  topics?: Topic[];
  showSearch?: boolean;
  showYearFilter?: boolean;
  showDifficultyFilter?: boolean;
  showStatusFilter?: boolean;
  showChapterFilter?: boolean;
  showTopicFilter?: boolean;
  variant?: 'inline' | 'panel' | 'drawer';
  className?: string;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
}

interface Chapter {
  id: string;
  name: string;
  subjectId: string;
}

interface Topic {
  id: string;
  name: string;
  chapterId: string;
}

const examTypes: { value: ExamType | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Exams', color: 'bg-gray-500' },
  { value: 'NEET', label: 'NEET', color: 'bg-biology' },
  { value: 'JEE_MAIN', label: 'JEE Main', color: 'bg-physics' },
  { value: 'JEE_ADVANCED', label: 'JEE Advanced', color: 'bg-mathematics' },
];

const years = Array.from({ length: 10 }, (_, i) => 2024 - i);
const difficulties: { value: DifficultyLevel | 'all'; label: string; color?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy', color: 'text-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'hard', label: 'Hard', color: 'text-red-500' },
];

const statuses: { value: QuestionStatus; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Target },
  { value: 'solved', label: 'Solved', icon: Check },
  { value: 'unsolved', label: 'Unsolved', icon: BookOpen },
  { value: 'marked', label: 'Marked', icon: Clock },
];

export function PYQFilter({
  value,
  onChange,
  subjects = [],
  chapters = [],
  topics = [],
  showSearch = true,
  showYearFilter = true,
  showDifficultyFilter = true,
  showStatusFilter = true,
  showChapterFilter = true,
  showTopicFilter = true,
  variant = 'inline',
  className,
}: PYQFilterProps) {
  const [isExpanded, setIsExpanded] = useState(variant === 'panel');
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  // Filter chapters based on selected subject
  const filteredChapters = useMemo(() => {
    if (value.subject === 'all') return chapters;
    return chapters.filter((ch) => ch.subjectId === value.subject);
  }, [chapters, value.subject]);

  // Filter topics based on selected chapter
  const filteredTopics = useMemo(() => {
    if (value.chapter === 'all') return topics;
    return topics.filter((t) => t.chapterId === value.chapter);
  }, [topics, value.chapter]);

  const updateFilter = <K extends keyof PYQFilterState>(
    key: K,
    newValue: PYQFilterState[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  const toggleYear = (year: number) => {
    const newYears = value.years.includes(year)
      ? value.years.filter((y) => y !== year)
      : [...value.years, year];
    updateFilter('years', newYears);
  };

  const clearFilters = () => {
    onChange({
      examType: 'all',
      years: [],
      subject: 'all',
      chapter: 'all',
      topic: 'all',
      difficulty: 'all',
      status: 'all',
      searchQuery: '',
    });
  };

  const hasActiveFilters =
    value.examType !== 'all' ||
    value.years.length > 0 ||
    value.subject !== 'all' ||
    value.chapter !== 'all' ||
    value.topic !== 'all' ||
    value.difficulty !== 'all' ||
    value.status !== 'all' ||
    value.searchQuery !== '';

  const activeFilterCount = [
    value.examType !== 'all',
    value.years.length > 0,
    value.subject !== 'all',
    value.chapter !== 'all',
    value.topic !== 'all',
    value.difficulty !== 'all',
    value.status !== 'all',
    value.searchQuery !== '',
  ].filter(Boolean).length;

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={value.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Exam Type */}
          <Select
            value={value.examType}
            onValueChange={(v) => updateFilter('examType', v as ExamType | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Exam" />
            </SelectTrigger>
            <SelectContent>
              {examTypes.map((exam) => (
                <SelectItem key={exam.value} value={exam.value}>
                  {exam.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject */}
          <Select
            value={value.subject}
            onValueChange={(v) => {
              updateFilter('subject', v);
              updateFilter('chapter', 'all');
              updateFilter('topic', 'all');
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty */}
          {showDifficultyFilter && (
            <Select
              value={value.difficulty}
              onValueChange={(v) => updateFilter('difficulty', v as DifficultyLevel | 'all')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* More Filters Button */}
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(isExpanded && 'bg-primary/10')}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Year Filter */}
                    {showYearFilter && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Year
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {years.slice(0, 6).map((year) => (
                            <Button
                              key={year}
                              size="sm"
                              variant={value.years.includes(year) ? 'default' : 'outline'}
                              onClick={() => toggleYear(year)}
                              className="h-7 text-xs"
                            >
                              {year}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chapter Filter */}
                    {showChapterFilter && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          Chapter
                        </label>
                        <Select
                          value={value.chapter}
                          onValueChange={(v) => {
                            updateFilter('chapter', v);
                            updateFilter('topic', 'all');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Chapters" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Chapters</SelectItem>
                            {filteredChapters.map((chapter) => (
                              <SelectItem key={chapter.id} value={chapter.id}>
                                {chapter.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Topic Filter */}
                    {showTopicFilter && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Layers className="h-4 w-4" />
                          Topic
                        </label>
                        <Select
                          value={value.topic}
                          onValueChange={(v) => updateFilter('topic', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Topics" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Topics</SelectItem>
                            {filteredTopics.map((topic) => (
                              <SelectItem key={topic.id} value={topic.id}>
                                {topic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Status Filter */}
                    {showStatusFilter && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Status
                        </label>
                        <Select
                          value={value.status}
                          onValueChange={(v) => updateFilter('status', v as QuestionStatus)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {value.examType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Exam: {examTypes.find((e) => e.value === value.examType)?.label}
                <button onClick={() => updateFilter('examType', 'all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {value.years.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                Years: {value.years.join(', ')}
                <button onClick={() => updateFilter('years', [])}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {value.subject !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Subject: {subjects.find((s) => s.id === value.subject)?.name}
                <button
                  onClick={() => {
                    updateFilter('subject', 'all');
                    updateFilter('chapter', 'all');
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {value.difficulty !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Difficulty: {value.difficulty}
                <button onClick={() => updateFilter('difficulty', 'all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  // Panel variant
  return (
    <Card className={cn('sticky top-4', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={value.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Exam Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Exam Type</label>
          <div className="grid grid-cols-2 gap-2">
            {examTypes.map((exam) => (
              <Button
                key={exam.value}
                size="sm"
                variant={value.examType === exam.value ? 'default' : 'outline'}
                onClick={() => updateFilter('examType', exam.value)}
                className={cn(
                  value.examType === exam.value && exam.color,
                  'justify-start'
                )}
              >
                {exam.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Year */}
        {showYearFilter && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <div className="flex flex-wrap gap-1">
              {years.map((year) => (
                <Button
                  key={year}
                  size="sm"
                  variant={value.years.includes(year) ? 'default' : 'outline'}
                  onClick={() => toggleYear(year)}
                  className="h-7 text-xs"
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <Select
            value={value.subject}
            onValueChange={(v) => {
              updateFilter('subject', v);
              updateFilter('chapter', 'all');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chapter */}
        {showChapterFilter && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Chapter</label>
            <Select
              value={value.chapter}
              onValueChange={(v) => updateFilter('chapter', v)}
              disabled={value.subject === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {filteredChapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Difficulty */}
        {showDifficultyFilter && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <div className="flex gap-2">
              {difficulties.slice(1).map((diff) => (
                <Button
                  key={diff.value}
                  size="sm"
                  variant={value.difficulty === diff.value ? 'default' : 'outline'}
                  onClick={() =>
                    updateFilter(
                      'difficulty',
                      value.difficulty === diff.value ? 'all' : diff.value
                    )
                  }
                  className="flex-1"
                >
                  {diff.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {showStatusFilter && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={value.status}
              onValueChange={(v) => updateFilter('status', v as QuestionStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Default filter state
export const defaultFilterState: PYQFilterState = {
  examType: 'all',
  years: [],
  subject: 'all',
  chapter: 'all',
  topic: 'all',
  difficulty: 'all',
  status: 'all',
  searchQuery: '',
};

export default PYQFilter;
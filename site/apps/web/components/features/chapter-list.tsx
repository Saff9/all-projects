'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  X,
} from 'lucide-react';
import { ChapterCard, ChapterCardSkeleton } from './chapter-card';
import { cn } from '@/lib/utils';

export interface ChapterListProps {
  chapters: Chapter[];
  isLoading?: boolean;
  examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
  subjectId?: string;
  showFilters?: boolean;
  showViewToggle?: boolean;
  defaultView?: 'grid' | 'list';
  className?: string;
}

export interface Chapter {
  id: string;
  name: string;
  slug: string;
  chapterNumber?: number;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
  weightage?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  totalTopics: number;
  totalQuestions: number;
  estimatedHours?: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'revision';
  completionPercentage?: number;
  topics?: Topic[];
  ncertLink?: string;
  isWeakChapter?: boolean;
}

interface Topic {
  id: string;
  name: string;
  topicNumber?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
}

type SortOption = 'default' | 'weightage' | 'name' | 'difficulty' | 'progress';
type FilterStatus = 'all' | 'not_started' | 'in_progress' | 'completed' | 'revision';
type FilterDifficulty = 'all' | 'easy' | 'medium' | 'hard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export function ChapterList({
  chapters,
  isLoading = false,
  examType,
  subjectId,
  showFilters = true,
  showViewToggle = true,
  defaultView = 'grid',
  className,
}: ChapterListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Filter and sort chapters
  const filteredChapters = useMemo(() => {
    let result = [...chapters];

    // Filter by subject if provided
    if (subjectId) {
      result = result.filter((ch) => ch.subjectId === subjectId);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ch) =>
          ch.name.toLowerCase().includes(query) ||
          ch.subjectName.toLowerCase().includes(query) ||
          ch.topics?.some((t) => t.name.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((ch) => ch.status === filterStatus);
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      result = result.filter((ch) => ch.difficultyLevel === filterDifficulty);
    }

    // Sorting
    if (sortBy !== 'default') {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'weightage':
            comparison = (b.weightage || 0) - (a.weightage || 0);
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'difficulty':
            const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
            comparison =
              (difficultyOrder[a.difficultyLevel || 'medium'] || 2) -
              (difficultyOrder[b.difficultyLevel || 'medium'] || 2);
            break;
          case 'progress':
            comparison = (b.completionPercentage || 0) - (a.completionPercentage || 0);
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [chapters, subjectId, searchQuery, sortBy, sortOrder, filterStatus, filterDifficulty]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterDifficulty('all');
    setSortBy('default');
  };

  const hasActiveFilters =
    searchQuery !== '' || filterStatus !== 'all' || filterDifficulty !== 'all' || sortBy !== 'default';

  // Count chapters by status
  const statusCounts = useMemo(() => {
    const counts = {
      all: chapters.length,
      not_started: 0,
      in_progress: 0,
      completed: 0,
      revision: 0,
    };
    chapters.forEach((ch) => {
      if (ch.status) counts[ch.status]++;
    });
    return counts;
  }, [chapters]);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex gap-4">
          <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ChapterCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Bar */}
      {showFilters && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={cn(showFilterPanel && 'bg-primary/10')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  Active
                </Badge>
              )}
            </Button>

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg">
                  {/* Status Filter */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Status</label>
                    <Select
                      value={filterStatus}
                      onValueChange={(v) => setFilterStatus(v as FilterStatus)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                        <SelectItem value="not_started">
                          Not Started ({statusCounts.not_started})
                        </SelectItem>
                        <SelectItem value="in_progress">
                          In Progress ({statusCounts.in_progress})
                        </SelectItem>
                        <SelectItem value="completed">
                          Completed ({statusCounts.completed})
                        </SelectItem>
                        <SelectItem value="revision">
                          Revision ({statusCounts.revision})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty Filter */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Difficulty</label>
                    <Select
                      value={filterDifficulty}
                      onValueChange={(v) => setFilterDifficulty(v as FilterDifficulty)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Sort By</label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as SortOption)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="weightage">Weightage</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="difficulty">Difficulty</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Order</label>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-[140px]"
                    >
                      {sortOrder === 'asc' ? (
                        <>
                          <SortAsc className="h-4 w-4 mr-2" />
                          Ascending
                        </>
                      ) : (
                        <>
                          <SortDesc className="h-4 w-4 mr-2" />
                          Descending
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="flex items-end">
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredChapters.length} of {chapters.length} chapters
        </p>
      </div>

      {/* Chapter Grid/List */}
      {filteredChapters.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredChapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              {...chapter}
              examType={examType}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default ChapterList;
import { useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '@/lib/api';

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description?: string;
  unitName?: string;
  unitNumber?: number;
  chapterNumber?: number;
  neetWeightage?: number;
  jeeMainWeightage?: number;
  jeeAdvancedWeightage?: number;
  totalTopics: number;
  totalQuestions: number;
  estimatedHours?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  displayOrder: number;
  subject?: {
    id: string;
    name: string;
    slug: string;
  };
  topics?: Topic[];
  progress?: ChapterProgress;
}

export interface Topic {
  id: string;
  name: string;
  topicNumber?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  keyConcepts?: string[];
}

export interface ChapterProgress {
  status: 'not_started' | 'in_progress' | 'completed' | 'revision';
  completionPercentage: number;
  questionsAttempted: number;
  questionsCorrect: number;
  totalTimeSpentSeconds: number;
  isWeakChapter: boolean;
}

export interface ChapterFilter {
  examType?: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
  subjectId?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'revision';
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ChaptersResponse {
  success: boolean;
  data: Chapter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useChapters(filter: ChapterFilter = {}) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchChapters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter.examType) params.append('examType', filter.examType);
      if (filter.subjectId) params.append('subjectId', filter.subjectId);
      if (filter.status) params.append('status', filter.status);
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      if (filter.search) params.append('search', filter.search);
      if (filter.isActive !== undefined) params.append('isActive', String(filter.isActive));
      if (filter.page) params.append('page', String(filter.page));
      if (filter.limit) params.append('limit', String(filter.limit));

      const response = await api.get<ChaptersResponse>(
        `${endpoints.chapters.list}?${params.toString()}`
      );

      if (response.data.success) {
        setChapters(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch chapters');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  return {
    chapters,
    isLoading,
    error,
    pagination,
    refetch: fetchChapters,
  };
}

export function useChapter(id: string) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapter = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data: Chapter }>(
        endpoints.chapters.byId(id)
      );

      if (response.data.success) {
        setChapter(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch chapter');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

  return {
    chapter,
    isLoading,
    error,
    refetch: fetchChapter,
  };
}

export function useChaptersBySubject(subjectId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = useCallback(async () => {
    if (!subjectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data: Chapter[] }>(
        endpoints.chapters.bySubject(subjectId)
      );

      if (response.data.success) {
        setChapters(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch chapters');
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  return {
    chapters,
    isLoading,
    error,
    refetch: fetchChapters,
  };
}

export function useChapterProgress(chapterId: string) {
  const [progress, setProgress] = useState<ChapterProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!chapterId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        success: boolean;
        data: { chapter: Chapter; progress: ChapterProgress };
      }>(`/chapters/${chapterId}/progress`);

      if (response.data.success) {
        setProgress(response.data.data.progress);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch progress');
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  const updateProgress = useCallback(
    async (data: Partial<ChapterProgress>) => {
      if (!chapterId) return;

      try {
        const response = await api.patch<{
          success: boolean;
          data: ChapterProgress;
        }>(`/chapters/${chapterId}/progress`, data);

        if (response.data.success) {
          setProgress(response.data.data);
          return response.data.data;
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update progress');
      }
    },
    [chapterId]
  );

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    updateProgress,
    refetch: fetchProgress,
  };
}

export default useChapters;
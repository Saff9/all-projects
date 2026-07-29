import { useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '@/lib/api';

export interface UserProgress {
  id: string;
  userId: string;
  chapterId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'revision';
  completionPercentage: number;
  totalQuestions: number;
  questionsAttempted: number;
  questionsCorrect: number;
  questionsIncorrect: number;
  questionsSkipped: number;
  totalTimeSpentSeconds: number;
  accuracyPercentage?: number;
  isWeakChapter: boolean;
  revisionCount: number;
  lastAccessedAt?: string;
  chapter?: {
    id: string;
    name: string;
    slug: string;
    subjectId: string;
    subject?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface OverallProgress {
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  notStartedChapters: number;
  totalQuestions: number;
  questionsAttempted: number;
  questionsCorrect: number;
  overallAccuracy: number;
  totalTimeSpentHours: number;
  weakChapters: number;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  notStartedChapters: number;
  totalQuestions: number;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  weakChapters: number;
}

export interface ProgressFilter {
  subjectId?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'revision';
  isWeakChapter?: boolean;
}

export function useOverallProgress() {
  const [progress, setProgress] = useState<OverallProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        success: boolean;
        data: OverallProgress;
      }>(`${endpoints.users.progress}/overall`);

      if (response.data.success) {
        setProgress(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress,
  };
}

export function useSubjectProgress() {
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        success: boolean;
        data: SubjectProgress[];
      }>(`${endpoints.users.progress}/subjects`);

      if (response.data.success) {
        setSubjectsProgress(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch subject progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    subjectsProgress,
    isLoading,
    error,
    refetch: fetchProgress,
  };
}

export function useChapterProgressList(filter: ProgressFilter = {}) {
  const [progressList, setProgressList] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter.subjectId) params.append('subjectId', filter.subjectId);
      if (filter.status) params.append('status', filter.status);
      if (filter.isWeakChapter !== undefined)
        params.append('isWeakChapter', String(filter.isWeakChapter));

      const response = await api.get<{
        success: boolean;
        data: UserProgress[];
      }>(`${endpoints.users.progress}?${params.toString()}`);

      if (response.data.success) {
        setProgressList(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch progress');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progressList,
    isLoading,
    error,
    refetch: fetchProgress,
  };
}

export function useUpdateChapterProgress() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback(
    async (
      chapterId: string,
      data: {
        status?: 'not_started' | 'in_progress' | 'completed' | 'revision';
        completionPercentage?: number;
        isWeakChapter?: boolean;
      }
    ) => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await api.patch<{
          success: boolean;
          data: UserProgress;
        }>(`/progress/chapter/${chapterId}`, data);

        if (response.data.success) {
          return response.data.data;
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update progress');
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    updateProgress,
    isUpdating,
    error,
  };
}

export function useWeakChapters(limit: number = 10) {
  const [weakChapters, setWeakChapters] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeakChapters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        success: boolean;
        data: UserProgress[];
      }>(`${endpoints.users.progress}/weak?limit=${limit}`);

      if (response.data.success) {
        setWeakChapters(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch weak chapters');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchWeakChapters();
  }, [fetchWeakChapters]);

  return {
    weakChapters,
    isLoading,
    error,
    refetch: fetchWeakChapters,
  };
}

export function useStudyStreak() {
  const [streak, setStreak] = useState<{
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    weeklyGoalMinutes: number;
    weeklyMinutesLogged: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        success: boolean;
        data: {
          currentStreak: number;
          longestStreak: number;
          lastActivityDate: string | null;
          weeklyGoalMinutes: number;
          weeklyMinutesLogged: number;
        };
      }>(endpoints.users.streaks);

      if (response.data.success) {
        setStreak(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch streak');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak,
    isLoading,
    error,
    refetch: fetchStreak,
  };
}

export default useOverallProgress;
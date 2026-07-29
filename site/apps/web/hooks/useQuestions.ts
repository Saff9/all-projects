import { useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '@/lib/api';

export interface Question {
  id: string;
  topicId?: string;
  chapterId: string;
  subjectId: string;
  questionText: string;
  questionImageUrl?: string;
  questionType: 'mcq' | 'multiple_correct' | 'numerical' | 'assertion_reason' | 'matrix_match';
  difficultyLevel: 'easy' | 'medium' | 'hard';
  sourceType?: 'pyq' | 'ncert' | 'exemplar' | 'custom';
  sourceExam?: string;
  sourceYear?: number;
  forNeet: boolean;
  forJeeMain: boolean;
  forJeeAdvanced: boolean;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
  timesAttempted: number;
  timesCorrect: number;
  isActive: boolean;
  options?: QuestionOption[];
  chapter?: {
    id: string;
    name: string;
    slug: string;
    subject?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  topic?: {
    id: string;
    name: string;
  };
  userAttempt?: UserAttempt;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionLabel: string;
  optionText?: string;
  optionImageUrl?: string;
  isCorrect: boolean;
  explanation?: string;
  displayOrder: number;
}

export interface UserAttempt {
  id: string;
  userId: string;
  questionId: string;
  userAnswer: string[];
  isCorrect: boolean;
  timeTakenSeconds: number;
  attemptedAt: string;
  isBookmarked: boolean;
  isMarkedForReview: boolean;
}

export interface QuestionFilter {
  examType?: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  sourceType?: 'pyq' | 'ncert' | 'exemplar' | 'custom';
  sourceYear?: number;
  status?: 'all' | 'solved' | 'unsolved' | 'marked';
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface QuestionsResponse {
  success: boolean;
  data: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubmitAnswerRequest {
  answer: string | string[];
  timeTakenSeconds?: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  data: {
    isCorrect: boolean;
    correctAnswer: string[];
    explanation?: string;
    solutionText?: string;
  };
}

export function useQuestions(filter: QuestionFilter = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter.examType) params.append('examType', filter.examType);
      if (filter.subjectId) params.append('subjectId', filter.subjectId);
      if (filter.chapterId) params.append('chapterId', filter.chapterId);
      if (filter.topicId) params.append('topicId', filter.topicId);
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      if (filter.sourceType) params.append('sourceType', filter.sourceType);
      if (filter.sourceYear) params.append('sourceYear', String(filter.sourceYear));
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);
      if (filter.isActive !== undefined) params.append('isActive', String(filter.isActive));
      if (filter.page) params.append('page', String(filter.page));
      if (filter.limit) params.append('limit', String(filter.limit));

      const response = await api.get<QuestionsResponse>(
        `${endpoints.questions.list}?${params.toString()}`
      );

      if (response.data.success) {
        setQuestions(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    isLoading,
    error,
    pagination,
    refetch: fetchQuestions,
  };
}

export function useQuestion(id: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data: Question }>(
        endpoints.questions.byId(id)
      );

      if (response.data.success) {
        setQuestion(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch question');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  return {
    question,
    isLoading,
    error,
    refetch: fetchQuestion,
  };
}

export function useSubmitAnswer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAnswer = useCallback(
    async (questionId: string, answer: string | string[], timeTakenSeconds?: number) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await api.post<SubmitAnswerResponse>(
          `/questions/${questionId}/submit`,
          { answer, timeTakenSeconds } as SubmitAnswerRequest
        );

        if (response.data.success) {
          return response.data.data;
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to submit answer');
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    submitAnswer,
    isSubmitting,
    error,
  };
}

export function useBookmark() {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBookmark = useCallback(async (questionId: string) => {
    setIsBookmarking(true);
    setError(null);

    try {
      const response = await api.post<{ success: boolean; data: { isBookmarked: boolean } }>(
        `/questions/${questionId}/bookmark`
      );

      if (response.data.success) {
        return response.data.data.isBookmarked;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle bookmark');
    } finally {
      setIsBookmarking(false);
    }
  }, []);

  return {
    toggleBookmark,
    isBookmarking,
    error,
  };
}

export function useAddToMistakes() {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToMistakes = useCallback(
    async (questionId: string, notes?: string, mistakeType?: string) => {
      setIsAdding(true);
      setError(null);

      try {
        const response = await api.post<{ success: boolean; data: { id: string } }>(
          '/mistakes',
          {
            questionId,
            userNotes: notes,
            mistakeType,
          }
        );

        if (response.data.success) {
          return response.data.data.id;
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to add to mistakes');
      } finally {
        setIsAdding(false);
      }
    },
    []
  );

  return {
    addToMistakes,
    isAdding,
    error,
  };
}

export function usePYQs(examType?: string, year?: number, subjectId?: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPYQs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('sourceType', 'pyq');
      if (examType) params.append('sourceExam', examType);
      if (year) params.append('sourceYear', String(year));
      if (subjectId) params.append('subjectId', subjectId);

      const response = await api.get<QuestionsResponse>(
        `${endpoints.questions.pyq}?${params.toString()}`
      );

      if (response.data.success) {
        setQuestions(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch PYQs');
    } finally {
      setIsLoading(false);
    }
  }, [examType, year, subjectId]);

  useEffect(() => {
    fetchPYQs();
  }, [fetchPYQs]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchPYQs,
  };
}

export default useQuestions;
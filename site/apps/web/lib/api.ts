import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed.state?.accessToken;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from storage
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          const refreshToken = parsed.state?.refreshToken;

          if (refreshToken) {
            // Try to refresh the token
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            // Update tokens in storage
            const updatedStorage = {
              ...parsed,
              state: {
                ...parsed.state,
                accessToken,
                refreshToken: newRefreshToken,
              },
            };
            localStorage.setItem('auth-storage', JSON.stringify(updatedStorage));

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('auth-storage');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
  },
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    progress: '/users/progress',
    streaks: '/users/streaks',
  },
  subjects: {
    list: '/subjects',
    byId: (id: string) => `/subjects/${id}`,
    byExam: (examType: string) => `/subjects?examType=${examType}`,
  },
  chapters: {
    list: '/chapters',
    byId: (id: string) => `/chapters/${id}`,
    bySubject: (subjectId: string) => `/chapters/subject/${subjectId}`,
    byExam: (examType: string, subjectId?: string) => 
      `/chapters/exam/${examType}${subjectId ? `?subjectId=${subjectId}` : ''}`,
    progress: (chapterId: string) => `/chapters/${chapterId}/progress`,
    topics: (chapterId: string) => `/chapters/${chapterId}/topics`,
    resources: (chapterId: string) => `/chapters/${chapterId}/resources`,
    highWeightage: (examType: string, limit?: number) => 
      `/chapters/high-weightage/${examType}${limit ? `?limit=${limit}` : ''}`,
  },
  questions: {
    list: '/questions',
    byId: (id: string) => `/questions/${id}`,
    practice: '/questions/practice',
    pyq: '/questions/pyq',
    byChapter: (chapterId: string, limit?: number) => 
      `/questions/chapter/${chapterId}${limit ? `?limit=${limit}` : ''}`,
    byTopic: (topicId: string, limit?: number) => 
      `/questions/topic/${topicId}${limit ? `?limit=${limit}` : ''}`,
    random: '/questions/random',
    submit: (id: string) => `/questions/${id}/submit`,
    bookmark: (id: string) => `/questions/${id}/bookmark`,
    counts: '/questions/counts',
  },
  tests: {
    list: '/tests',
    byId: (id: string) => `/tests/${id}`,
    start: (id: string) => `/tests/${id}/start`,
    submit: (id: string) => `/tests/${id}/submit`,
    results: (attemptId: string) => `/tests/attempts/${attemptId}`,
    byExam: (examType: string) => `/tests?examType=${examType}`,
    bySubject: (subjectId: string) => `/tests?subjectId=${subjectId}`,
    attempts: '/tests/attempts',
  },
  mistakes: {
    list: '/mistakes',
    add: '/mistakes',
    byId: (id: string) => `/mistakes/${id}`,
    review: '/mistakes/review',
    byChapter: (chapterId: string) => `/mistakes/chapter/${chapterId}`,
    markMastered: (id: string) => `/mistakes/${id}/master`,
  },
  resources: {
    list: '/resources',
    byId: (id: string) => `/resources/${id}`,
    byChapter: (chapterId: string) => `/resources/chapter/${chapterId}`,
    byType: (type: string) => `/resources?type=${type}`,
  },
  progress: {
    overall: '/progress/overall',
    subjects: '/progress/subjects',
    chapters: '/progress/chapters',
    weak: '/progress/weak',
    updateChapter: (chapterId: string) => `/progress/chapter/${chapterId}`,
  },
};

export default api;

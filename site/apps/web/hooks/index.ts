// Chapter hooks
export {
  useChapters,
  useChapter,
  useChaptersBySubject,
  useChapterProgress,
} from './useChapters';
export type {
  Chapter,
  Topic,
  ChapterProgress,
  ChapterFilter,
  ChaptersResponse,
} from './useChapters';

// Question hooks
export {
  useQuestions,
  useQuestion,
  useSubmitAnswer,
  useBookmark,
  useAddToMistakes,
  usePYQs,
} from './useQuestions';
export type {
  Question,
  QuestionOption,
  UserAttempt,
  QuestionFilter,
  QuestionsResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from './useQuestions';

// Progress hooks
export {
  useOverallProgress,
  useSubjectProgress,
  useChapterProgressList,
  useUpdateChapterProgress,
  useWeakChapters,
  useStudyStreak,
} from './useProgress';
export type {
  UserProgress,
  OverallProgress,
  SubjectProgress,
  ProgressFilter,
} from './useProgress';
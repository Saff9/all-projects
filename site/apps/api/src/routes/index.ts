import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import subjectRoutes from './subjects.routes';
import chapterRoutes from './chapters.routes';
import questionRoutes from './questions.routes';
import testRoutes from './tests.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/subjects', subjectRoutes);
router.use('/chapters', chapterRoutes);
router.use('/questions', questionRoutes);
router.use('/tests', testRoutes);

export default router;

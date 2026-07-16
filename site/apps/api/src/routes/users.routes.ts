import { Router } from 'express';
import { getProfile, updateProfile, getUserProgress } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/progress', protect, getUserProgress);

export default router;

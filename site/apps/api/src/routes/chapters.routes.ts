import { Router } from 'express';
import { getChapters, getChapterById } from '../controllers/chapter.controller';

const router = Router();

router.get('/', getChapters);
router.get('/:id', getChapterById);

export default router;

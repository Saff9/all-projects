import { Router } from 'express';
import { getTests, getTestById } from '../controllers/test.controller';

const router = Router();

router.get('/', getTests);
router.get('/:id', getTestById);

export default router;

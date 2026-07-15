import { Router } from 'express';
import { getQuestions, getQuestionById } from '../controllers/question.controller';

const router = Router();

router.get('/', getQuestions);
router.get('/:id', getQuestionById);

export default router;

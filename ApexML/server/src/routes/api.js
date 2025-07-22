import express from 'express';
import { handleChat, handleTextToSpeech } from '../controllers/chatController.js';

const router = express.Router();

// --- Main Chat Endpoint ---
// Your frontend will send all chat messages here
router.post('/chat', handleChat);

// --- Text-to-Speech Endpoint ---
// Your frontend will send text here to get audio back
router.post('/tts', handleTextToSpeech);

export default router;

import { getBestTextResponse } from '../api/aiGateway.js';
import { generateSpeech } from '../api/elevenLabs.js';
import { searchVectorStore, saveToVectorStore } from '../api/vectorStore.js';

// Controller for the main /chat endpoint
export const handleChat = async (req, res) => {
  const { message, conversationHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    // --- THIS IS THE "LEARNING" PART ---
    // 1. First, try to find a similar answer in our own database
    const cachedResponse = await searchVectorStore(message);
    
    if (cachedResponse) {
      console.log('Serving response from vector store (cache).');
      return res.json({ 
        source: 'ApexAI Memory', 
        text: cachedResponse 
      });
    }

    // 2. If not found, call the external APIs
    console.log('No cache. Calling external AI gateway.');
    const aiResponse = await getBestTextResponse(message, conversationHistory);

    // 3. Save the new, good response to our database to "learn"
    if (aiResponse.text) {
      await saveToVectorStore(message, aiResponse.text);
    }
    
    // 4. Send the response back to the user
    res.json(aiResponse);

  } catch (error) {
    console.error('Error in chat controller:', error.message);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
};

// Controller for the /tts endpoint
export const handleTextToSpeech = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  try {
    const audioBuffer = await generateSpeech(text);
    
    // Set headers for audio and send the buffer
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);

  } catch (error) {
    console.error('Error in TTS controller:', error.message);
    res.status(500).json({ error: 'Failed to generate speech.' });
  }
};

import axios from 'axios';
import config from '../config/index.js';

// A popular default voice ID. You can change this.
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; 
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

export const generateSpeech = async (text) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenlabs.apiKey,
          'Accept': 'audio/mpeg',
        },
        responseType: 'arraybuffer', // Important: We want the raw audio file
      }
    );
    
    return response.data; // This is the audio buffer
  } catch (error) {
    console.error('ElevenLabs API error:', error.response?.data || error.message);
    throw new Error('Failed to generate speech.');
  }
};

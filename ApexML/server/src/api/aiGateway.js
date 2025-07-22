import axios from 'axios';
import config from '../config/index.js';

// Try Perplexity → Switch to Groq if it fails
export const getBestTextResponse = async (message, history = []) => {
  try {
    const res = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "llama-3-sonar-large-32k-online",
        messages: [...history, { role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${config.perplexity.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { source: "Perplexity", text: res.data.choices[0].message.content };
  } catch {}

  // --- Fallback: GROQ (very fast) ---
  const groqRes = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "mixtral-8x7b-32768",
      messages: [...history, { role: "user", content: message }],
    },
    {
      headers: {
        Authorization: `Bearer ${config.groq.apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return { source: "Groq", text: groqRes.data.choices[0].message.content };
};

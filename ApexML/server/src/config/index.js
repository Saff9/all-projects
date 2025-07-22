import dotenv from "dotenv";
dotenv.config();

export default {
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
};

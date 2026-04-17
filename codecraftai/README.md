# Code Craft Enterprise – Unified AI Generation Platform

Generate text, images, and videos with a **50+ AI Provider Ecosystem**, autonomous **Agent Skills**, persistent **Long-Term Memory**, real-time **API Streaming**, and military-grade **Encrypted Storage**. Deploy instantly on Vercel with zero configuration.

## 🚀 Enterprise Features

### 🧠 Massive 50+ AI Ecosystem
- **Core Providers**: Groq, Cerebras, NVIDIA, OpenRouter, Gemini, Hugging Face, DeepSeek.
- **Enterprise Endpoints**: Alibaba Cloud (Qwen-2.5, Qwen-Max), xAI (Grok), Together AI, Mistral, Anthropic, OpenAI, Perplexity, Cohere, Fireworks AI, and 30+ custom REST APIs.
- **Automated Model Discovery**: Automatically fetches and caches compatible models with Free/Paid tier badges and context limits.

### 🤖 Autonomous Agent Skills Engine
- **Open Claw Navigator**: Autonomous web search, URL scraping, and AST parsing.
- **Hermes Function Caller**: Multi-step reasoning and precise JSON schema adherence.
- **Pi Empathetic Reflection**: Real-time sentiment analysis and conversational alignment.
- **Open Code AI**: Repository AST context scanning and multi-file editing orchestration.

### 💾 Smart Long-Term Memory
- Learns your coding preferences, architectural context, and language rules autonomously.
- Uses strict relevance scoring (`confidence >= 0.90`) to filter out conversational noise.
- Extracted memory facts are stored locally and securely injected into future AI prompts.

### 📱 Deep Mobile Responsiveness & UI Overhaul
- **Dual Collapsible Drawers**: Elegant mobile overlays for Sidebar navigation and Chat History.
- **Fluid Grids**: Touch-friendly, fully responsive layouts for Dashboard analytics and Settings forms.
- **Claude AI Interactive Artifacts**: Code blocks and markdown documents render as interactive, glassmorphic Artifact Cards.
- **Multi-Format Export**: Export any chat or artifact instantly to **PDF, MD, TXT, or HTML**.

### 🔒 Enterprise Security
- **AES-GCM Local Encryption**: All chat history and memory facts are encrypted locally with a master passphrase.
- **OAuth Email Guard**: Access restricted explicitly to verified enterprise emails (`ALLOWED_EMAIL`).

## ⚡ Quick Deploy to Vercel (One-Click)

1. Fork or clone this repository.
2. Import the repository into your Vercel account.
3. Vercel will automatically detect the **Vite + React** frontend and **FastAPI Serverless** backend via the provided `vercel.json`.
4. Configure your environment variables in Vercel:
   - `ALLOWED_EMAIL` (e.g., `youremail@example.com` - REQUIRED)
   - `GROQ_API_KEY`
   - `CEREBRAS_API_KEY`
   - `NVIDIA_API_KEY`
   - `OPENROUTER_API_KEY`
   - `GEMINI_API_KEY`
   - `DEEPSEEK_API_KEY`
5. Click **Deploy**. The platform is instantly production-ready with full SPA routing and API streaming enabled.

## 🛠 Local Development

### Backend (FastAPI)
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```

## 📜 License
MIT License


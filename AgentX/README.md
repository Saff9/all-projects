# AgentX 🤖

**Autonomous AI Agent with OpenClaw-style streaming — deploys in one service, under 200 MB.**

![AgentX](https://img.shields.io/badge/AgentX-v2.0-7c3aed?style=flat-square) ![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?style=flat-square) ![Docker](https://img.shields.io/badge/Docker-Alpine-informational?style=flat-square)

---

## Do I need to deploy frontend and backend separately?

> **No.** The FastAPI backend **serves the frontend automatically**. You only deploy **one service**. Open the same URL for both the UI and the API docs.

---

## What Does It Do?

AgentX runs a **Plan → Execute → Reflect** loop, streaming every step to your browser in real time:

```
User asks → 🧠 Thought → 🔧 Tool Call → ✅ Result → ... → ✦ Final Answer
```

**Built-in tools (no API keys needed for most):**

| Tool | Does |
|---|---|
| `web_search` | DuckDuckGo search (free, no key) |
| `http_request` | Fetch + parse any URL |
| `code_exec` | Run Python in a sandbox |
| `file_read/write/list` | Workspace file I/O |
| `calculator` | Safe math (AST, not eval) |
| `datetime` | Time, timezones, date diffs |
| `memory_store/retrieve` | Persistent SQLite memory |

---

## Quick Start (Local)

```bash
# 1. Clone & enter project
git clone <your-repo-url> && cd agentx

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — set at least ONE LLM key (see below)

# 3. Run with Docker
docker-compose up --build

# App → http://localhost:8000
# API Docs → http://localhost:8000/api/docs
```

---

## LLM Setup (choose one)

| Provider | Speed | Cost | Get Key |
|---|---|---|---|
| **Groq** ⭐ Recommended | Very fast | **Free tier** | [console.groq.com](https://console.groq.com) |
| OpenAI | Fast | Pay-per-use | [platform.openai.com](https://platform.openai.com) |
| Anthropic | Fast | Pay-per-use | [console.anthropic.com](https://console.anthropic.com) |
| Ollama | Local | **Free** | [ollama.ai](https://ollama.ai) |

Set in `backend/.env`:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx   # or OPENAI_API_KEY / ANTHROPIC_API_KEY
```

---

## Deploy to Render (Free)

> **One service, one click. No separate frontend deployment.**

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your repo → Render reads `render.yaml` automatically
4. In the **Environment** tab of the `agentx` service, add your LLM key:
   ```
   GROQ_API_KEY = gsk_your_key_here
   ```
5. Click **Deploy** — your app is live at `https://agentx.onrender.com`

> **Note:** Render free tier sleeps after 15 min of inactivity. Upgrade to the $7/mo Starter plan for always-on.

---

## Project Structure

```
agentx/
├── backend/
│   ├── app/
│   │   ├── agent/          # Core agent engine
│   │   │   ├── llm.py      # OpenAI / Anthropic / Groq / Ollama client
│   │   │   ├── prompts.py  # ReAct system prompt
│   │   │   └── runner.py   # Plan→Execute→Reflect streaming loop
│   │   ├── tools/          # 10 real tool implementations
│   │   ├── api/routes/     # FastAPI endpoints
│   │   ├── auth/           # JWT auth
│   │   ├── db/             # SQLite (zero config)
│   │   └── main.py         # App entry point (serves frontend too)
│   ├── Dockerfile          # Alpine multi-stage, ~150 MB
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # Served by FastAPI at /
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/                    # TypeScript SDK (optional)
├── docker-compose.yml
├── render.yaml             # Render one-click deploy
└── README.md
```

---

## API Reference

All endpoints are under `/api/v1/`. Interactive docs at `/api/docs`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Get JWT token |
| **POST** | **`/api/v1/chat/stream`** | **Stream agent response (SSE)** |
| GET | `/api/v1/chat/sessions` | List chat sessions |
| GET | `/api/v1/health` | Health + provider status |

### Streaming Example (curl)
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Test1234!"}' | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -N -X POST http://localhost:8000/api/v1/chat/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Search for AI news and write a Python script to analyze sentiment"}'
```

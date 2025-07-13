# AgentX – Developer Help Guide

## How to Run

### Locally (Recommended)
```bash
# 1. Copy and configure environment
cp backend/.env.example backend/.env

# 2. Edit backend/.env — add at least one LLM key:
#    GROQ_API_KEY=gsk_xxx  ← FREE at console.groq.com (fastest option)

# 3. Start
docker-compose up --build

# ✅ Open: http://localhost:8000
# ✅ API Docs: http://localhost:8000/api/docs
```

### Without Docker (Python only)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Do I Deploy Frontend and Backend Separately?

> **No.** The FastAPI backend serves the frontend HTML/CSS/JS automatically.
> You only deploy **one service** and access everything at one URL.

---

## How to Deploy to Render (Free)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New Blueprint**
3. Connect the GitHub repo → Render reads `render.yaml`
4. In the **`agentx`** service → **Environment** tab → add:
   ```
   GROQ_API_KEY = gsk_your_key
   ```
5. Click **Deploy** — wait ~2 min — done ✓

> **Cost:** $0 on Render Free plan (sleeps after 15 min idle). Upgrade to $7/mo Starter for always-on.

---

## LLM Providers

| Provider | Key Variable | Speed | Cost |
|---|---|---|---|
| Groq ⭐ | `GROQ_API_KEY` | 🚀 Very fast | **Free tier** |
| OpenAI | `OPENAI_API_KEY` | Fast | Pay per use |
| Anthropic | `ANTHROPIC_API_KEY` | Fast | Pay per use |
| Ollama (local) | `OLLAMA_BASE_URL` | Depends | **Free** |

Set in `backend/.env` or Render dashboard.

---

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | auto-generated | JWT signing key — change in production |
| `DB_PATH` | `./agentx.db` | SQLite database file path |
| `WORKSPACE_DIR` | `./workspace` | Safe directory for file tools |
| `MAX_AGENT_STEPS` | `15` | Max tool calls per agent run |
| `AGENT_TIMEOUT_SECONDS` | `120` | Per-run timeout |
| `DEBUG` | `false` | Enable verbose logging |
| `ALLOWED_ORIGINS` | `["*"]` | CORS origins |

---

## API Quick Reference

All endpoints prefix: **`/api/v1/`**  
Interactive docs: **`/api/docs`**

```
POST   /api/v1/auth/register         Create account
POST   /api/v1/auth/login            Get JWT token

POST   /api/v1/chat/stream           ← Main endpoint: SSE streaming chat
GET    /api/v1/chat/sessions         List your sessions
GET    /api/v1/chat/sessions/{id}    Get session messages
DELETE /api/v1/chat/sessions/{id}    Delete session

POST   /api/v1/agent/goal           Submit fire-and-forget goal
GET    /api/v1/agent/goal/{task_id} Poll goal status

GET    /api/health                   Health + LLM provider status
```

### Chat Streaming (curl example)
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Test1234!"}' | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# 2. Stream
curl -N -X POST http://localhost:8000/api/v1/chat/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Search for the latest news on AI and summarize it"}'
```

---

## Agent Tools

| Tool name | What it does |
|---|---|
| `web_search` | DuckDuckGo search — no API key |
| `http_request` | Fetch any URL (returns JSON or plain text) |
| `code_exec` | Run Python in a subprocess sandbox |
| `file_read` | Read a file from workspace |
| `file_write` | Write a file to workspace |
| `file_list` | List workspace directory |
| `calculator` | Safe math eval (sqrt, sin, log…) |
| `datetime` | Current time, timezone convert, date diff |
| `memory_store` | Save a fact to SQLite memory |
| `memory_retrieve` | Retrieve a saved fact |

---

## Project Structure (Clean)

```
agentx/
├── backend/
│   ├── app/
│   │   ├── agent/           # Core engine
│   │   │   ├── llm.py       # Multi-provider LLM client
│   │   │   ├── prompts.py   # ReAct system prompt
│   │   │   └── runner.py    # Plan→Execute→Reflect loop
│   │   ├── tools/           # 10 real tools
│   │   │   ├── registry.py
│   │   │   ├── web_search.py
│   │   │   ├── http_request.py
│   │   │   ├── code_exec.py
│   │   │   ├── file_ops.py
│   │   │   ├── calculator.py
│   │   │   ├── datetime_tool.py
│   │   │   └── memory_tool.py
│   │   ├── api/routes/      # Active API routes only
│   │   │   ├── auth.py      # /auth/register, /auth/login
│   │   │   ├── chat.py      # /chat/stream (SSE) ← main
│   │   │   ├── agent.py     # /agent/goal (background)
│   │   │   ├── tasks.py     # /tasks/
│   │   │   └── models.py    # /models/
│   │   ├── auth/            # JWT + bcrypt
│   │   ├── db/database.py   # SQLite init
│   │   └── main.py          # FastAPI app + frontend serving
│   ├── Dockerfile           # Alpine, ~150 MB
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # Served by backend at /
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/                     # TypeScript SDK (optional)
├── docker-compose.yml
├── render.yaml              # Render 1-service deploy
└── README.md
```

---

## Common Issues

| Problem | Fix |
|---|---|
| "No LLM provider" warning | Add `GROQ_API_KEY` to `.env` |
| Render app asleep | Render Free sleeps; upgrade to Starter ($7/mo) or ping every 10 min |
| `uvicorn: not found` | Run `pip install -r requirements.txt` in `backend/` |
| CORS error in browser | Set `ALLOWED_ORIGINS` in `.env` to your frontend URL |
| Agent returns no answer | Check `/api/health` — if `llm_provider: none`, add an API key |

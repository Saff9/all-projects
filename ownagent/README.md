# Apex Smart AI

A production-ready AI personal assistant with multi-provider support. Built with FastAPI and React.

## Features

- 💬 **AI Chat** - Multi-provider AI chat with streaming support
- 📁 **File Uploads** - Upload and analyze documents (PDF, images, code files)
- 🔍 **Web Search** - Search the web directly from the chat
- 🧠 **Memory** - Persistent conversation memory
- 🎨 **Modern UI** - Beautiful dark theme interface

## Supported Providers

- OpenAI (GPT-4, GPT-3.5)
- Anthropic Claude
- DeepSeek
- Grok
- OpenRouter
- Perplexity

## Quick Start

### Backend

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Copy environment template
copy .env.example .env  # Windows
# or: cp .env.example .env

# Run the API
python -m src.api.main
```

The API will be available at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/info` | API information |
| `GET /api/v1/health` | Health check |
| `GET /api/v1/conversations` | List conversations |
| `POST /api/v1/conversations` | Create conversation |
| `POST /api/v1/conversations/{id}/stream` | Stream chat response |
| `GET /api/v1/providers` | List AI providers |
| `PUT /api/v1/providers/{id}/api-key` | Configure provider |
| `POST /api/v1/files/upload` | Upload file |
| `POST /api/v1/search` | Web search |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GENZSMART_APP_NAME` | Application name | Apex Smart API |
| `GENZSMART_APP_VERSION` | Version | 1.0.0 |
| `GENZSMART_DEBUG` | Debug mode | false |
| `GENZSMART_HOST` | API host | 0.0.0.0 |
| `GENZSMART_PORT` | API port | 8000 |
| `GENZSMART_DATABASE_URL` | Database | sqlite:///./data/genzsmart.db |

## Production Build

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
```

## License

MIT

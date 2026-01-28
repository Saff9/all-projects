# ViralClip

**AI-powered viral video clip generator** — Paste any video URL, get viral-ready clips with burned-in captions, platform-optimized hashtags, and ready-to-post descriptions.

> GitHub: https://github.com/saff9/clip_pro

![License](https://img.shields.io/badge/license-MIT-green)
![C++](https://img.shields.io/badge/C%2B%2B-17-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

---

## What It Does

1. **Downloads** any video from YouTube, TikTok, Instagram, Twitter, or direct URL using yt-dlp
2. **Transcribes** the audio to text using Groq Whisper API (ultra-fast, free tier)
3. **Analyzes** the transcript with an LLM to find the most viral-worthy moments
4. **Clips** the video at those timestamps with ffmpeg, applying your chosen ratio and caption style
5. **Generates** platform-specific captions, hashtags, and SEO descriptions for each clip

The entire pipeline streams progress to the browser in real-time via Server-Sent Events (SSE).

---

## Live Demo Flow

```
User pastes URL → API key verified → Video downloaded (yt-dlp)
    → Audio extracted → Transcribed (Groq Whisper)
    → LLM analyzes viral potential → Best moments selected
    → Clips cut with ffmpeg + captions burned in
    → Platform captions, hashtags, and descriptions generated
    → Results displayed with download links
```

---

## Features

### Video Ratios
| Ratio | Use Case | Dimensions |
|-------|----------|------------|
| 16:9 | YouTube, Desktop | 1920x1080 |
| 9:16 | TikTok, Reels, Shorts | 1080x1920 |
| 1:1 | Instagram Feed, LinkedIn | 1080x1080 |
| 4:5 | Instagram Feed (tall) | 1080x1350 |

### Caption Styles
| Style | Description |
|-------|-------------|
| **Bold** | Thick white text with heavy black outline — maximum readability (CapCut-style) |
| **Modern** | Clean white text with subtle shadow — minimal and professional |
| **Neon** | Cyan glowing text — eye-catching, cyberpunk aesthetic |
| **Classic** | Traditional white subtitles with black border — universal |

### Platform Optimization
- **TikTok** — Short punchy captions, trending hashtags, hook-first structure
- **Instagram** — Visual storytelling captions, hashtag clusters, emoji usage
- **YouTube** — SEO-optimized descriptions, timestamps, search-friendly hashtags
- **Twitter/X** — Thread-style captions, concise hashtags, engagement hooks

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | C++17, cpp-httplib (HTTP server), nlohmann/json |
| **Video Processing** | yt-dlp (download), ffmpeg (clip + caption burn-in) |
| **AI/ML** | Groq API — Whisper (transcription), Llama 3.3 70B (analysis) |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, lucide-react |
| **Streaming** | Server-Sent Events (SSE) for real-time progress |

---

## Prerequisites

### Required
- **CMake** 3.16+
- **C++ compiler** — GCC 11+ or Clang 12+ (C++17 support)
- **ffmpeg** — video/audio processing
- **Python 3.8+** with **yt-dlp** — `pip install yt-dlp`
- **Node.js 18+** and **npm** — for building the frontend
- **Groq API key** — free at [console.groq.com](https://console.groq.com)

### Optional
- **Docker** — for containerized deployment
- **YouTube cookies** — for age-restricted or private videos

---

## Installation

### Option 1: Manual Build

```bash
# Clone the repo
git clone https://github.com/saff9/clip_pro.git
cd clip_pro

# Install system dependencies (Ubuntu/Debian)
sudo apt update && sudo apt install -y \
    build-essential cmake \
    libcurl4-openssl-dev \
    ffmpeg \
    python3-pip \
    nodejs npm

# Install yt-dlp
pip install yt-dlp

# Build the React frontend
cd webapp
npm install
npm run build
cd ..

# Build the C++ backend
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j$(nproc)

# Run
./build/viralclip
```

Open **http://localhost:8080** in your browser.

### Option 2: Docker

```bash
git clone https://github.com/saff9/clip_pro.git
cd clip_pro
docker compose up --build
```

### Option 3: Start Script

```bash
./start.sh          # default port 8080
./start.sh 3000     # custom port
```

---

## Configuration

### config.json

```json
{
    "port": 8080,
    "host": "0.0.0.0",
    "output_dir": "./output",
    "clips_dir": "./output/clips",
    "groq_api_key": "gsk_your_key_here",
    "whisper_model": "whisper-large-v3",
    "llm_model": "llama-3.3-70b-versatile",
    "max_clip_duration": 60,
    "min_clip_duration": 10,
    "max_clips": 8,
    "default_platform": "general",
    "clip_crf": 23,
    "clip_preset": "fast",
    "video_ratio": "16:9",
    "caption_style": "bold"
}
```

### All Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `port` | 8080 | HTTP server port |
| `groq_api_key` | — | Your Groq API key (free at console.groq.com) |
| `whisper_model` | whisper-large-v3 | Transcription model |
| `llm_model` | llama-3.3-70b-versatile | Analysis model |
| `max_clips` | 8 | Maximum clips to generate |
| `min_clip_duration` | 10 | Minimum clip length in seconds |
| `max_clip_duration` | 60 | Maximum clip length in seconds |
| `clip_crf` | 23 | Video quality (lower = better, 0-51) |
| `clip_preset` | fast | Encoding speed (ultrafast → veryslow) |
| `video_ratio` | 16:9 | Output aspect ratio |
| `caption_style` | bold | Burned-in caption style |

### AI Models Available

**Whisper (Transcription):**
- `whisper-large-v3` — Best accuracy (recommended)
- `whisper-large-v3-turbo` — Faster, slightly less accurate
- `whisper-medium` — Good balance

**LLM (Analysis):**
- `llama-3.3-70b-versatile` — Best analysis (recommended)
- `llama-3.1-8b-instant` — Fastest
- `mixtral-8x7b-32768` — Good alternative
- `gemma2-9b-it` — Lightweight

---

## Getting Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free (Google/GitHub login)
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `gsk_`)
6. Paste it in the ViralClip UI or `config.json`

The free tier includes:
- 30 requests/minute for Whisper
- 30 requests/minute for LLM
- Generous daily limits

---

## YouTube Cookies (Optional)

YouTube may block downloads from servers. If you encounter download errors:

### Method 1: Export cookies.txt
1. Install a browser extension like "Get cookies.txt LOCALLY"
2. Go to youtube.com while logged in
3. Export cookies
4. Paste in Settings panel or save as `cookies.txt` in project root

### Method 2: Web UI
1. Open ViralClip → Click ⚙️ Settings
2. Paste cookies in the "YouTube Cookies" textarea
3. Click "Save Cookies"

---

## API Reference

### Health Check
```
GET /api/health
Response: {"status":"ok","version":"1.0.0","engine":"viralclip-cpp"}
```

### Get Configuration
```
GET /api/config
Response: { platforms, video_ratios, caption_styles, whisper_models, llm_models, ... }
```

### Start Processing
```
POST /api/process
Content-Type: application/json

{
    "url": "https://youtube.com/watch?v=...",
    "api_key": "gsk_...",
    "platform": "tiktok",
    "max_clips": 5,
    "llm_model": "llama-3.3-70b-versatile",
    "whisper_model": "whisper-large-v3",
    "video_ratio": "9:16",
    "caption_style": "bold"
}

Response: {"success":true,"request_id":"a1b2c3d4"}
```

### Stream Progress (SSE)
```
GET /api/stream/:request_id
Content-Type: text/event-stream

data: {"type":"progress","label":"Downloading video","percent":15,"detail":"..."}

data: {"type":"complete","request_id":"...","success":true,"data":{...}}
```

### Upload YouTube Cookies
```
POST /api/cookies
Content-Type: application/json

{"cookies": "# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\t..."}
```

---

## Project Structure

```
clip_pro/
├── include/                    # C++ header files
│   ├── analyzer.h             # Groq LLM viral analysis
│   ├── clipper.h              # FFmpeg clip + caption engine
│   ├── config.h               # Configuration management
│   ├── downloader.h           # yt-dlp video downloader
│   ├── httplib.h              # HTTP server (vendored)
│   ├── json.hpp               # JSON library (vendored)
│   ├── server.h               # REST API + SSE server
│   ├── transcriber.h          # Groq Whisper transcription
│   └── utils.h                # Utilities, logging, exec
│
├── src/                        # C++ source files
│   ├── analyzer.cpp           # LLM prompt + response parsing
│   ├── clipper.cpp            # FFmpeg ratio scaling + captions
│   ├── config.cpp             # JSON config load/save
│   ├── downloader.cpp         # yt-dlp multi-strategy download
│   ├── main.cpp               # Pipeline orchestration
│   ├── server.cpp             # HTTP routes + SSE streaming
│   ├── transcriber.cpp        # Groq Whisper API calls
│   └── utils.cpp              # Shell exec, file ops, logging
│
├── webapp/                     # React frontend
│   ├── src/
│   │   ├── App.tsx            # Main app + state machine
│   │   ├── Header.tsx         # Logo + settings button
│   │   ├── InputArea.tsx      # URL input + options
│   │   ├── Progress.tsx       # Progress bar + stage info
│   │   ├── Results.tsx        # Clips/captions/tags/transcript tabs
│   │   ├── SegmentedControl.tsx
│   │   ├── SettingsDrawer.tsx # Slide-in settings panel
│   │   ├── ErrorDisplay.tsx   # Error card with retry
│   │   ├── api.ts             # API client + SSE connector
│   │   ├── types.ts           # TypeScript type definitions
│   │   ├── useApiKey.ts       # localStorage API key hook
│   │   └── useCopy.ts         # Clipboard copy hook
│   ├── dist/                  # Built frontend (served by C++)
│   └── package.json
│
├── config.json                 # Runtime configuration
├── CMakeLists.txt              # CMake build system
├── Dockerfile                  # Docker build
├── docker-compose.yml          # Docker Compose config
├── start.sh                    # Launch script
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## How It Works (Technical Deep Dive)

### 1. Video Download (`downloader.cpp`)
- Uses yt-dlp with multi-strategy fallback
- Auto-detects `cookies.txt` for authenticated downloads
- Extracts video metadata (title, duration, thumbnail)
- Extracts audio track separately for transcription
- Supports YouTube, TikTok, Instagram, Twitter, and 1000+ other sites

### 2. Audio Transcription (`transcriber.cpp`)
- Uploads extracted audio to Groq Whisper API
- Returns timestamped segments with word-level precision
- Supports multiple Whisper model sizes for speed/accuracy tradeoff

### 3. Viral Analysis (`analyzer.cpp`)
- Sends full transcript + video metadata to Groq LLM
- LLM identifies the most engaging moments based on:
  - Emotional peaks and surprises
  - Controversial or opinion-worthy statements
  - Funny or relatable moments
  - Strong hooks and quotable lines
  - Trending topic relevance
- Returns ranked clips with scores, hooks, reasons, and platform hints

### 4. Clip Generation (`clipper.cpp`)
- Cuts video at AI-selected timestamps using ffmpeg
- Applies aspect ratio scaling (pad/crop to target dimensions)
- Burns in captions using ffmpeg drawtext filter
- 4 caption styles with different font sizes, colors, and outlines
- Configurable quality (CRF) and encoding speed (preset)

### 5. Content Generation (`analyzer.cpp`)
- Generates platform-specific captions for TikTok, Instagram, YouTube, Twitter
- Creates hashtags based on content analysis
- Writes SEO-optimized descriptions

---

## Troubleshooting

### "Download failed"
- **YouTube blocked**: Add cookies (see YouTube Cookies section above)
- **yt-dlp not found**: `pip install yt-dlp`
- **ffmpeg not found**: `sudo apt install ffmpeg`

### "Transcription failed"
- **Invalid API key**: Get a free key at console.groq.com
- **Rate limited**: Wait 30 seconds or switch Whisper model
- **File too large**: Upgrade to a paid Groq plan

### "Analysis failed"
- **Model not available**: Check console.groq.com for available models
- **Token limit**: Try a shorter video or different model

### "Clip creation failed"
- **ffmpeg error**: Check ffmpeg version (`ffmpeg -version`)
- **Disk space**: Clips require ~50MB per minute of video

### Frontend shows 404
- Build the frontend: `cd webapp && npm install && npm run build`
- Restart the server

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test with `cmake --build build`
5. Submit a pull request

---

## Acknowledgments

- [Groq](https://groq.com) — Ultra-fast AI inference API
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — Video downloader
- [FFmpeg](https://ffmpeg.org) — Video processing
- [cpp-httplib](https://github.com/yhirose/cpp-httplib) — HTTP server
- [nlohmann/json](https://github.com/nlohmann/json) — JSON library

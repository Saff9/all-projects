# Apex AI

A fast, modern AI chat application with multiple model support, built with Next.js 15 and React 19.

![Apex AI](https://img.shields.io/badge/Apex-AI-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Features

- **Multiple AI Modes**: Fast, Instant, Balanced, Creative, Light, and Web Search
- **Automatic Fallback**: If one service fails, automatically tries alternatives
- **Dark/Light/System Theme**: Full theme support with system auto-detection
- **Rate Limiting**: 70 requests/day per user (resets at midnight)
- **Local Storage**: All conversations stored locally for privacy
- **Web Search**: Search the web and get AI-summarized results with citations
- **Responsive Design**: Works beautifully on mobile, tablet, and desktop
- **Code Highlighting**: Proper code blocks with copy functionality
- **Feedback System**: Thumbs up/down feedback on mobile and desktop
- **Privacy First**: Your data stays on your device

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/saff9/apex--ai.git
cd apex--ai
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# Required: At least one AI provider
GROQ_API_KEY=gsk_your_groq_key

# Optional: Additional providers for fallback
HF_API_KEY=hf_your_huggingface_token
OPENROUTER_API_KEY=sk-or-your_openrouter_key

# Optional: Web search
SEARCH_API_KEY=your_serper_api_key

# Optional: Social links (shown in Settings > About)
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@yourchannel
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourhandle
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
NEXT_PUBLIC_WEBSITE_URL=https://yourwebsite.com

# Optional: App configuration
NEXT_PUBLIC_APP_NAME=Apex AI
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_DEVELOPER_NAME=Your Name
NEXT_PUBLIC_DEVELOPER_LOCATION=Your Location
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes* | Groq API key from [console.groq.com](https://console.groq.com) |
| `HF_API_KEY` | No | HuggingFace token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `OPENROUTER_API_KEY` | No | OpenRouter key from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `SEARCH_API_KEY` | No | Serper API key from [serper.dev](https://serper.dev) |
| `NEXT_PUBLIC_YOUTUBE_URL` | No | our YouTube channel URL |
| `NEXT_PUBLIC_INSTAGRAM_URL` | No | our Instagram profile URL |
| `NEXT_PUBLIC_GITHUB_URL` | No | our GitHub profile URL |
| `NEXT_PUBLIC_WEBSITE_URL` | No | our personal website URL |

*At least one AI provider key is required

## How It Works

### Model Modes

Users see friendly mode names (not technical model names):

| Mode | Description | Best For |
|------|-------------|----------|
| **Fast** | Lightning fast responses | Quick questions |
| **Instant** | Ultra-fast smaller model | Simple tasks |
| **Balanced** | Good balance of speed and quality | General use |
| **Creative** | Creative open model | Writing, brainstorming |
| **Light** | Lightweight and efficient | Basic queries |
| **Search** | Web search with AI summary | Current events |

### Fallback Chain

If the primary provider fails (rate limit, API error, etc.), the app automatically tries:
1. Groq (fastest)
2. HuggingFace
3. OpenRouter

### User API Keys

Users can add their own API keys in **Settings > API Keys**. These are:
- Stored in browser localStorage only
- Never sent to our server (only to the respective API providers)
- Take priority over server-side keys
- Enable unlimited usage

## Project Structure

```
src/
├── app/
│   ├── api/chat/       # API route with fallback logic
│   ├── privacy/        # Privacy policy page
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Main page
├── components/
│   ├── ChatInterface   # Main chat UI
│   ├── ChatMessage     # Message with code blocks & feedback
│   ├── ModelSelector   # Mode selector (friendly names)
│   ├── SettingsDialog  # Settings with API keys & social links
│   ├── ApexLogo        # Animated logo
│   └── SnowEffect      # Decorative animation
└── lib/
    ├── types.ts        # TypeScript types & model config
    └── store.ts        # LocalStorage utilities
```

## API Reference

### POST /api/chat

Request:
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "model": "g:llama-3.3-70b-versatile",
  "apiKeys": {
    "groq": "optional_user_key",
    "huggingface": "optional_user_key",
    "openrouter": "optional_user_key",
    "search": "optional_user_key"
  }
}
```

Response:
```json
{
  "content": "AI response here",
  "citations": []
}
```

Error Response:
```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE"
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The app is optimized for Vercel with:
- Edge runtime support
- Automatic HTTPS
- Global CDN

### Other Platforms

The app works on any Node.js hosting platform:

```bash
npm run build
npm start
```

## Features Deep Dive

### Code Blocks

When AI generates code, it's displayed with:
- Syntax highlighting
- Language label
- Copy button for easy copying

### Mobile Support

- Touch-friendly feedback buttons (always visible on mobile)
- Responsive layout
- Swipe-friendly sidebar

### Privacy Features

- All conversations in localStorage
- Optional "Use Data for Training" toggle (default: off)
- Delete all data option in Settings

## Customization

### Adding New AI Providers

1. Add the API call function in `src/app/api/chat/route.ts`
2. Add to the fallback chain
3. Add model config in `src/lib/types.ts`

### Styling

- Uses Tailwind CSS 4
- Custom glass morphism effects
- CSS variables for theming

## Rate Limiting

- Default: 70 requests/day per user
- Stored in localStorage (we will edit this later as per need inc. or dec.)
- Resets at midnight (local time)
- Shows remaining requests in UI

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)
- we can aloso make to apk 

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linting: `npm run lint`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Troubleshooting

### "All services are busy"

- Check if you have valid API keys set
- Try adding your own API keys in Settings
- Wait a few minutes and try again

### Code not displaying properly

- Make sure the AI response uses proper markdown code blocks
- Try a different mode (some are better at formatting)

### Settings not saving

- Check if localStorage is enabled
- Try clearing browser cache

## License

MIT License - see [LICENSE](LICENSE) file

## Credits

Developed by **Saffan** from Kashmir, India

---

Built with:
- [Next.js 15](https://nextjs.org)
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Sonner](https://sonner.emilkowal.ski)
- [Lucide Icons](https://lucide.dev)

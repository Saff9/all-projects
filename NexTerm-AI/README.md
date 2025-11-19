# NexTerm AI — Agentic Terminal

A professional AI-powered terminal interface with multiple AI provider support, advanced skills system, and macOS-style UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### 🧠 AI-Powered Skills
- **Code Analysis**: Explain, debug, and review code
- **SQL Generation**: Generate complex SQL queries from descriptions
- **Regex Builder**: Create regex patterns from plain English
- **API Design**: Design RESTful APIs with proper structure
- **Math Solver**: Solve problems step-by-step
- **Study Tools**: Generate notes, flashcards, and quizzes
- **Content Creation**: Essay drafting, rewriting, SEO optimization
- **Translation**: AI-powered translation with context awareness

### 🛠️ Offline Utilities
- **Calculator**: Safe math expression evaluator
- **JSON Formatter**: Validate and prettify JSON
- **Hash Generator**: SHA-256/SHA-512 hashing
- **Password Generator**: Secure random passwords
- **Base64 Encoder/Decoder**: Encode and decode Base64
- **Unit Converter**: Length, weight, temperature, data
- **Word Counter**: Analyze text statistics
- **UUID Generator**: Generate UUID v4
- **Diff Tool**: Compare texts line by line
- **URL Encoder/Decoder**: Handle URL encoding
- **Lorem Ipsum**: Generate placeholder text
- **Color Converter**: HEX ↔ RGB conversion

### 🎨 User Interface
- macOS-style terminal window with traffic lights
- Multiple theme options (macOS Dark, Dracula, Matrix, Nord)
- Multiple font choices (Fira Code, JetBrains Mono, Outfit)
- Tab system for multiple conversations
- Virtual scrolling for large conversations
- Smart command autocomplete
- Live command suggestions
- Context-aware help hints

### 🔒 Security
- AES-GCM encryption for API keys
- PBKDF2 key derivation from user PIN
- Secure memory wiping
- Rate limiting protection
- Input sanitization and validation
- CSP headers for XSS protection

### 📦 Data Management
- IndexedDB persistent storage
- Full conversation history
- Import/Export functionality
- Knowledge extraction from conversations
- Automatic conversation summarization

## Supported AI Providers

- **OpenAI** (GPT-4o, GPT-4o-mini, o3-mini)
- **Google Gemini** (Gemini 2.0 Flash, Pro)
- **Groq** (Llama, Mixtral models)
- **Perplexity** (Online search)
- **OpenRouter** (Multiple model access)

## Quick Start

### Prerequisites
- Node.js 18+ or npm
- Modern browser with ES module support

### Installation

```bash
# Clone the repository
git clone https://github.com/saff9/aiterminal.git
cd aiterminal

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Test build
npm run test:build
```

## Usage

### Basic Commands

```
/help          - Show all available commands
/clear         - Clear terminal output
/new           - Start new session
/history       - View conversation history
/providers     - Show provider status
```

### AI Skills (require API key)

```
/explain <code>           - Explain code step-by-step
/debug <code>             - Find bugs and suggest fixes
/review <code>            - Professional code review
/sql <description>        - Generate SQL queries
/regex <description>      - Build regex patterns
/api <description>        - Design REST APIs
/solve <problem>          - Solve math problems
/study <topic>            - Generate study notes
/flashcards <topic>       - Create flashcards
/quiz <topic>             - Generate practice quiz
/essay <topic>            - Draft essays/articles
/rewrite <text>           - Improve writing quality
/translate <text> to <lang> - Translate text
/compare <A vs B>         - Compare two items
/aisummarize <text>       - AI-powered summarization
```

### Offline Utilities (no API key needed)

```
/calc <expression>        - Evaluate math expressions
/json <json>              - Format and validate JSON
/hash <text>              - Generate SHA hash
/password [length]        - Generate secure password
/base64 encode/decode     - Base64 operations
/convert <val> <from> <to> - Unit conversion
/wc <text>                - Word/character count
/uuid                     - Generate UUID
/diff <text1> <text2>     - Compare texts
/time [action]            - Date/time utilities
/url encode/decode <text> - URL encoding
/lorem [paragraphs]       - Generate lorem ipsum
/color <hex|rgb>          - Color conversion
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+1-5` | Switch to tab 1-5 |
| `Ctrl+F` | Search history |
| `Ctrl+E` | Export data |
| `Ctrl+I` | Import data |
| `Ctrl+Shift+K` | Show shortcuts |
| `Tab` | Autocomplete command |
| `Escape` | Cancel/Exit mode |
| `Arrow Up/Down` | Navigate history |

## Project Structure

```
src/
├── main.js                 # Main entry point
├── index.css               # Global styles
├── core/                   # Core utilities
│   ├── browser-support.js  # Browser compatibility
│   ├── error-boundary.js   # Error handling
│   ├── lazy-loader.js      # Lazy loading
│   ├── logger.js           # Logging system
│   └── performance-monitor.js # Performance tracking
├── engine/                 # AI engine
│   ├── agent.js            # Agentic execution loop
│   └── prompt-builder.js   # Prompt construction
├── memory/                 # Data persistence
│   ├── context-manager.js  # Conversation context
│   └── memory-store.js     # IndexedDB storage
├── providers/              # AI providers
│   ├── base-provider.js    # Base provider interface
│   ├── openai-provider.js  # OpenAI implementation
│   ├── gemini-provider.js  # Google Gemini
│   ├── groq-provider.js    # Groq API
│   ├── perplexity-provider.js # Perplexity AI
│   └── provider-manager.js # Provider management
├── security/               # Security features
│   ├── crypto.js           # Encryption/decryption
│   └── sanitizer.js        # Input sanitization
├── skills/                 # Skill system
│   ├── skill-registry.js   # Skill registration
│   ├── builtin-skills.js   # Built-in skills
│   ├── pro-skills.js       # AI-powered skills
│   └── utility-skills.js   # Offline utilities
└── ui/                     # UI components
    ├── markdown.js         # Markdown parser
    └── virtual-scroller.js # Virtual scrolling
```

## Configuration

### Setting up API Keys

1. Open Settings (gear icon in titlebar)
2. Enter API key for your preferred provider
3. Select active provider and model
4. Optionally set a PIN for encryption

### Environment Variables

Create a `.env` file for development:

```env
# Optional: Default provider
VITE_DEFAULT_PROVIDER=openai

# Optional: Default model
VITE_DEFAULT_MODEL=gpt-4o-mini
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Saffan** - [SmartGenzAI](https://github.com/saff9)

## Acknowledgments

- Icons by [Heroicons](https://heroicons.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Built with [Vite](https://vitejs.dev/)

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/saff9/aiterminal/issues)
- Email: contact@example.com

---

⭐ Star this repo if you find it useful!
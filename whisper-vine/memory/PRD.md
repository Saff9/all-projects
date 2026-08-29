# WhisperVine — PRD

## 1. Original problem statement
"WhisperVine — Anonymous Confessional & Game Engine. A Telegram bot that lets creators spin up a 'Vine' (a linked group or channel). Users send anonymous confessions to the bot privately; the bot reposts them into the Vine without any identity. The bot also runs daily interactive games (AI-generated Would You Rather, Unpopular Opinion Battles) with blind voting and aggregate stats. The juiciest, moderator-approved confessions are turned into shareable Vine Cards (graphic novella-style images) via Replicate. The whole thing includes a Mini App for vine management and analytics. Now generate the complete WhisperVine. And also a good ui/ux. Modern good one. To use outside telegram."

## 2. User choices captured
- Scope: live web app + downloadable Telegram bot bundle (PostgreSQL, not MongoDB)
- LLM: user-provided OpenRouter/Groq for the bot bundle; Emergent Universal Key (Claude Sonnet 4.5) for the live web app
- Image gen: Gemini Nano Banana via Emergent key (live web); Replicate SDXL for the bot bundle
- Auth (web): JWT email/password
- Monetization: Telegram Stars boost + premium upgrade in the bot bundle

## 3. Architecture
### Live web app (running on Emergent)
- **Backend**: FastAPI + SQLAlchemy 2.0 async + asyncpg → PostgreSQL 15 (installed via apt)
- **Frontend**: React 19 + Tailwind + shadcn/ui, Anton + Space Mono fonts, dark purple #09030E + neon green #39FF14 noir aesthetic
- **AI**: Claude Sonnet 4.5 for moderation + game generation; Gemini Nano Banana (gemini-3.1-flash-image-preview) for Vine Cards (via emergentintegrations + EMERGENT_LLM_KEY)
- **Schedule**: APScheduler hourly tick triggers daily games per vine

### Downloadable bundle `/app/whispervine_bot/`
- python-telegram-bot v21 + FastAPI Mini App + APScheduler
- PostgreSQL + SQLAlchemy 2.0 async + Alembic migrations
- OpenRouter (default) or Groq for LLM (configurable via `LLM_PROVIDER`)
- Replicate SDXL/Flux for Vine Cards
- Telegram Stars payments (`/boost`, `/upgrade`)
- Dockerfile + docker-compose.yml + comprehensive README

## 4. Privacy invariant (verified)
- `confessions` table has **no `user_id`** column
- Confessions accept anonymous submissions (no auth required)
- Rate limiting via opaque IP+UA hash, in-memory TTL cache (60s)
- Game votes stored as aggregate counts; per-session salted SHA-256 fingerprint prevents double-vote without enabling cross-game correlation
- Moderation logs store only excerpt + classification, no submitter info

## 5. Implemented (Feb 2026)
- ✅ Full backend with /api/auth, /api/vines, /api/confessions, /api/games, /api/cards, /api/dashboard
- ✅ React frontend: Landing, Signup, Login, Discover, Create Vine wizard, Vine Feed (submit + masonry browse + live game panel), Vine Cards gallery, Owner Dashboard (stats, approval queue, start game, make card)
- ✅ AI moderation pipeline (regex stage 1 + Claude Sonnet 4.5 stage 2 with 3s timeout fallback)
- ✅ Live game generation (Would You Rather + Unpopular Opinion) via Claude
- ✅ Anonymous voting with double-vote prevention
- ✅ Vine Card generation via Gemini Nano Banana (verified — 17s end-to-end, 868KB JPEG output)
- ✅ APScheduler daily game tick
- ✅ Downloadable Telegram bot bundle (33 files) with Stars payments, Mini App, Alembic migration, Dockerfile, docker-compose
- ✅ All 30 backend pytest cases + all frontend Playwright flows passing at 100%

## 6. Backlog (not blocking)
- **P1** Settings panel UI for vine owners (custom branding JSON, ad-free toggle, premium upgrade)
- **P1** Live web app `/boost` Stripe-or-Stars-style flow for confession boosting (currently Stars-only in bot bundle)
- **P1** "Invite a friend & see how they voted" deep-link reveal for games
- **P2** Redis-backed rate limiter for multi-worker scaling
- **P2** JWT blacklist on logout
- **P2** Background task for game start so dashboard click is instant (no 3-8s Claude wait)
- **P2** Per-session secret pepper for fingerprint hash
- **P3** Telegram bot bundle: full Mini App page set (currently 3 pages: index, dashboard, create) — add settings, queue moderation in webapp
- **P3** Approval queue notification (email or in-app) for vine owners with `requires_approval=true`

## 7. Personas
- **Curator** (signed-up user): creates vines, moderates queue, mints Vine Cards, runs games
- **Whisperer** (anonymous): submits confessions and votes in games — no account needed
- **Premium curator**: pays Stars (in bot bundle) for branding + analytics

## 8. Test credentials
See `/app/memory/test_credentials.md` (creator@gmail.com / vinepass123).

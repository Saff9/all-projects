# WhisperVine Telegram Bot

Anonymous confessional + AI game engine for Telegram. Users DM the bot privately, the bot reposts to a Vine (group/channel) with zero identity link. Daily AI-generated games (Would You Rather + Unpopular Opinion) with anonymous voting. Confessions become graphic-novella **Vine Cards** via Replicate. Telegram Stars monetization (`/boost`, premium vines).

Stack: Python 3.11 · `python-telegram-bot` v20 · PostgreSQL + SQLAlchemy 2.0 async · OpenRouter/Groq for LLM · Replicate for image gen · APScheduler · FastAPI Mini App.

---

## 1. Quickstart (Docker)

```bash
git clone <this folder>
cd whispervine_bot
cp .env.example .env
# Edit .env and fill in BOT_TOKEN, OPENROUTER_API_KEY (or GROQ_API_KEY), REPLICATE_API_TOKEN, MINIAPP_BASE_URL
docker compose up -d
docker compose exec bot alembic upgrade head
docker compose logs -f bot
```

## 2. Local dev (no Docker)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill it in
# Start Postgres locally (any way), set DATABASE_URL accordingly
alembic upgrade head
python -m whispervine.main
```

## 3. Required environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `BOT_TOKEN` | yes | from @BotFather |
| `DATABASE_URL` | yes | `postgresql+asyncpg://user:pass@host:5432/whispervine` |
| `LLM_PROVIDER` | yes | `openrouter` or `groq` |
| `OPENROUTER_API_KEY` | if provider=openrouter | from https://openrouter.ai/keys |
| `OPENROUTER_MODEL` | no | default `meta-llama/llama-3.1-8b-instruct` |
| `GROQ_API_KEY` | if provider=groq | from https://console.groq.com/keys |
| `GROQ_MODEL` | no | default `llama3-8b-8192` |
| `REPLICATE_API_TOKEN` | yes (for cards) | from https://replicate.com/account/api-tokens |
| `REPLICATE_MODEL` | no | default `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b` |
| `PERSPECTIVE_API_KEY` | optional | enables stage 1 toxicity score |
| `MINIAPP_BASE_URL` | yes | public HTTPS URL of FastAPI Mini App, configured in BotFather as the webapp URL |
| `WEBHOOK_URL` | optional | if set, runs in webhook mode; else long-polling |
| `WEBHOOK_SECRET` | optional | for webhook signing |
| `MINIAPP_PORT` | no | default 8080 |
| `RATE_LIMIT_PER_MIN` | no | default 5 |
| `STARS_BOOST_AMOUNT` | no | default 50 (XTR) |
| `STARS_PREMIUM_AMOUNT` | no | default 500 (XTR) |

## 4. Set up your bot

1. `/newbot` in @BotFather → grab `BOT_TOKEN`
2. `/setdomain` and `/setwebapp` → point to `MINIAPP_BASE_URL`
3. `/setcommands`:
   ```
   start - Begin / show main menu
   create - Create a new vine
   boost - Boost your last confession with Stars
   upgrade - Upgrade vine to premium with Stars
   generate_card - (Owner) generate a Vine Card from a confession ID
   queue - (Owner) view approval queue
   ```
4. Add the bot to your group/channel as **admin** with post-message rights. The bot will detect the chat and link it to your vine.
5. Telegram Stars: enable Telegram Stars in your bot settings (BotFather → Bot Settings → Payments). No external provider token needed for Stars (currency `XTR`).

## 5. Privacy invariant

- The `confessions` table has **no `user_id` column** — there is no DB record linking a confession to its sender.
- `game_votes` is aggregate-only (counts) plus a separate `game_voter_fingerprints` table that stores SHA-256(user_id || session_id) so each user can only vote once per round, but the fingerprint is keyed to the session (cannot correlate across games or to anything else).
- Rate limiting uses an in-memory TTL cache; nothing about senders is persisted.

## 6. Architecture

- `main.py` boots: PTB Application (long-poll or webhook) + FastAPI Mini App on the same asyncio loop + APScheduler hourly tick.
- All DB access is async SQLAlchemy 2.0 with asyncpg.
- Moderation: stage 1 = regex/keyword + optional Perspective → stage 2 = OpenRouter/Groq LLM with 3s timeout, fallback heuristic.
- Vine Cards: Replicate prediction with consistent noir prompt (dark purple + neon green graphic novella).
- Mini App: FastAPI + Jinja2; auth via `Telegram.WebApp.initData` HMAC validation.

## 7. Deep links

Each vine has `t.me/<your_bot>?start=vine_<vine_id>`. When users open this, `/start` handler associates them with that vine context for confession submission.

## 8. Stars monetization

- `/boost`: creates an invoice for `STARS_BOOST_AMOUNT` Telegram Stars. On payment, sets the user's most recent approved confession's `is_boosted=True`.
- `/upgrade`: creates an invoice for `STARS_PREMIUM_AMOUNT`. On payment, sets the vine the user owns to `is_premium=True` (unlocks custom branding & advanced analytics in the Mini App).

## 9. Horizontal scaling

The bot is stateless. Run multiple replicas behind a load balancer if using webhook mode. PTB v20 + asyncpg pool handles concurrency. Don't deploy multiple long-poll replicas — only one can poll at a time. Use a single Mini App replica or multiple behind LB; sessions are stateless (initData validated on each request).

## 10. License

MIT.

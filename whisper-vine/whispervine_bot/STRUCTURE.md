# WhisperVine Telegram Bot — Project Layout

```
whispervine_bot/
├── README.md
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── alembic.ini
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 0001_initial.py
└── whispervine/
    ├── __init__.py
    ├── main.py                # entrypoint (runs bot + Mini App)
    ├── config.py
    ├── database.py
    ├── models.py
    ├── moderation.py
    ├── games.py
    ├── vine_cards.py
    ├── ratelimit.py
    ├── handlers/
    │   ├── __init__.py
    │   ├── start.py           # /start, /start vine_<id> deep link
    │   ├── confess.py         # private message → confession proxy
    │   ├── games_handler.py   # callback queries for voting
    │   ├── admin.py           # /generate_card, approval queue
    │   ├── payments.py        # /boost, /upgrade Stars invoices
    │   └── webhook.py         # webhook helper
    ├── services/
    │   ├── __init__.py
    │   └── scheduler.py       # APScheduler daily game tick
    └── webapp/
        ├── __init__.py
        ├── app.py             # FastAPI Mini App
        ├── auth.py            # Telegram WebApp initData validation
        └── templates/
            ├── index.html
            ├── dashboard.html
            └── create.html
```

This bundle is **not runnable on the Emergent platform** (the platform uses its own Mongo+FastAPI+React stack). Use `docker-compose up` locally or on any Linux host.

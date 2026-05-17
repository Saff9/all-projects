"""
Global configuration
Loads environment variables safely
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Telegram bot token
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN missing in environment variables")

# Render public URL for webhook
WEBHOOK_URL = os.getenv("WEBHOOK_URL")
if not WEBHOOK_URL:
    raise RuntimeError("WEBHOOK_URL missing in environment variables")

# Database file
DB_NAME = os.getenv("DB_NAME", "leads.db")

# Admin ID for notifications (optional)
ADMIN_ID = os.getenv("ADMIN_ID")

# Webhook secret for security (optional but recommended)
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")

# Logging level
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Rate limiter settings
RATE_LIMIT_COUNT = 5
RATE_LIMIT_SECONDS = 10

# Max message length
MAX_TEXT_LENGTH = 300

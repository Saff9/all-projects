# main.py
"""
Entry point only
NO business logic here
"""
import os
import logging
import signal
import sys
from telegram.ext import ApplicationBuilder
from config import BOT_TOKEN, WEBHOOK_URL, LOG_LEVEL
from core.logger import setup_logger
from db.models import init_db
from handlers.setup import setup_handler
from handlers.form import form_handler
from handlers.admin import admin_handlers  # multiple admin handlers
from health import start_health_check

# Global variables for graceful shutdown
app = None
logger = None

def signal_handler(sig, frame):
    """Handle graceful shutdown on SIGINT/SIGTERM"""
    global logger
    if logger:
        logger.info("Received shutdown signal. Shutting down gracefully...")
    sys.exit(0)

def main():
    global app, logger
    
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Set up logging
    logger = setup_logger()
    logger.info("Starting Lead Collector Bot...")
    logger.info(f"Log level: {LOG_LEVEL}")

    try:
        # Initialize database
        init_db()
        logger.info("Database initialized successfully")

        # Create application
        app = ApplicationBuilder().token(BOT_TOKEN).build()
        logger.info("Telegram bot application created")

        # Register handlers
        app.add_handler(setup_handler)
        app.add_handler(form_handler)
        for handler in admin_handlers:
            app.add_handler(handler)
        logger.info("Handlers registered successfully")

        # Start health check server
        start_health_check()
        logger.info("Health check server started")

        # Get port from environment or default to 10000
        port = int(os.environ.get("PORT", 10000))
        logger.info(f"Starting webhook on port {port}")

        # Start webhook (Render compatible)
        app.run_webhook(
            listen="0.0.0.0",
            port=port,
            webhook_url=WEBHOOK_URL,
            drop_pending_updates=True,  # Skip pending updates on startup
            allowed_updates=['message', 'callback_query', 'chat_member']  # Only listen to relevant updates
        )

    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()

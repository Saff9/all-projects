"""WhisperVine entrypoint — runs PTB bot + FastAPI Mini App + APScheduler in one asyncio loop."""
from __future__ import annotations
import asyncio
import logging
import uvicorn
from telegram import Update
from telegram.ext import (
    Application, ApplicationBuilder, CommandHandler, MessageHandler, CallbackQueryHandler,
    PreCheckoutQueryHandler, filters,
)

from .config import settings
from .handlers.start import start, link_chat_to_vine
from .handlers.confess import confess
from .handlers.games_handler import vote_callback
from .handlers.admin import create_vine_cmd, generate_card, queue_cmd, queue_callback
from .handlers.payments import boost_cmd, upgrade_cmd, precheckout, successful_payment
from .services.scheduler import make_scheduler
from .webapp.app import app as fastapi_app

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("whispervine")


def build_application() -> Application:
    application = ApplicationBuilder().token(settings.bot_token).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("create", create_vine_cmd))
    application.add_handler(CommandHandler("linkvine", link_chat_to_vine))
    application.add_handler(CommandHandler("generate_card", generate_card))
    application.add_handler(CommandHandler("queue", queue_cmd))
    application.add_handler(CommandHandler("boost", boost_cmd))
    application.add_handler(CommandHandler("upgrade", upgrade_cmd))
    # Confessions: any private text that's not a command
    application.add_handler(MessageHandler(filters.ChatType.PRIVATE & filters.TEXT & ~filters.COMMAND, confess))
    # Callback queries
    application.add_handler(CallbackQueryHandler(vote_callback, pattern=r"^vote:"))
    application.add_handler(CallbackQueryHandler(queue_callback, pattern=r"^qmod:"))
    # Payments
    application.add_handler(PreCheckoutQueryHandler(precheckout))
    application.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment))
    return application


async def run_webapp() -> None:
    config = uvicorn.Config(fastapi_app, host="0.0.0.0", port=settings.miniapp_port, log_level="info", lifespan="off")
    server = uvicorn.Server(config)
    await server.serve()


async def main() -> None:
    application = build_application()
    scheduler = make_scheduler(application.bot)

    await application.initialize()
    await application.start()
    scheduler.start()

    if settings.webhook_url:
        # Webhook mode
        await application.bot.set_webhook(settings.webhook_url, secret_token=settings.webhook_secret or None)
        logger.info("Webhook set: %s", settings.webhook_url)
    else:
        # Long polling
        await application.updater.start_polling(allowed_updates=Update.ALL_TYPES)
        logger.info("Started long polling.")

    # Run Mini App on the same loop
    webapp_task = asyncio.create_task(run_webapp())

    try:
        await webapp_task
    finally:
        if not settings.webhook_url:
            await application.updater.stop()
        await application.stop()
        await application.shutdown()
        scheduler.shutdown(wait=False)


if __name__ == "__main__":
    asyncio.run(main())

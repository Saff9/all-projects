"""
Business registers themselves
"""

from telegram import Update
from telegram.ext import ContextTypes, CommandHandler

from db.repo import create_or_update_business


async def setup_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    create_or_update_business(
        telegram_id=user.id,
        name=user.first_name
    )

    await update.message.reply_text(
        "✅ Setup complete!\n\n"
        "Your business is registered.\n"
        "Customers can now send leads using /start 🙂"
    )


setup_handler = CommandHandler("setup", setup_cmd)

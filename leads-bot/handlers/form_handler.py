# handlers/form_handler.py
# ==================================================
# Handles lead collection conversation

from telegram import Update
from telegram.ext import (
    ContextTypes,
    ConversationHandler,
    CommandHandler,
    MessageHandler,
    filters
)

from core.validators import (
    clean_text,
    is_valid_name,
    is_valid_phone,
    is_valid_requirement
)

from core.rate_limiter import RateLimiter
from services.notify_service import NotifyService

# Conversation states
NAME, PHONE, REQUIREMENT = range(3)

# Anti-spam limiter (30s per user)
limiter = RateLimiter(30)


# ==================================================
# START
# ==================================================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    if not limiter.allowed(user_id):
        await update.message.reply_text(
            "⏳ Please wait a few seconds before submitting another lead."
        )
        return ConversationHandler.END

    await update.message.reply_text(
        "👋 Welcome!\n\nPlease enter your *Name:*",
        parse_mode="Markdown"
    )

    return NAME


# ==================================================
# NAME
# ==================================================
async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    name = clean_text(update.message.text)

    if not is_valid_name(name):
        await update.message.reply_text("❌ Invalid name. Please enter again:")
        return NAME

    context.user_data["name"] = name
    await update.message.reply_text("📱 Enter your phone number:")

    return PHONE


# ==================================================
# PHONE
# ==================================================
async def get_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    phone = clean_text(update.message.text)

    if not is_valid_phone(phone):
        await update.message.reply_text(
            "❌ Invalid phone number.\nUse digits only (7–15 numbers). Try again:"
        )
        return PHONE

    context.user_data["phone"] = phone
    await update.message.reply_text("📝 Describe your requirement:")

    return REQUIREMENT


# ==================================================
# REQUIREMENT
# ==================================================
async def get_requirement(update: Update, context: ContextTypes.DEFAULT_TYPE):
    requirement = clean_text(update.message.text, 300)

    if not is_valid_requirement(requirement):
        await update.message.reply_text(
            "❌ Please describe requirement properly (min 5 characters)."
        )
        return REQUIREMENT

    name = context.user_data["name"]
    phone = context.user_data["phone"]

    # Send to admin
    notifier = NotifyService(context.bot)
    await notifier.send_new_lead(name, phone, requirement)

    await update.message.reply_text(
        "✅ Thank you! Our team will contact you soon."
    )

    return ConversationHandler.END


# ==================================================
# CANCEL
# ==================================================
async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("❌ Cancelled.")
    return ConversationHandler.END


# ==================================================
# Conversation Handler Factory
# ==================================================
def get_form_handler():
    return ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
            PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_phone)],
            REQUIREMENT: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_requirement)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

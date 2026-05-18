"""
Lead collection form handler
Handles conversational lead collection with proper error handling
"""

import logging
from typing import Optional, Dict, Any
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import (
    ContextTypes,
    ConversationHandler,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters
)
import asyncio

from core.sanitizer import clean_name, clean_phone, clean_email, clean_text
from core.ratelimiter import rate_limiter
from db.repo import get_business_by_telegram
from services.lead_service import create_lead

logger = logging.getLogger(__name__)

# Conversation states
NAME, CONTACT_METHOD, CONTACT_INFO, MESSAGE, CONFIRM = range(5)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Start the lead collection conversation"""
    try:
        user_id = update.effective_user.id
        
        # Rate limiting check
        if not rate_limiter.allowed(user_id):
            await update.message.reply_text(
                "⚠️ Please wait a moment before trying again. Rate limit exceeded."
            )
            return ConversationHandler.END

        await context.bot.send_chat_action(update.effective_chat.id, "typing")
        await asyncio.sleep(1)
        
        await update.message.reply_text(
            "Hi 👋! I'm here to help you leave your details. "
            "What's your name?"
        )
        return NAME
        
    except Exception as e:
        logger.error(f"Error in start conversation: {e}")
        await update.message.reply_text(
            "❌ Sorry, there was an error starting the conversation. Please try again."
        )
        return ConversationHandler.END


async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Get and validate user's name"""
    try:
        user_input = update.message.text.strip()
        name = clean_name(user_input)
        
        if not name or len(name) < 2:
            await update.message.reply_text(
                "Please enter a valid name (at least 2 characters)."
            )
            return NAME

        context.user_data["name"] = name
        
        # Ask for contact method
        keyboard = [
            [
                InlineKeyboardButton("📞 Phone", callback_data="phone"),
                InlineKeyboardButton("📧 Email", callback_data="email")
            ],
            [InlineKeyboardButton("⏭ Skip Contact", callback_data="skip")]
        ]
        markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "How should we contact you?",
            reply_markup=markup
        )
        return CONTACT_METHOD
        
    except Exception as e:
        logger.error(f"Error getting name: {e}")
        await update.message.reply_text(
            "❌ Sorry, there was an error processing your name. Please try again."
        )
        return ConversationHandler.END


async def contact_method_choice(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handle contact method selection"""
    try:
        query = update.callback_query
        await query.answer()
        
        choice = query.data
        context.user_data["contact_method"] = choice
        
        if choice == "phone":
            await query.edit_message_text("Please enter your phone number:")
            return CONTACT_INFO
        elif choice == "email":
            await query.edit_message_text("Please enter your email address:")
            return CONTACT_INFO
        else:  # skip
            context.user_data["phone"] = None
            context.user_data["email"] = None
            await query.edit_message_text("Please tell us about your requirements:")
            return MESSAGE
            
    except Exception as e:
        logger.error(f"Error in contact method choice: {e}")
        await update.callback_query.edit_message_text(
            "❌ Sorry, there was an error. Please try again."
        )
        return ConversationHandler.END


async def get_contact_info(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Get phone or email based on user choice"""
    try:
        contact_method = context.user_data.get("contact_method")
        user_input = update.message.text.strip()
        
        if contact_method == "phone":
            phone = clean_phone(user_input)
            if not phone:
                await update.message.reply_text(
                    "Please enter a valid phone number (7-15 digits)."
                )
                return CONTACT_INFO
            
            context.user_data["phone"] = phone
            context.user_data["email"] = None
            
        elif contact_method == "email":
            email = clean_email(user_input)
            if not email:
                await update.message.reply_text(
                    "Please enter a valid email address."
                )
                return CONTACT_INFO
            
            context.user_data["email"] = email
            context.user_data["phone"] = None
            
        else:
            # This shouldn't happen, but handle it gracefully
            context.user_data["phone"] = None
            context.user_data["email"] = None

        await update.message.reply_text("Please tell us about your requirements:")
        return MESSAGE
        
    except Exception as e:
        logger.error(f"Error getting contact info: {e}")
        await update.message.reply_text(
            "❌ Sorry, there was an error processing your contact information. Please try again."
        )
        return ConversationHandler.END


async def get_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Get the user's message/requirements"""
    try:
        user_input = update.message.text.strip()
        message = clean_text(user_input, 500)
        
        if not message or len(message) < 5:
            await update.message.reply_text(
                "Please tell us more about your requirements (at least 5 characters)."
            )
            return MESSAGE

        context.user_data["message"] = message
        
        # Show confirmation
        name = context.user_data["name"]
        phone = context.user_data.get("phone", "Not provided")
        email = context.user_data.get("email", "Not provided")
        message_preview = message[:100] + "..." if len(message) > 100 else message
        
        confirmation_text = (
            f"Please confirm your details:\n\n"
            f"👤 Name: {name}\n"
            f"📞 Phone: {phone}\n"
            f"📧 Email: {email}\n"
            f"📝 Requirements: {message_preview}\n\n"
            f"Is this correct?"
        )
        
        keyboard = [
            [
                InlineKeyboardButton("✅ Yes", callback_data="confirm_yes"),
                InlineKeyboardButton("❌ No", callback_data="confirm_no")
            ]
        ]
        markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(confirmation_text, reply_markup=markup)
        return CONFIRM
        
    except Exception as e:
        logger.error(f"Error getting message: {e}")
        await update.message.reply_text(
            "❌ Sorry, there was an error processing your message. Please try again."
        )
        return ConversationHandler.END


async def confirm_lead(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handle lead confirmation and creation"""
    try:
        query = update.callback_query
        await query.answer()
        
        if query.data == "confirm_yes":
            # Create the lead
            name = context.user_data["name"]
            phone = context.user_data.get("phone")
            email = context.user_data.get("email")
            message = context.user_data["message"]
            
            # Find a business to receive this lead
            business = get_business_by_telegram(update.effective_user.id)
            if not business:
                # Create a default business if none exists
                from db.repo import create_or_update_business
                create_or_update_business(update.effective_user.id, "Default Business")
                business = get_business_by_telegram(update.effective_user.id)
            
            if business:
                success = await create_lead(context.bot, business, name, phone, email, message)
                
                if success:
                    await query.edit_message_text(
                        "✅ Thank you! Your lead has been submitted successfully. "
                        "Someone will contact you soon!"
                    )
                else:
                    await query.edit_message_text(
                        "❌ Sorry, there was an error submitting your lead. "
                        "Please try again later or contact support."
                    )
            else:
                await query.edit_message_text(
                    "❌ Sorry, we couldn't find a business to receive your lead. "
                    "Please try again later."
                )
        else:
            await query.edit_message_text(
                "❌ Lead submission cancelled. You can start again with /start."
            )
        
        return ConversationHandler.END
        
    except Exception as e:
        logger.error(f"Error confirming lead: {e}")
        await update.callback_query.edit_message_text(
            "❌ Sorry, there was an error processing your submission. Please try again."
        )
        return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancel the conversation"""
    try:
        await update.message.reply_text(
            "❌ Conversation cancelled. You can start again with /start.",
            reply_markup=ReplyKeyboardRemove()
        )
        return ConversationHandler.END
        
    except Exception as e:
        logger.error(f"Error in cancel: {e}")
        return ConversationHandler.END


# Create the conversation handler with proper configuration
form_handler = ConversationHandler(
    entry_points=[CommandHandler("start", start)],
    states={
        NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
        CONTACT_METHOD: [CallbackQueryHandler(contact_method_choice)],
        CONTACT_INFO: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_contact_info)],
        MESSAGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_message)],
        CONFIRM: [CallbackQueryHandler(confirm_lead)]
    },
    fallbacks=[
        CommandHandler("cancel", cancel),
        MessageHandler(filters.COMMAND, cancel)
    ],
    per_user=True,
    per_chat=True,
    conversation_timeout=600,  # 10 minutes timeout
    name="lead_collection",
    persistent=False
)
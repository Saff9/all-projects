# services/notify_service.py
# ==================================================
# Responsible ONLY for notifying admin via Telegram
# Single Responsibility Principle (clean architecture)

from telegram import Bot
from config import ADMIN_ID
from core.logger import logger
from datetime import datetime


class NotifyService:
    def __init__(self, bot: Bot):
        self.bot = bot

    async def send_new_lead(self, name: str, phone: str, requirement: str):
        """
        Sends formatted lead message to admin
        Never raises exception (bot must not crash)
        """

        message = (
            "🔥 *New Lead Received*\n\n"
            f"*Name:* {name}\n"
            f"*Phone:* {phone}\n"
            f"*Requirement:*\n{requirement}\n\n"
            f"_Time: {datetime.now().strftime('%d %b %Y %I:%M %p')}_"
        )

        try:
            await self.bot.send_message(
                chat_id=ADMIN_ID,
                text=message,
                parse_mode="Markdown"
            )
        except Exception as e:
            logger.error(f"Failed to send admin notification: {e}")

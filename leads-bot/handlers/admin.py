from telegram.ext import CommandHandler
from db.repo import get_business_by_telegram, insert_lead, get_all_leads
from telegram import Update
from telegram.ext import ContextTypes

async def leads_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    business = get_business_by_telegram(update.effective_user.id)
    if not business:
        await update.message.reply_text("You are not registered yet. Use /setup first.")
        return

    leads = get_all_leads(business["id"])
    if not leads:
        await update.message.reply_text("No leads yet.")
        return

    text = "\n\n".join([f"{l['name']} | {l['phone'] or '-'} | {l['email'] or '-'} | {l['message']}" for l in leads])
    await update.message.reply_text(text)

admin_handlers = [
    CommandHandler("leads", leads_cmd),
    # /export, /stats will be added similarly
]

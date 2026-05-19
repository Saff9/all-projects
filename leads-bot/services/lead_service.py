"""
Business logic for leads
"""

import logging
from typing import Optional
from core.fingerprint import create_fingerprint
from services.scoring import calculate_score
from db.repo import insert_lead, get_lead_by_fingerprint

logger = logging.getLogger(__name__)


async def create_lead(bot, business: dict, name: str, phone: Optional[str], 
                     email: Optional[str], message: str) -> bool:
    """
    Create a new lead with duplicate checking and proper error handling
    Returns True if lead was created successfully, False otherwise
    """
    try:
        # Calculate lead score
        score = calculate_score(phone, email, message)
        
        # Create fingerprint for duplicate detection
        fingerprint = create_fingerprint(name, phone or "", message)
        
        # Check for duplicate lead
        existing_lead = get_lead_by_fingerprint(fingerprint)
        if existing_lead:
            logger.warning(f"Duplicate lead detected for business {business['id']}")
            return False
        
        # Insert new lead
        success = insert_lead({
            "business_id": business["id"],
            "name": name,
            "phone": phone,
            "email": email,
            "message": message,
            "fingerprint": fingerprint,
            "score": score
        })
        
        if not success:
            logger.error(f"Failed to insert lead for business {business['id']}")
            return False
        
        # Send notification to business
        label = "🔥 HOT LEAD" if score >= 7 else "New Lead"
        text = (
            f"{label}\n\n"
            f"👤 {name}\n"
            f"📞 {phone or '-'}\n"
            f"📧 {email or '-'}\n"
            f"📝 {message}\n"
            f"⭐ Score: {score}/10"
        )

        await bot.send_message(
            chat_id=business["telegram_id"],
            text=text
        )
        
        logger.info(f"Lead created successfully for business {business['id']} with score {score}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating lead: {e}", exc_info=True)
        return False

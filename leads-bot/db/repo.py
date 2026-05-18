"""
All database queries live here
Handlers must NEVER write raw SQL
"""

import logging
from typing import Optional, List, Dict
from db.database import get_connection

logger = logging.getLogger(__name__)


# =========================
# Business
# =========================

def create_or_update_business(telegram_id: int, name: str) -> bool:
    """
    Create or update business record
    Returns True if successful, False otherwise
    """
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
        INSERT INTO businesses (telegram_id, name)
        VALUES (?, ?)
        ON CONFLICT(telegram_id)
        DO UPDATE SET name=excluded.name
        """, (telegram_id, name))

        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error creating/updating business: {e}")
        return False


def get_business_by_telegram(telegram_id: int) -> Optional[Dict]:
    """
    Get business by Telegram ID
    Returns business dict or None if not found
    """
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT * FROM businesses WHERE telegram_id=?",
            (telegram_id,)
        )

        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except Exception as e:
        logger.error(f"Error getting business: {e}")
        return None


def get_all_leads(business_id: int) -> List[Dict]:
    """
    Get all leads for a business
    Returns list of lead dictionaries
    """
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT * FROM leads WHERE business_id=? ORDER BY created_at DESC",
            (business_id,)
        )

        rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Error getting leads: {e}")
        return []


# =========================
# Leads
# =========================

def insert_lead(data: dict) -> bool:
    """
    Insert new lead record
    Returns True if successful, False otherwise
    """
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
        INSERT INTO leads
        (business_id, name, phone, email, message, fingerprint, score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data["business_id"],
            data["name"],
            data["phone"],
            data["email"],
            data["message"],
            data["fingerprint"],
            data["score"],
        ))

        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error inserting lead: {e}")
        return False


def get_lead_by_fingerprint(fingerprint: str) -> Optional[Dict]:
    """
    Check if lead already exists by fingerprint
    Returns lead dict if exists, None otherwise
    """
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT * FROM leads WHERE fingerprint=?",
            (fingerprint,)
        )

        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except Exception as e:
        logger.error(f"Error checking lead fingerprint: {e}")
        return None

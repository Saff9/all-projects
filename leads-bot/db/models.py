"""
Create tables if not exists
Runs once at startup
"""

from db.database import get_connection


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # businesses
    cur.execute("""
    CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE,
        name TEXT,
        require_phone INTEGER DEFAULT 0,
        require_email INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # leads
    cur.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id INTEGER,
        name TEXT,
        phone TEXT,
        email TEXT,
        message TEXT,
        fingerprint TEXT,
        score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

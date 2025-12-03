"""
RoastMyResume API - Backend service for AI-powered resume roasting using Groq and Neon DB
"""
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel, Field
from typing import Optional, Literal
import httpx
import os
import jwt
import json
from datetime import datetime, timedelta
import psycopg2
import urllib.parse

# =============================================================================
# App Initialization
# =============================================================================

app = FastAPI(
    title="RoastMyResume API",
    description="AI-powered resume roasting service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Configuration
# =============================================================================

class Settings:
    """Application settings loaded from environment variables"""
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    NEXTAUTH_SECRET: str = os.getenv("NEXTAUTH_SECRET")
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SHARE_JWT_SECRET: str = os.getenv("SHARE_JWT_SECRET", "fallback-secret-change-in-production")
    BASE_URL: str = os.getenv("NEXTAUTH_URL", "http://localhost:3000")

settings = Settings()

def get_db_connection():
    """Create a new PostgreSQL database connection to Neon DB"""
    if not settings.DATABASE_URL:
        raise Exception("DATABASE_URL environment variable is not configured")
    return psycopg2.connect(settings.DATABASE_URL, sslmode="require")

# =============================================================================
# Request/Response Models
# =============================================================================

class RoastRequest(BaseModel):
    """Request model for generating a roast"""
    text: str = Field(..., description="Resume text to roast", max_length=15000)
    intensity: Literal["mild", "spicy"] = Field(..., description="Roast intensity level")
    user_id: str = Field(..., description="User ID for rate limiting")
    tier: Literal["free", "pro"] = Field(..., description="User subscription tier")

class ShareLinkRequest(BaseModel):
    """Request model for creating a share link"""
    roast: str
    glow_up: str
    ats_rewrite: Optional[str] = None
    intensity: Literal["mild", "spicy"]

def verify_neon_auth_session(cookie: str) -> Optional[dict]:
    """Verify Neon Auth (Better Auth) session token via stateful DB query"""
    if not cookie or not settings.DATABASE_URL:
        return None
    
    token = None
    for item in cookie.split(";"):
        if "better-auth.session_token" in item:
            token = item.split("=")[1].strip()
            break
            
    if not token:
        return None
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Query session table for valid token
        cursor.execute(
            'SELECT "userId" FROM "session" WHERE "token" = %s AND "expiresAt" > NOW()',
            (token,)
        )
        row = cursor.fetchone()
        if row:
            return {"sub": row[0]}
    except Exception as e:
        print(f"Neon Auth session verification DB error: {e}")
    finally:
        if conn:
            conn.close()
            
    return None

async def call_groq_api(prompt: str, system_message: str, timeout: int = 25) -> str:
    """Call Groq API with timeout"""
    if not settings.GROQ_API_KEY:
        print("GROQ_API_KEY is not set")
        return "Your resume is so unique, it broke the AI. (Config Error: GROQ_API_KEY is missing)"
        
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8,
        "max_tokens": 1000
    }
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{settings.GROQ_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Groq API error: {e}")
        # Fallback roast
        return "Your resume is so unique, even ATS systems think it's abstract art. But hey, at least you're memorable! 🎨"

@app.post("/api/roast")
async def generate_roast(request: RoastRequest):
    """Generate AI roast for resume"""
    
    # Rate limiting for free users
    if request.tier == "free" and settings.DATABASE_URL:
        today = datetime.now().date()
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check current limit
            cursor.execute(
                "SELECT count FROM usage_limits WHERE user_id = %s AND date = %s",
                (request.user_id, today)
            )
            row = cursor.fetchone()
            count = row[0] if row else 0
            
            if count >= 1:
                raise HTTPException(
                    status_code=429, 
                    detail="Daily limit reached. Upgrade to Pro for unlimited roasts!"
                )
            
            # Increment usage
            if row:
                cursor.execute(
                    "UPDATE usage_limits SET count = count + 1 WHERE user_id = %s AND date = %s",
                    (request.user_id, today)
                )
            else:
                cursor.execute(
                    "INSERT INTO usage_limits (user_id, date, count) VALUES (%s, %s, 1)",
                    (request.user_id, today)
                )
            conn.commit()
        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"DB error during rate limit check: {e}")
            # Fail-open: if DB fails, allow the request to proceed in production
        finally:
            if conn:
                conn.close()
    
    # Build system message based on intensity and subscription tier
    if request.intensity == "spicy":
        system_message = """You are a savage, ego-destroying stand-up comedian who is also a ruthless, elite tech recruiter.
Your goal is to roast the user's resume brutally without any filter. Focus on:
- Pointing out useless buzzwords (like 'self-starter', 'detail-oriented', 'team player', 'results-driven').
- Laughing at passive, boring work descriptions.
- Exposing useless skill sections (like listing 'Microsoft Word', 'Windows', or basic HTML in 2026).
- Criticizing lack of metrics (no numbers, percentages, or dollar amounts of impact).
- Roasting short tenures, overlapping timelines, or generic job titles.
Be hilariously sarcastic, punchy, cynical, and ego-bruising (roast battle style), but avoid offensive language or slurs.

Your output MUST strictly follow this exact format:

[ROAST]
(Provide a brutally funny roast of the resume. Point out specific sections and text. Limit to 250 words.)

[GLOW-UP TIPS]
(Provide exactly 5 highly serious, actionable, and concrete career suggestions to improve the resume. Write them as a clean bulleted list starting with a key focus area in bold, e.g., '1. **Quantify Impact**: ...'. Limit to 200 words.)
"""
    else: # mild
        system_message = """You are a witty, sarcastic, but friendly senior engineering manager.
Your goal is to roast the user's resume with good-natured humor. Point out standard pitfalls:
- Overused buzzwords.
- Passive voice instead of active verbs.
- Lack of quantifiable metrics.
- Exaggerated accomplishments.
Keep it engaging, lighthearted, and constructive (witty constructive feedback style).

Your output MUST strictly follow this exact format:

[ROAST]
(Provide a witty, lighthearted roast pointing out standard mistakes. Limit to 250 words.)

[GLOW-UP TIPS]
(Provide exactly 5 highly serious, actionable, and concrete career suggestions to improve the resume. Write them as a clean bulleted list starting with a key focus area in bold, e.g., '1. **Quantify Impact**: ...'. Limit to 200 words.)
"""

    if request.tier == "pro":
        system_message += """
[ATS REWRITE]
(Provide exactly 3 high-impact, results-oriented bullet points that the user can copy-paste to replace generic sentences. Use the STAR framework: action verb + task/metric + business outcome. Limit to 150 words.)
"""

    # Build user prompt
    prompt = f"Here's my resume:\n\n{request.text[:15000]}"  # Trim to max 15k chars
    
    # Call Groq API
    response_text = await call_groq_api(prompt, system_message)
    
    # Parse response into sections
    roast = ""
    glow_up = ""
    ats_rewrite = ""
    
    # Try parsing by exact header tags first
    if "[ROAST]" in response_text:
        parts = response_text.split("[ROAST]")
        content = parts[1]
        
        if "[GLOW-UP TIPS]" in content:
            roast_part, glow_part = content.split("[GLOW-UP TIPS]")
            roast = roast_part.strip()
            
            if "[ATS REWRITE]" in glow_part:
                glow_sub, ats_sub = glow_part.split("[ATS REWRITE]")
                glow_up = glow_sub.strip()
                ats_rewrite = ats_sub.strip()
            else:
                glow_up = glow_part.strip()
        else:
            roast = content.strip()
            
    # Fallback to fuzzy line-by-line parsing if tags are missing
    if not roast.strip() or not glow_up.strip():
        roast = ""
        glow_up = ""
        sections = response_text.split("\n\n")
        current_section = "roast"
        
        for section in sections:
            section_lower = section.lower()
            if "glow-up" in section_lower or "glow up" in section_lower:
                current_section = "glow_up"
                continue
            elif "ats rewrite" in section_lower or "ats optimization" in section_lower:
                current_section = "ats"
                continue
            
            if current_section == "roast":
                roast += section + "\n\n"
            elif current_section == "glow_up":
                glow_up += section + "\n\n"
            elif current_section == "ats":
                ats_rewrite += section + "\n\n"
                
    result = {
        "roast": roast.replace("[ROAST]", "").strip(),
        "glow_up": glow_up.replace("[GLOW-UP TIPS]", "").strip() if glow_up.strip() else "Work on your skills, update your experience, quantify achievements, tailor for each job, and get certifications.",
    }
    
    if request.tier == "pro" and ats_rewrite.strip():
        result["ats_rewrite"] = ats_rewrite.replace("[ATS REWRITE]", "").strip()
    
    return result

@app.post("/api/create-share-link")
async def create_share_link(request: ShareLinkRequest):
    """Create JWT-based share link"""
    
    payload = {
        "roast": request.roast,
        "glow_up": request.glow_up,
        "ats_rewrite": request.ats_rewrite,
        "intensity": request.intensity,
        "created_at": int(datetime.now().timestamp())
    }
    
    # Create JWT token
    token = jwt.encode(
        payload,
        settings.SHARE_JWT_SECRET,
        algorithm="HS256"
    )
    
    share_url = f"{settings.BASE_URL}/share/{token}"
    
    return {"url": share_url}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "unconfigured"
    if settings.DATABASE_URL:
        try:
            conn = get_db_connection()
            conn.close()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
            
    return {
        "status": "healthy",
        "api": "RoastMyResume FastAPI",
        "db": db_status,
        "ai_model": settings.GROQ_MODEL
    }

# Mangum handler for Vercel
handler = Mangum(app)

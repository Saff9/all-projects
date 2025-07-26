# backend/routes/chat.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import AsyncSessionLocal
from utils.jwt_handler import decode_token
from schemas.chat_schemas import ChatRequest
from models.message import Message
from models.conversation import Conversation
from models.memory import Memory
from services.model_router import route_model


router = APIRouter(tags=["Chat"])  # FIXED: Removed prefix


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_user_id(token: str):
    decoded = decode_token(token)
    if "error" in decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return decoded["user_id"]


async def get_memory_context(db: AsyncSession, user_id: str):
    query = await db.execute(select(Memory).where(Memory.user_id == user_id))
    memories = query.scalars().all()

    # combine into readable context
    lines = []
    for m in memories:
        lines.append(f"[{m.memory_type}] {m.value}")

    return "\n".join(lines)


@router.post("/")
async def chat(req: ChatRequest, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)

    # validate conversation
    query = await db.execute(
        select(Conversation).where(
            Conversation.id == req.conversation_id,
            Conversation.user_id == user_id
        )
    )
    convo = query.scalars().first()

    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # save user message
    user_msg = Message(
        conversation_id=req.conversation_id,
        role="user",
        content=req.user_message,
        model="user"
    )
    db.add(user_msg)
    await db.commit()

    # build memory context
    memory_context = await get_memory_context(db, user_id)

    # reasoning mode (DeepSeek style)
    reasoning_tag = ""
    if req.reasoning_mode:
        reasoning_tag = (
            "\n\n[REASONING MODE ENABLED – show chain-of-thought internally but do NOT reveal it]"
        )

    # build system prompt
    final_prompt = f"""
You are Apex AI – Fast, Smart, Calm on the Eyes.

User Message:
{req.user_message}

User Memory (long-term context):
{memory_context}

{reasoning_tag}

Respond naturally, clearly, and helpfully.
"""

    # call LLM
    ai_response = await route_model(req.model, final_prompt)

    # save assistant message
    assistant_msg = Message(
        conversation_id=req.conversation_id,
        role="assistant",
        content=ai_response,
        model=req.model
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return {
        "response": ai_response,
        "message_id": assistant_msg.id
    }

# backend/routes/message.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import AsyncSessionLocal
from models.message import Message
from models.conversation import Conversation
from schemas.message_schemas import CreateMessageSchema
from utils.jwt_handler import decode_token

router = APIRouter(tags=["Messages"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_user_id(token: str):
    decoded = decode_token(token)
    if "error" in decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return decoded["user_id"]


@router.post("/{conversation_id}")
async def add_message(conversation_id: str, data: CreateMessageSchema, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)

    # Validate conversation belongs to user
    query = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    )
    convo = query.scalars().first()

    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save message
    msg = Message(
        conversation_id=conversation_id,
        role=data.role,
        content=data.content,
        model=data.model
    )

    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return {"message": "Message added", "message_id": msg.id}


@router.get("/{conversation_id}")
async def get_messages(conversation_id: str, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)

    # Validate user owns conversation
    query = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    )
    convo = query.scalars().first()

    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get messages
    query = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id)
    )
    data = query.scalars().all()

    return {"messages": data}

# backend/routes/conversation.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import AsyncSessionLocal
from models.conversation import Conversation
from schemas.conversation_schemas import CreateConversationSchema, RenameConversationSchema
from utils.jwt_handler import decode_token

router = APIRouter(tags=["Conversations"])  # FIXED: Removed prefix


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_user_id(token: str):
    decoded = decode_token(token)
    if "error" in decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return decoded["user_id"]


@router.post("/")
async def create_conversation(data: CreateConversationSchema, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)

    convo = Conversation(user_id=user_id, title=data.title)
    db.add(convo)
    await db.commit()
    await db.refresh(convo)

    return {"message": "Conversation created", "conversation_id": convo.id}


@router.get("/")
async def get_conversations(token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)

    query = await db.execute(select(Conversation).where(Conversation.user_id == user_id))
    data = query.scalars().all()

    return {"conversations": data}


@router.put("/{conversation_id}")
async def rename_conversation(conversation_id: str, data: RenameConversationSchema, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)

    query = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    )
    convo = query.scalars().first()

    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    convo.title = data.new_title
    await db.commit()

    return {"message": "Conversation renamed"}


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)

    query = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    )
    convo = query.scalars().first()

    if convo:
        await db.delete(convo)
        await db.commit()

    return {"message": "Conversation deleted"}

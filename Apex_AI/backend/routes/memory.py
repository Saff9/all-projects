# backend/routes/memory.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import AsyncSessionLocal
from utils.jwt_handler import decode_token
from schemas.memory_schemas import CreateMemorySchema, UpdateMemorySchema
from services.memory_service import (
    get_user_memory,
    add_memory,
    update_memory,
    delete_memory
)

router = APIRouter(tags=["Memory"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_user_id(token: str):
    decoded = decode_token(token)
    if "error" in decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return decoded["user_id"]


@router.get("/")
async def fetch_memory(token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)
    memory = await get_user_memory(db, user_id)
    return {"memory": memory}


@router.post("/")
async def create_memory(data: CreateMemorySchema, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)
    mem = await add_memory(db, user_id, data.memory_type, data.value)
    return {"message": "Memory added", "memory_id": mem.id}


@router.put("/{memory_id}")
async def edit_memory(memory_id: str, data: UpdateMemorySchema, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)
    updated = await update_memory(db, memory_id, data.value)

    if not updated:
        raise HTTPException(status_code=404, detail="Memory not found")

    return {"message": "Memory updated"}


@router.delete("/{memory_id}")
async def remove_memory(memory_id: str, token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id(token)
    await delete_memory(db, memory_id)
    return {"message": "Memory deleted"}

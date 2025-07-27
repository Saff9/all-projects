# backend/services/memory_service.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.memory import Memory

async def get_user_memory(db: AsyncSession, user_id: str):
    query = await db.execute(select(Memory).where(Memory.user_id == user_id))
    return query.scalars().all()

async def add_memory(db: AsyncSession, user_id: str, memory_type: str, value: str):
    new_mem = Memory(
        user_id=user_id,
        memory_type=memory_type,
        value=value
    )
    db.add(new_mem)
    await db.commit()
    await db.refresh(new_mem)
    return new_mem

async def update_memory(db: AsyncSession, memory_id: str, new_value: str):
    query = await db.execute(select(Memory).where(Memory.id == memory_id))
    mem = query.scalars().first()

    if mem:
        mem.value = new_value
        await db.commit()

    return mem

async def delete_memory(db: AsyncSession, memory_id: str):
    query = await db.execute(select(Memory).where(Memory.id == memory_id))
    mem = query.scalars().first()

    if mem:
        await db.delete(mem)
        await db.commit()

    return True

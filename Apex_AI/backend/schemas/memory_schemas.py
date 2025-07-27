# backend/schemas/memory_schemas.py

from pydantic import BaseModel

class CreateMemorySchema(BaseModel):
    memory_type: str       # preference / profile / longterm / special
    value: str

class UpdateMemorySchema(BaseModel):
    value: str

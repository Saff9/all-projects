# backend/schemas/auth_schemas.py

from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    email: EmailStr
    username: str
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

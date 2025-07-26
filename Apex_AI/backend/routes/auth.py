# backend/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from schemas.auth_schemas import RegisterSchema, LoginSchema, TokenResponse
from utils.hashing import hash_password, verify_password
from utils.jwt_handler import create_access_token, create_refresh_token
from database import get_db
from models.user import User
from models.session import Session

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register_user(data: RegisterSchema, db: AsyncSession = Depends(get_db)):
    # Check email
    query = await db.execute(select(User).where(User.email == data.email))
    existing_user = query.scalars().first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    new_user = User(
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password)
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create tokens
    access = create_access_token({"user_id": str(new_user.id)})
    refresh = create_refresh_token({"user_id": str(new_user.id)})

    # Store refresh token
    session = Session(user_id=new_user.id, refresh_token=refresh)
    db.add(session)
    await db.commit()

    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenResponse)
async def login_user(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(User).where(User.email == data.email))
    user = query.scalars().first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_access_token({"user_id": str(user.id)})
    refresh = create_refresh_token({"user_id": str(user.id)})

    session = Session(user_id=user.id, refresh_token=refresh)
    db.add(session)
    await db.commit()

    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(Session).where(Session.refresh_token == refresh_token))
    session = query.scalars().first()

    if not session:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = str(session.user_id)

    new_access = create_access_token({"user_id": user_id})
    new_refresh = create_refresh_token({"user_id": user_id})

    session.refresh_token = new_refresh
    await db.commit()

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh
    )


@router.post("/logout")
async def logout(refresh_token: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(Session).where(Session.refresh_token == refresh_token))
    session = query.scalars().first()

    if session:
        await db.delete(session)
        await db.commit()

    return {"message": "Logged out successfully"}

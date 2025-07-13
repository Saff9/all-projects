from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.auth.jwt_handler import JWTHandler, TokenData
import uuid

router = APIRouter()

# ---------------------------------------------------------------------------
# In-memory user store (sufficient for demo / early production).
# Replace with a proper SQLAlchemy User model + Alembic migration when ready.
# ---------------------------------------------------------------------------
users_db: dict = {}   # { username: {id, username, email, hashed_password, role} }


# ── Request / Response schemas ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    role: str


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """Register a new user account."""
    if request.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters",
        )

    user_id = str(uuid.uuid4())
    hashed = JWTHandler.hash_password(request.password)
    users_db[request.username] = {
        "id": user_id,
        "username": request.username,
        "email": request.email,
        "hashed_password": hashed,
        "role": "user",
    }

    access_token = JWTHandler.create_access_token(user_id, role="user")
    refresh_token = JWTHandler.create_refresh_token(user_id)
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id,
        role="user",
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Authenticate a user and return JWT tokens."""
    user = users_db.get(request.username)
    if not user or not JWTHandler.verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = JWTHandler.create_access_token(user["id"], role=user["role"])
    refresh_token = JWTHandler.create_refresh_token(user["id"])
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user["id"],
        role=user["role"],
    )


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Exchange a refresh token for a new access token."""
    token_data = JWTHandler.verify_token(refresh_token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    new_access = JWTHandler.create_access_token(token_data.user_id, role=token_data.role)
    return {"access_token": new_access, "token_type": "bearer"}

# backend/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # CockroachDB connection
    DATABASE_URL: str = "postgresql://username:password@cockroach_url/apex_ai?sslmode=verify-full"

    # JWT
    JWT_SECRET: str = "SUPER_SECRET_KEY_REPLACE_THIS"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # API Providers
    GROQ_API_KEY: str = ""
    HF_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    SEARCH_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()

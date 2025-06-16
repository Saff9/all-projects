# backend/app/core/lifespan.py

from contextlib import asynccontextmanager
from fastapi import FastAPI
from services.provider_monitor import start_provider_monitor


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_provider_monitor()
    yield

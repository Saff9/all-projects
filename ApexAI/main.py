from fastapi import FastAPI
from routers import ask, feedback

app = FastAPI(
    title="GenzAI Backend",
    description="Backend API for GenzAI — created by Saffan from Kashmir",
    version="1.0.0"
)

app.include_router(ask.router)
app.include_router(feedback.router)

@app.get("/")
async def home():
    return {"message": "Welcome to GenzAI API — made by Saffan from Kashmir"}

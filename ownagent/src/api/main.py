"""
Apex Smart - FastAPI Application Entry Point
"""
import os
import sys
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from sqlalchemy import text

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.api.config import settings, ensure_directories
from src.api.routes import router as api_router
from src.core.database import initialize_database
from src.core.exceptions import ApexSmartException


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    print("=" * 60)
    print("Apex Smart API Starting Up")
    print(f"Version: {settings.APP_VERSION}")
    print(f"Host: {settings.HOST}:{settings.PORT}")
    print("=" * 60)
    
    # Ensure directories exist
    ensure_directories()
    
    # Initialize database
    initialize_database()
    print("Database initialized")
    
    yield
    
    # Shutdown
    print("Apex Smart API shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Premium AI personal assistant with multi-provider support",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
        
        # Cache control for production
        if settings.DEBUG:
            response.headers["Cache-Control"] = "no-cache"
        
        return response


# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(ApexSmartException)
async def genzsmart_exception_handler(request: Request, exc: ApexSmartException):
    """Handle custom Apex Smart exceptions"""
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    error_msg = str(exc) if settings.DEBUG else "Internal server error"
    # Don't expose internal error details for security
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": error_msg
            }
        }
    )


# Health check endpoint
@app.get("/health", include_in_schema=False)
async def health_check():
    """Health check endpoint"""
    from src.services.ai import get_all_provider_ids, get_provider_class
    from src.core.database import get_db_session
    
    # Check database
    db_status = "connected"
    try:
        with get_db_session() as db:
            db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"
    
    # Check providers (basic check)
    providers_status = {}
    for provider_id in get_all_provider_ids():
        provider_class = get_provider_class(provider_id)
        if provider_class:
            providers_status[provider_id] = "available"
        else:
            providers_status[provider_id] = "unavailable"
    
    return {
        "success": True,
        "data": {
            "status": "healthy" if db_status == "connected" else "degraded",
            "version": settings.APP_VERSION,
            "timestamp": datetime.utcnow().isoformat(),
            "database": db_status,
            "providers": providers_status
        }
    }


# Simple health check for load balancers
@app.get("/healthz", include_in_schema=False)
async def healthz():
    """Simple health check for load balancers"""
    return Response(content="healthy", media_type="text/plain")


# 404 handler
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": f"The requested endpoint '{request.url.path}' was not found"
            }
        }
    )


# API info endpoint
@app.get("/api/v1/info")
async def api_info():
    """Get API information"""
    from src.services.ai import get_all_provider_ids
    
    return {
        "success": True,
        "data": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "features": [
                "chat",
                "streaming",
                "file_upload",
                "web_search",
                "multi_provider"
            ],
            "providers": get_all_provider_ids()
        }
    }


# Include API routes
app.include_router(api_router)

# Mount static files (if they exist)
static_dir = os.path.join(os.path.dirname(__file__), "..", "web", "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )

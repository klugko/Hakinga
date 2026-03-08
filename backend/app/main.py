"""
Hakinga API - Main Application Entry Point.

FastAPI application setup with middleware, routes, and lifecycle management.
"""
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import RequestLoggingMiddleware, setup_logging
from app.core.rate_limit import DEFAULT_RATE_LIMITS, RateLimitMiddleware
from app.infrastructure.database import models  # noqa: F401 - Import models to register them
from app.infrastructure.database.base import Base
from app.infrastructure.database.session import engine
from app.presentation.api.v1.router import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and shutdown events."""
    # Create all database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    # Setup structured logging
    setup_logging(log_level=settings.log_level if hasattr(settings, 'log_level') else "INFO")

    application = FastAPI(
        title=settings.app_name,
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        docs_url=f"{settings.api_v1_prefix}/docs",
        redoc_url=f"{settings.api_v1_prefix}/redoc",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add rate limiting middleware
    application.add_middleware(RateLimitMiddleware, limits=DEFAULT_RATE_LIMITS)

    # Add request logging middleware
    application.add_middleware(RequestLoggingMiddleware)

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    return application


app = create_application()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler to ensure CORS headers on errors."""
    origin = request.headers.get("origin", "")
    headers = {}

    # Add CORS headers if origin matches allowed origins
    if origin in settings.cors_origins or "*" in settings.cors_origins:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
        headers=headers,
    )


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}

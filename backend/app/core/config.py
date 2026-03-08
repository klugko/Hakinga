"""
Application configuration module.

Loads and validates environment variables using Pydantic settings.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Hakinga API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str
    database_pool_size: int = 5
    database_max_overflow: int = 10

    secret_key: str = "change-me-in-production-with-secure-random-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    email_host: str = ""
    email_host_user: str = ""
    email_host_password: str = ""
    email_port: int = 587
    email_from: str = ""

    redis_url: str = "redis://localhost:6379"

    password_reset_token_expire_hours: int = 24


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()

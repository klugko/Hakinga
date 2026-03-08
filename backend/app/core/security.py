"""
Security utilities for authentication and authorization.

Provides password hashing and JWT token management.
"""
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash for a password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Args:
        subject: The subject claim (typically user ID).
        expires_delta: Optional custom expiration time.

    Returns:
        Encoded JWT token string.
    """
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(subject: str) -> str:
    """
    Create a JWT refresh token.

    Args:
        subject: The subject claim (typically user ID).

    Returns:
        Encoded JWT refresh token string.
    """
    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    to_encode: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict[str, Any] | None:
    """
    Decode and validate a JWT token.

    Args:
        token: The JWT token string.

    Returns:
        Decoded token payload or None if invalid.
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None


def create_password_reset_token(email: str) -> str:
    """
    Create a password reset token.

    Args:
        email: User's email address.

    Returns:
        Encoded JWT token for password reset.
    """
    expire = datetime.now(UTC) + timedelta(
        hours=settings.password_reset_token_expire_hours
    )
    to_encode: dict[str, Any] = {
        "sub": email,
        "exp": expire,
        "type": "password_reset",
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def verify_password_reset_token(token: str) -> str | None:
    """
    Verify a password reset token and extract the email.

    Args:
        token: The password reset token.

    Returns:
        Email address if valid, None otherwise.
    """
    payload = decode_token(token)
    if payload and payload.get("type") == "password_reset":
        return payload.get("sub")
    return None


def verify_refresh_token(token: str) -> str | None:
    """
    Verify a refresh token and extract the user ID.

    Args:
        token: The refresh token.

    Returns:
        User ID if valid, None otherwise.
    """
    payload = decode_token(token)
    if payload and payload.get("type") == "refresh":
        return payload.get("sub")
    return None


def verify_access_token(token: str) -> str | None:
    """
    Verify an access token and extract the user ID.

    Args:
        token: The access token.

    Returns:
        User ID if valid, None otherwise.
    """
    payload = decode_token(token)
    if payload and payload.get("type") == "access":
        return payload.get("sub")
    return None

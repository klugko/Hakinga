"""
Authentication schemas.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, EmailStr, Field

if TYPE_CHECKING:
    from app.presentation.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    """User registration request."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    """User login request."""

    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request."""

    token: str
    new_password: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    """Change password request."""

    current_password: str
    new_password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    """Authentication response with user data."""

    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"



def _rebuild_models() -> None:
    from app.presentation.schemas.user import UserResponse  # noqa: F401
    AuthResponse.model_rebuild()


_rebuild_models()

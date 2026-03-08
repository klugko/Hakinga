"""
User schemas.
"""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserStatsResponse(BaseModel):
    """User statistics response."""

    avg_wpm: float
    avg_accuracy: float
    best_wpm: int
    total_sessions: int
    total_time_typed: int
    total_characters_typed: int


class UserResponse(BaseModel):
    """User response."""

    id: str
    username: str
    email: str
    avatar: str | None = None
    created_at: datetime
    stats: UserStatsResponse


class UserProfileResponse(BaseModel):
    """Public user profile response."""

    id: str
    username: str
    avatar: str | None = None
    created_at: datetime
    stats: UserStatsResponse


class UpdateProfileRequest(BaseModel):
    """Update profile request."""

    username: str | None = Field(None, min_length=3, max_length=50)
    email: EmailStr | None = None
    avatar: str | None = None


class UserSearchResponse(BaseModel):
    """User search result."""

    id: str
    username: str
    avatar: str | None = None
    stats: dict


class DashboardStatsResponse(BaseModel):
    """Dashboard statistics response."""

    total_sessions: int
    avg_wpm: float
    avg_accuracy: float
    best_wpm: int
    total_time_typed: int
    improvement_percent: float
    recent_sessions: list[dict]
    wpm_trend: list[dict]

"""
Typing session schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class WpmDataPointSchema(BaseModel):
    """WPM data point schema."""

    time: int
    wpm: int
    accuracy: float


class CreateSessionRequest(BaseModel):
    """Create solo session request."""

    text_id: str
    text: str
    wpm: int = Field(..., ge=0)
    raw_wpm: int = Field(..., ge=0)
    accuracy: float = Field(..., ge=0, le=100)
    errors: int = Field(..., ge=0)
    total_characters: int = Field(..., ge=0)
    correct_characters: int = Field(..., ge=0)
    duration: int = Field(..., ge=0)
    wpm_history: list[WpmDataPointSchema] = []


class SessionResponse(BaseModel):
    """Typing session response."""

    id: str
    user_id: str
    text_id: str
    wpm: int
    raw_wpm: int
    accuracy: float
    errors: int
    total_characters: int
    correct_characters: int
    duration: int
    started_at: datetime
    completed_at: datetime
    mode: str
    wpm_history: list[WpmDataPointSchema]


class SessionListResponse(BaseModel):
    """Session list item."""

    id: str
    text_id: str
    wpm: int
    raw_wpm: int
    accuracy: float
    errors: int
    total_characters: int
    duration: int
    mode: str
    started_at: datetime
    completed_at: datetime


class SessionHistoryResponse(BaseModel):
    """Session history paginated response."""

    sessions: list[SessionListResponse]
    total: int
    page: int
    pages: int

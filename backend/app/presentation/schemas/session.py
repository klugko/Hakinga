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
    max_combo: int = Field(default=0, ge=0)
    difficulty: str = Field(default="medium")


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


class XPBreakdownSchema(BaseModel):
    """XP gain breakdown."""

    base_xp: int
    difficulty_multiplier: float
    mode_multiplier: float
    streak_bonus: int
    perfect_accuracy_bonus: int
    personal_best_bonus: int
    total_xp: int


class LevelInfoSchema(BaseModel):
    """User level information."""

    level: int
    current_xp: int
    xp_for_current_level: int
    xp_for_next_level: int
    progress_percent: float
    xp_needed: int


class SessionWithXPResponse(BaseModel):
    """Typing session response with XP information."""

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
    max_combo: int = 0
    xp_earned: int = 0
    xp_breakdown: Optional[XPBreakdownSchema] = None
    level_info: Optional[LevelInfoSchema] = None
    leveled_up: bool = False
    new_level: Optional[int] = None
    new_streak: int = 0

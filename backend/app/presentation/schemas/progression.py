"""
User progression schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class XPBreakdownResponse(BaseModel):
    """XP gain breakdown."""

    base_xp: int
    difficulty_multiplier: float
    mode_multiplier: float
    streak_bonus: int
    perfect_accuracy_bonus: int
    personal_best_bonus: int
    total_xp: int


class LevelInfoResponse(BaseModel):
    """User level information."""

    level: int
    current_xp: int
    xp_for_current_level: int
    xp_for_next_level: int
    progress_percent: float
    xp_needed: int


class UserProgressResponse(BaseModel):
    """User progress response."""

    user_id: str
    total_xp: int
    current_level: int
    current_streak: int
    best_streak: int
    last_session_date: Optional[datetime]
    rank_tier: str
    mmr: int
    level_info: LevelInfoResponse


class SessionXPResponse(BaseModel):
    """Response after session completion with XP info."""

    xp_gained: XPBreakdownResponse
    level_info: LevelInfoResponse
    leveled_up: bool
    new_level: Optional[int]
    new_streak: int


class XPLeaderboardEntry(BaseModel):
    """XP leaderboard entry."""

    rank: int
    user_id: str
    username: str
    avatar: Optional[str]
    total_xp: int
    level: int
    streak: int
    rank_tier: str


class XPLeaderboardResponse(BaseModel):
    """XP leaderboard response."""

    entries: list[XPLeaderboardEntry]
    user_rank: Optional[int]
    total_users: int


class RankLeaderboardEntry(BaseModel):
    """Ranked leaderboard entry."""

    rank: int
    user_id: str
    username: str
    avatar: Optional[str]
    mmr: int
    rank_tier: str
    level: int


class RankLeaderboardResponse(BaseModel):
    """Ranked leaderboard response."""

    entries: list[RankLeaderboardEntry]
    total_users: int

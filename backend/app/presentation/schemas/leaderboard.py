"""
Leaderboard schemas.
"""
from typing import Optional

from pydantic import BaseModel


class LeaderboardEntryResponse(BaseModel):
    """Leaderboard entry response."""

    rank: int
    user_id: str
    username: str
    avatar: Optional[str] = None
    wpm: int
    accuracy: float
    sessions_played: int


class LeaderboardResponse(BaseModel):
    """Leaderboard paginated response."""

    entries: list[LeaderboardEntryResponse]
    total: int
    page: int
    pages: int

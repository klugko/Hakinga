"""
Achievement schemas.
"""

from pydantic import BaseModel


class AchievementResponse(BaseModel):
    """Achievement response."""

    id: str
    name: str
    description: str
    icon: str
    max_progress: int | None = None
    progress: int = 0
    unlocked_at: str | None = None

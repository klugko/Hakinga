"""
Achievement schemas.
"""
from typing import Optional

from pydantic import BaseModel


class AchievementResponse(BaseModel):
    """Achievement response."""

    id: str
    name: str
    description: str
    icon: str
    max_progress: Optional[int] = None
    progress: int = 0
    unlocked_at: Optional[str] = None

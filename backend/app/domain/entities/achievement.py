"""
Achievement domain entity.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class Achievement:
    """
    Achievement domain entity.

    Represents an achievement that users can unlock.
    """

    id: UUID
    name: str
    description: str
    icon: str
    max_progress: Optional[int] = None
    is_active: bool = True


@dataclass
class UserAchievement:
    """
    User achievement association.

    Represents a user's progress or unlock status for an achievement.
    """

    id: UUID
    user_id: UUID
    achievement_id: UUID
    progress: int = 0
    unlocked_at: Optional[datetime] = None

    @property
    def is_unlocked(self) -> bool:
        """Check if achievement is unlocked."""
        return self.unlocked_at is not None

    def update_progress(self, new_progress: int, max_progress: Optional[int]) -> bool:
        """
        Update achievement progress.

        Args:
            new_progress: New progress value.
            max_progress: Maximum progress for completion.

        Returns:
            True if achievement was just unlocked, False otherwise.
        """
        if self.is_unlocked:
            return False

        self.progress = new_progress

        if max_progress is not None and self.progress >= max_progress:
            self.unlocked_at = datetime.utcnow()
            return True

        return False

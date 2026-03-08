"""
Achievement repository interface.
"""
from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.achievement import Achievement, UserAchievement


class AchievementRepository(ABC):
    """
    Abstract repository interface for Achievement persistence.
    """

    @abstractmethod
    async def get_all_achievements(self) -> list[Achievement]:
        """Get all available achievements."""
        ...

    @abstractmethod
    async def get_achievement_by_id(self, achievement_id: UUID) -> Achievement | None:
        """Get an achievement by ID."""
        ...

    @abstractmethod
    async def get_user_achievements(self, user_id: UUID) -> list[UserAchievement]:
        """
        Get all achievements for a user with their progress.

        Args:
            user_id: User's ID.

        Returns:
            List of user achievements with progress.
        """
        ...

    @abstractmethod
    async def get_user_achievement(
        self,
        user_id: UUID,
        achievement_id: UUID,
    ) -> UserAchievement | None:
        """Get a specific user achievement."""
        ...

    @abstractmethod
    async def create_user_achievement(
        self,
        user_achievement: UserAchievement,
    ) -> UserAchievement:
        """Create a new user achievement record."""
        ...

    @abstractmethod
    async def update_user_achievement(
        self,
        user_achievement: UserAchievement,
    ) -> UserAchievement:
        """Update user achievement progress."""
        ...

    @abstractmethod
    async def create_achievement(self, achievement: Achievement) -> Achievement:
        """Create a new achievement definition."""
        ...

"""
User progression repository interface.
"""
from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.progression import UserProgress


class ProgressionRepository(ABC):
    """
    Abstract repository interface for UserProgress persistence.
    """

    @abstractmethod
    async def create(self, progress: UserProgress) -> UserProgress:
        """
        Create a new user progress record.

        Args:
            progress: UserProgress entity to persist.

        Returns:
            Created progress with generated ID.
        """
        ...

    @abstractmethod
    async def get_by_id(self, progress_id: UUID) -> UserProgress | None:
        """
        Get a progress record by ID.

        Args:
            progress_id: Unique progress identifier.

        Returns:
            UserProgress if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_by_user_id(self, user_id: UUID) -> UserProgress | None:
        """
        Get a user's progress record.

        Args:
            user_id: User's ID.

        Returns:
            UserProgress if found, None otherwise.
        """
        ...

    @abstractmethod
    async def update(self, progress: UserProgress) -> UserProgress:
        """
        Update a user's progress record.

        Args:
            progress: UserProgress entity with updated values.

        Returns:
            Updated UserProgress.
        """
        ...

    @abstractmethod
    async def get_top_by_xp(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict]:
        """
        Get top users by XP/level.

        Args:
            limit: Maximum number of results.
            offset: Number of results to skip.

        Returns:
            List of user progress data.
        """
        ...

    @abstractmethod
    async def get_user_xp_rank(self, user_id: UUID) -> int:
        """
        Get a user's rank position by XP.

        Args:
            user_id: User's ID.

        Returns:
            Rank position (1-indexed).
        """
        ...

    @abstractmethod
    async def get_top_by_mmr(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict]:
        """
        Get top users by MMR/rank.

        Args:
            limit: Maximum number of results.
            offset: Number of results to skip.

        Returns:
            List of user progress data with ranking info.
        """
        ...

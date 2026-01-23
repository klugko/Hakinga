"""
User settings repository interface.
"""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.settings import UserSettings


class SettingsRepository(ABC):
    """
    Abstract repository interface for UserSettings persistence.
    """

    @abstractmethod
    async def get_by_user_id(self, user_id: UUID) -> Optional[UserSettings]:
        """
        Get settings for a user.

        Args:
            user_id: User's ID.

        Returns:
            UserSettings if found, None otherwise.
        """
        ...

    @abstractmethod
    async def create(self, settings: UserSettings) -> UserSettings:
        """Create new user settings."""
        ...

    @abstractmethod
    async def update(self, settings: UserSettings) -> UserSettings:
        """Update existing user settings."""
        ...

    @abstractmethod
    async def create_default(self, user_id: UUID) -> UserSettings:
        """Create default settings for a new user."""
        ...

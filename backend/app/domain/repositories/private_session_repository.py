"""
Private session repository interface.
"""
from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.private_session import PrivateSession


class PrivateSessionRepository(ABC):
    """
    Abstract repository interface for PrivateSession persistence.
    """

    @abstractmethod
    async def create(self, session: PrivateSession) -> PrivateSession:
        """Create a new private session."""
        ...

    @abstractmethod
    async def get_by_id(self, session_id: UUID) -> PrivateSession | None:
        """Get a private session by ID."""
        ...

    @abstractmethod
    async def get_by_code(self, code: str) -> PrivateSession | None:
        """
        Get a private session by its code.

        Args:
            code: 6-character session code.

        Returns:
            Session if found, None otherwise.
        """
        ...

    @abstractmethod
    async def update(self, session: PrivateSession) -> PrivateSession:
        """Update a private session."""
        ...

    @abstractmethod
    async def delete(self, session_id: UUID) -> bool:
        """Delete a private session."""
        ...

    @abstractmethod
    async def get_active_sessions_for_user(self, user_id: UUID) -> list[PrivateSession]:
        """Get all active sessions where user is a participant."""
        ...

    @abstractmethod
    async def cleanup_expired_sessions(self, max_age_minutes: int = 30) -> int:
        """
        Delete expired waiting sessions.

        Args:
            max_age_minutes: Maximum age in minutes for waiting sessions.

        Returns:
            Number of sessions deleted.
        """
        ...

    @abstractmethod
    async def code_exists(self, code: str) -> bool:
        """Check if a session code already exists."""
        ...

"""
Typing session repository interface.
"""
from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID

from app.domain.entities.typing_session import SessionMode, TypingSession


class SessionRepository(ABC):
    """
    Abstract repository interface for TypingSession persistence.
    """

    @abstractmethod
    async def create(self, session: TypingSession) -> TypingSession:
        """
        Create a new typing session.

        Args:
            session: Session entity to persist.

        Returns:
            Created session with generated ID.
        """
        ...

    @abstractmethod
    async def get_by_id(self, session_id: UUID) -> TypingSession | None:
        """
        Get a session by ID.

        Args:
            session_id: Unique session identifier.

        Returns:
            Session if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_user_sessions(
        self,
        user_id: UUID,
        mode: SessionMode | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        sort_by: str = "completed_at",
        sort_order: str = "desc",
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[TypingSession], int]:
        """
        Get paginated sessions for a user with filters.

        Args:
            user_id: User's ID.
            mode: Optional mode filter.
            start_date: Optional start date filter.
            end_date: Optional end date filter.
            sort_by: Field to sort by.
            sort_order: Sort direction ('asc' or 'desc').
            limit: Maximum number of results.
            offset: Number of results to skip.

        Returns:
            Tuple of (sessions list, total count).
        """
        ...

    @abstractmethod
    async def get_user_stats(self, user_id: UUID) -> dict:
        """
        Get aggregated statistics for a user.

        Args:
            user_id: User's ID.

        Returns:
            Dictionary with aggregated stats.
        """
        ...

    @abstractmethod
    async def get_recent_sessions(
        self,
        user_id: UUID,
        limit: int = 10,
    ) -> list[TypingSession]:
        """
        Get most recent sessions for a user.

        Args:
            user_id: User's ID.
            limit: Maximum number of results.

        Returns:
            List of recent sessions.
        """
        ...

"""
Leaderboard repository interface.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class LeaderboardEntry:
    """Leaderboard entry data."""

    rank: int
    user_id: UUID
    username: str
    avatar: str | None
    wpm: int
    accuracy: float
    sessions_played: int


class LeaderboardRepository(ABC):
    """
    Abstract repository interface for Leaderboard queries.
    """

    @abstractmethod
    async def get_global_leaderboard(
        self,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[LeaderboardEntry], int]:
        """
        Get global leaderboard entries.

        Args:
            start_date: Optional start date for time range.
            end_date: Optional end date for time range.
            limit: Maximum results.
            offset: Results to skip.

        Returns:
            Tuple of (entries list, total count).
        """
        ...

    @abstractmethod
    async def get_user_rank(
        self,
        user_id: UUID,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> LeaderboardEntry | None:
        """
        Get a user's position on the leaderboard.

        Args:
            user_id: User's ID.
            start_date: Optional start date for time range.
            end_date: Optional end date for time range.

        Returns:
            User's leaderboard entry if they have sessions, None otherwise.
        """
        ...

    @abstractmethod
    async def get_friends_leaderboard(
        self,
        user_id: UUID,
        friend_ids: list[UUID],
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[LeaderboardEntry]:
        """
        Get leaderboard for user and their friends.

        Args:
            user_id: User's ID.
            friend_ids: List of friend user IDs.
            start_date: Optional start date.
            end_date: Optional end date.

        Returns:
            List of leaderboard entries for user and friends.
        """
        ...

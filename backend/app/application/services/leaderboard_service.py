"""
Leaderboard service.

Handles leaderboard queries and rankings.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from app.domain.repositories.friend_repository import FriendRepository
from app.domain.repositories.leaderboard_repository import LeaderboardRepository


class LeaderboardService:
    """Service handling leaderboard operations."""

    def __init__(
        self,
        leaderboard_repository: LeaderboardRepository,
        friend_repository: FriendRepository,
    ):
        self._leaderboard_repo = leaderboard_repository
        self._friend_repo = friend_repository

    def _get_date_range(self, time_range: Optional[str]) -> tuple[Optional[datetime], Optional[datetime]]:
        """Get start and end dates for a time range."""
        if not time_range or time_range == "all":
            return None, None

        end_date = datetime.now(timezone.utc)
        start_date = None

        if time_range == "today":
            start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif time_range == "week":
            start_date = end_date - timedelta(days=7)
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)

        return start_date, end_date

    async def get_global_leaderboard(
        self,
        time_range: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> dict:
        """
        Get global leaderboard.

        Args:
            time_range: Optional time range filter.
            page: Page number.
            limit: Results per page.

        Returns:
            Dictionary with leaderboard entries and pagination.
        """
        start_date, end_date = self._get_date_range(time_range)
        offset = (page - 1) * limit

        entries, total = await self._leaderboard_repo.get_global_leaderboard(
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset,
        )

        return {
            "entries": [
                {
                    "rank": e.rank,
                    "user_id": str(e.user_id),
                    "username": e.username,
                    "avatar": e.avatar,
                    "wpm": e.wpm,
                    "accuracy": e.accuracy,
                    "sessions_played": e.sessions_played,
                }
                for e in entries
            ],
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit if total > 0 else 1,
        }

    async def get_user_rank(
        self,
        user_id: UUID,
        time_range: Optional[str] = None,
    ) -> Optional[dict]:
        """
        Get a user's position on the leaderboard.

        Args:
            user_id: User's ID.
            time_range: Optional time range filter.

        Returns:
            User's leaderboard entry or None.
        """
        start_date, end_date = self._get_date_range(time_range)

        entry = await self._leaderboard_repo.get_user_rank(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
        )

        if not entry:
            return None

        return {
            "rank": entry.rank,
            "user_id": str(entry.user_id),
            "username": entry.username,
            "avatar": entry.avatar,
            "wpm": entry.wpm,
            "accuracy": entry.accuracy,
            "sessions_played": entry.sessions_played,
        }

    async def get_friends_leaderboard(
        self,
        user_id: UUID,
        time_range: Optional[str] = None,
    ) -> list[dict]:
        """
        Get leaderboard for user and their friends.

        Args:
            user_id: User's ID.
            time_range: Optional time range filter.

        Returns:
            List of leaderboard entries for friends.
        """
        friend_ids = await self._friend_repo.get_user_friends(user_id)
        start_date, end_date = self._get_date_range(time_range)

        entries = await self._leaderboard_repo.get_friends_leaderboard(
            user_id=user_id,
            friend_ids=friend_ids,
            start_date=start_date,
            end_date=end_date,
        )

        return [
            {
                "rank": e.rank,
                "user_id": str(e.user_id),
                "username": e.username,
                "avatar": e.avatar,
                "wpm": e.wpm,
                "accuracy": e.accuracy,
                "sessions_played": e.sessions_played,
            }
            for e in entries
        ]

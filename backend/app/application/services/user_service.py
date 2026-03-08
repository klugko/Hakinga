"""
User service.

Handles user profile management and statistics.
"""
from datetime import UTC, datetime
from uuid import UUID

from app.domain.entities.user import User
from app.domain.exceptions import DuplicateEntityError, EntityNotFoundError
from app.domain.repositories.session_repository import SessionRepository
from app.domain.repositories.user_repository import UserRepository


class UserService:
    """Service handling user operations."""

    def __init__(
        self,
        user_repository: UserRepository,
        session_repository: SessionRepository,
    ):
        self._user_repo = user_repository
        self._session_repo = session_repository

    async def get_user_by_id(self, user_id: UUID) -> User:
        """
        Get a user by their ID.

        Args:
            user_id: User's unique identifier.

        Returns:
            User entity.

        Raises:
            EntityNotFoundError: If user not found.
        """
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundError("User", str(user_id))
        return user

    async def update_profile(
        self,
        user_id: UUID,
        username: str | None = None,
        email: str | None = None,
        avatar: str | None = None,
    ) -> User:
        """
        Update user profile information.

        Args:
            user_id: User's ID.
            username: New username (optional).
            email: New email (optional).
            avatar: New avatar URL (optional).

        Returns:
            Updated user.

        Raises:
            EntityNotFoundError: If user not found.
            DuplicateEntityError: If new email/username already exists.
        """
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundError("User", str(user_id))

        if username and username != user.username:
            if await self._user_repo.exists_by_username(username):
                raise DuplicateEntityError("User", "username", username)
            user.username = username.strip()

        if email and email.lower() != user.email:
            email = email.lower().strip()
            if await self._user_repo.exists_by_email(email):
                raise DuplicateEntityError("User", "email", email)
            user.email = email

        if avatar is not None:
            user.avatar = avatar if avatar else None

        user.updated_at = datetime.now(UTC)
        return await self._user_repo.update(user)

    async def delete_account(self, user_id: UUID) -> bool:
        """
        Delete a user account.

        Args:
            user_id: User's ID.

        Returns:
            True if deleted successfully.
        """
        return await self._user_repo.delete(user_id)

    async def search_users(self, query: str, limit: int = 10) -> list[User]:
        """
        Search users by username.

        Args:
            query: Search query.
            limit: Maximum results.

        Returns:
            List of matching users.
        """
        return await self._user_repo.search_by_username(query, limit)

    async def get_user_dashboard_stats(self, user_id: UUID) -> dict:
        """
        Get dashboard statistics for a user.

        Args:
            user_id: User's ID.

        Returns:
            Dictionary with dashboard statistics.
        """
        user = await self.get_user_by_id(user_id)
        stats = await self._session_repo.get_user_stats(user_id)
        recent_sessions = await self._session_repo.get_recent_sessions(user_id, limit=5)

        sessions_week_ago = await self._session_repo.get_user_sessions(
            user_id=user_id,
            limit=100,
            offset=0,
        )

        improvement = 0.0
        if len(sessions_week_ago[0]) >= 2:
            first_half = sessions_week_ago[0][: len(sessions_week_ago[0]) // 2]
            second_half = sessions_week_ago[0][len(sessions_week_ago[0]) // 2 :]

            if first_half and second_half:
                first_avg = sum(s.wpm for s in first_half) / len(first_half)
                second_avg = sum(s.wpm for s in second_half) / len(second_half)
                if second_avg > 0:
                    improvement = ((first_avg - second_avg) / second_avg) * 100

        wpm_trend = []
        for session in reversed(recent_sessions):
            wpm_trend.append(
                {
                    "time": len(wpm_trend) + 1,
                    "wpm": session.wpm,
                    "accuracy": session.accuracy,
                }
            )

        return {
            "total_sessions": stats["total_sessions"],
            "avg_wpm": stats["avg_wpm"],
            "avg_accuracy": stats["avg_accuracy"],
            "best_wpm": user.stats.best_wpm,
            "total_time_typed": stats["total_time_typed"],
            "improvement_percent": round(improvement, 1),
            "recent_sessions": [
                {
                    "id": str(s.id),
                    "wpm": s.wpm,
                    "accuracy": s.accuracy,
                    "duration": s.duration,
                    "mode": s.mode.value,
                    "completed_at": s.completed_at.isoformat(),
                }
                for s in recent_sessions
            ],
            "wpm_trend": wpm_trend,
        }

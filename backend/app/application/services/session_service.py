"""
Typing session service.

Handles typing session creation and management.
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from app.domain.entities.typing_session import SessionMode, TypingSession, WpmDataPoint
from app.domain.exceptions import EntityNotFoundError
from app.domain.repositories.session_repository import SessionRepository
from app.domain.repositories.text_repository import TextRepository
from app.domain.repositories.user_repository import UserRepository


class SessionService:
    """Service handling typing session operations."""

    def __init__(
        self,
        session_repository: SessionRepository,
        user_repository: UserRepository,
        text_repository: TextRepository,
    ):
        self._session_repo = session_repository
        self._user_repo = user_repository
        self._text_repo = text_repository

    async def create_solo_session(
        self,
        user_id: UUID,
        text_id: UUID,
        text_content: str,
        wpm: int,
        raw_wpm: int,
        accuracy: float,
        errors: int,
        total_characters: int,
        correct_characters: int,
        duration: int,
        wpm_history: list[dict],
    ) -> TypingSession:
        """
        Create a new solo typing session.

        Args:
            user_id: User's ID.
            text_id: Text ID that was typed.
            text_content: The actual text content.
            wpm: Final words per minute.
            raw_wpm: Raw WPM including errors.
            accuracy: Accuracy percentage.
            errors: Number of errors.
            total_characters: Total characters typed.
            correct_characters: Correctly typed characters.
            duration: Session duration in seconds.
            wpm_history: WPM history data points.

        Returns:
            Created typing session.
        """
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundError("User", str(user_id))

        now = datetime.now(timezone.utc)

        session = TypingSession(
            id=uuid4(),
            user_id=user_id,
            text_id=text_id,
            text_content=text_content,
            wpm=wpm,
            raw_wpm=raw_wpm,
            accuracy=accuracy,
            errors=errors,
            total_characters=total_characters,
            correct_characters=correct_characters,
            duration=duration,
            started_at=datetime.fromtimestamp(
                now.timestamp() - duration, tz=timezone.utc
            ),
            completed_at=now,
            mode=SessionMode.SOLO,
            wpm_history=[
                WpmDataPoint(time=p["time"], wpm=p["wpm"], accuracy=p["accuracy"])
                for p in wpm_history
            ],
        )

        created_session = await self._session_repo.create(session)

        user.update_stats(wpm, accuracy, duration, total_characters)
        await self._user_repo.update(user)

        return created_session

    async def get_session_history(
        self,
        user_id: UUID,
        mode: Optional[str] = None,
        date_range: Optional[str] = None,
        sort_by: str = "date",
        sort_order: str = "desc",
        page: int = 1,
        limit: int = 20,
    ) -> dict:
        """
        Get paginated session history for a user.

        Args:
            user_id: User's ID.
            mode: Optional mode filter.
            date_range: Optional date range filter.
            sort_by: Sort field.
            sort_order: Sort direction.
            page: Page number.
            limit: Results per page.

        Returns:
            Dictionary with sessions and pagination info.
        """
        from datetime import timedelta

        session_mode = None
        if mode and mode != "all":
            session_mode = SessionMode(mode)

        start_date = None
        end_date = datetime.now(timezone.utc)

        if date_range == "today":
            start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif date_range == "week":
            start_date = end_date - timedelta(days=7)
        elif date_range == "month":
            start_date = end_date - timedelta(days=30)

        sort_field = "completed_at" if sort_by == "date" else sort_by
        offset = (page - 1) * limit

        sessions, total = await self._session_repo.get_user_sessions(
            user_id=user_id,
            mode=session_mode,
            start_date=start_date,
            end_date=end_date if start_date else None,
            sort_by=sort_field,
            sort_order=sort_order,
            limit=limit,
            offset=offset,
        )

        return {
            "sessions": [
                {
                    "id": str(s.id),
                    "text_id": str(s.text_id),
                    "wpm": s.wpm,
                    "raw_wpm": s.raw_wpm,
                    "accuracy": s.accuracy,
                    "errors": s.errors,
                    "total_characters": s.total_characters,
                    "duration": s.duration,
                    "mode": s.mode.value,
                    "started_at": s.started_at.isoformat(),
                    "completed_at": s.completed_at.isoformat(),
                }
                for s in sessions
            ],
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit,
        }

"""
Typing session service.

Handles typing session creation and management with XP integration.
"""
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.application.services.xp_service import XPService
from app.domain.entities.progression import LevelInfo, XPGain
from app.domain.entities.typing_session import SessionMode, TypingSession, WpmDataPoint
from app.domain.exceptions import EntityNotFoundError
from app.domain.repositories.progression_repository import ProgressionRepository
from app.domain.repositories.session_repository import SessionRepository
from app.domain.repositories.text_repository import TextRepository
from app.domain.repositories.user_repository import UserRepository


class SessionService:
    """Service handling typing session operations with XP integration."""

    def __init__(
        self,
        session_repository: SessionRepository,
        user_repository: UserRepository,
        text_repository: TextRepository,
        progression_repository: ProgressionRepository | None = None,
    ):
        self._session_repo = session_repository
        self._user_repo = user_repository
        self._text_repo = text_repository
        self._progression_repo = progression_repository
        self._xp_service = XPService(progression_repository) if progression_repository else None

    async def create_session(
        self,
        user_id: str,
        text_id: str,
        text_content: str,
        wpm: int,
        raw_wpm: int,
        accuracy: float,
        errors: int,
        total_characters: int,
        correct_characters: int,
        duration: int,
        started_at: datetime,
        completed_at: datetime,
        mode: SessionMode,
        wpm_history: list[dict],
        max_combo: int = 0,
        difficulty: str = "medium",
    ) -> tuple[TypingSession, XPGain | None, LevelInfo | None, bool, int]:
        """
        Create a new typing session with XP calculation.

        Args:
            user_id: User's ID as string.
            text_id: Text ID that was typed.
            text_content: The actual text content.
            wpm: Final words per minute.
            raw_wpm: Raw WPM including errors.
            accuracy: Accuracy percentage.
            errors: Number of errors.
            total_characters: Total characters typed.
            correct_characters: Correctly typed characters.
            duration: Session duration in seconds.
            started_at: Session start time.
            completed_at: Session completion time.
            mode: Session mode.
            wpm_history: WPM history data points.
            max_combo: Maximum combo achieved.
            difficulty: Text difficulty level.

        Returns:
            Tuple of (session, xp_gain, level_info, leveled_up, new_streak).
        """
        uid = UUID(user_id) if isinstance(user_id, str) else user_id

        # Handle text_id - might be a UUID or a generated ID like "quote-123456"
        # For external quotes, we set text_id to None (nullable in DB)
        tid: UUID | None = None
        if isinstance(text_id, str):
            try:
                tid = UUID(text_id)
            except ValueError:
                # External quote - use None since we store text_content directly
                tid = None
        else:
            tid = text_id

        user = await self._user_repo.get_by_id(uid)
        if not user:
            raise EntityNotFoundError("User", str(uid))

        session = TypingSession(
            id=uuid4(),
            user_id=uid,
            text_id=tid,
            text_content=text_content,
            wpm=wpm,
            raw_wpm=raw_wpm,
            accuracy=accuracy,
            errors=errors,
            total_characters=total_characters,
            correct_characters=correct_characters,
            duration=duration,
            started_at=started_at,
            completed_at=completed_at,
            mode=mode,
            wpm_history=[
                WpmDataPoint(time=p["time"], wpm=p["wpm"], accuracy=p["accuracy"])
                for p in wpm_history
            ],
            max_combo=max_combo,
        )

        created_session = await self._session_repo.create(session)

        # Update user stats
        previous_best_wpm = user.stats.best_wpm
        user.update_stats(wpm, accuracy, duration, total_characters)
        await self._user_repo.update(user)

        # Calculate and award XP if progression system is available
        xp_gain = None
        level_info = None
        leveled_up = False
        new_streak = 0

        if self._xp_service:
            xp_gain, level_info, leveled_up, new_streak = await self._xp_service.award_session_xp(
                user_id=uid,
                wpm=wpm,
                accuracy=accuracy,
                total_characters=total_characters,
                difficulty=difficulty,
                mode=mode,
                previous_best_wpm=previous_best_wpm,
            )

            # Update session with XP earned
            created_session.xp_earned = xp_gain.total_xp

        return created_session, xp_gain, level_info, leveled_up, new_streak

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
        max_combo: int = 0,
        difficulty: str = "medium",
    ) -> tuple[TypingSession, XPGain | None, LevelInfo | None, bool, int]:
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
            max_combo: Maximum combo achieved.
            difficulty: Text difficulty level.

        Returns:
            Tuple of (session, xp_gain, level_info, leveled_up, new_streak).
        """
        now = datetime.now(UTC)

        return await self.create_session(
            user_id=str(user_id),
            text_id=str(text_id),
            text_content=text_content,
            wpm=wpm,
            raw_wpm=raw_wpm,
            accuracy=accuracy,
            errors=errors,
            total_characters=total_characters,
            correct_characters=correct_characters,
            duration=duration,
            started_at=datetime.fromtimestamp(now.timestamp() - duration, tz=UTC),
            completed_at=now,
            mode=SessionMode.SOLO,
            wpm_history=wpm_history,
            max_combo=max_combo,
            difficulty=difficulty,
        )

    async def get_session_by_id(self, session_id: str) -> TypingSession:
        """
        Get a session by ID.

        Args:
            session_id: Session ID as string.

        Returns:
            TypingSession if found.

        Raises:
            EntityNotFoundError: If session not found.
        """
        sid = UUID(session_id) if isinstance(session_id, str) else session_id
        session = await self._session_repo.get_by_id(sid)

        if not session:
            raise EntityNotFoundError("Session", str(sid))

        return session

    async def get_session_history(
        self,
        user_id: UUID,
        mode: str | None = None,
        date_range: str | None = None,
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
        end_date = datetime.now(UTC)

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
                    "max_combo": getattr(s, 'max_combo', 0),
                    "xp_earned": getattr(s, 'xp_earned', 0),
                }
                for s in sessions
            ],
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit,
        }

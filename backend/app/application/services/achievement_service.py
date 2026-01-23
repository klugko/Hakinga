"""
Achievement service.

Handles achievement tracking and unlocking.
"""
from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.domain.entities.achievement import Achievement, UserAchievement
from app.domain.repositories.achievement_repository import AchievementRepository


class AchievementService:
    """Service handling achievement operations."""

    def __init__(self, achievement_repository: AchievementRepository):
        self._achievement_repo = achievement_repository

    async def get_user_achievements(self, user_id: UUID) -> list[dict]:
        """
        Get all achievements with user's progress.

        Args:
            user_id: User's ID.

        Returns:
            List of achievements with progress info.
        """
        all_achievements = await self._achievement_repo.get_all_achievements()
        user_achievements = await self._achievement_repo.get_user_achievements(user_id)

        user_progress = {ua.achievement_id: ua for ua in user_achievements}

        result = []
        for achievement in all_achievements:
            user_ach = user_progress.get(achievement.id)

            result.append(
                {
                    "id": str(achievement.id),
                    "name": achievement.name,
                    "description": achievement.description,
                    "icon": achievement.icon,
                    "max_progress": achievement.max_progress,
                    "progress": user_ach.progress if user_ach else 0,
                    "unlocked_at": user_ach.unlocked_at.isoformat()
                    if user_ach and user_ach.unlocked_at
                    else None,
                }
            )

        return result

    async def check_and_update_achievements(
        self,
        user_id: UUID,
        wpm: int,
        accuracy: float,
        total_sessions: int,
        total_time: int,
    ) -> list[dict]:
        """
        Check and update achievement progress after a session.

        Args:
            user_id: User's ID.
            wpm: Session WPM.
            accuracy: Session accuracy.
            total_sessions: User's total session count.
            total_time: User's total time typed.

        Returns:
            List of newly unlocked achievements.
        """
        all_achievements = await self._achievement_repo.get_all_achievements()
        unlocked = []

        achievement_checks = {
            "First Steps": (total_sessions >= 1, 1, 1),
            "Speed Demon": (wpm >= 80, None, None),
            "Perfectionist": (accuracy >= 100, None, None),
            "Century Club": (wpm >= 100, wpm, 100),
            "Marathon Runner": (total_time >= 3600, total_time, 3600),
            "Dedicated": (total_sessions >= 10, total_sessions, 10),
        }

        for achievement in all_achievements:
            if achievement.name not in achievement_checks:
                continue

            condition, progress_value, max_progress = achievement_checks[achievement.name]

            user_ach = await self._achievement_repo.get_user_achievement(user_id, achievement.id)

            if user_ach and user_ach.is_unlocked:
                continue

            if not user_ach:
                user_ach = UserAchievement(
                    id=uuid4(),
                    user_id=user_id,
                    achievement_id=achievement.id,
                    progress=0,
                )
                user_ach = await self._achievement_repo.create_user_achievement(user_ach)

            if progress_value is not None:
                user_ach.progress = progress_value

            if condition:
                if achievement.max_progress:
                    was_unlocked = user_ach.update_progress(
                        progress_value or 0, achievement.max_progress
                    )
                else:
                    user_ach.unlocked_at = datetime.now(timezone.utc)
                    was_unlocked = True

                await self._achievement_repo.update_user_achievement(user_ach)

                if was_unlocked or (not achievement.max_progress and user_ach.unlocked_at):
                    unlocked.append(
                        {
                            "id": str(achievement.id),
                            "name": achievement.name,
                            "description": achievement.description,
                            "icon": achievement.icon,
                        }
                    )
            elif progress_value is not None:
                await self._achievement_repo.update_user_achievement(user_ach)

        return unlocked

"""
Achievement repository PostgreSQL implementation.
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.achievement import Achievement, UserAchievement
from app.domain.repositories.achievement_repository import AchievementRepository
from app.infrastructure.database.models import AchievementModel, UserAchievementModel


class PostgresAchievementRepository(AchievementRepository):
    """PostgreSQL implementation of AchievementRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _achievement_to_entity(self, model: AchievementModel) -> Achievement:
        """Convert achievement model to entity."""
        return Achievement(
            id=model.id,
            name=model.name,
            description=model.description,
            icon=model.icon,
            max_progress=model.max_progress,
            is_active=model.is_active,
        )

    def _user_achievement_to_entity(self, model: UserAchievementModel) -> UserAchievement:
        """Convert user achievement model to entity."""
        return UserAchievement(
            id=model.id,
            user_id=model.user_id,
            achievement_id=model.achievement_id,
            progress=model.progress,
            unlocked_at=model.unlocked_at,
        )

    async def get_all_achievements(self) -> list[Achievement]:
        result = await self._session.execute(
            select(AchievementModel).where(AchievementModel.is_active.is_(True))
        )
        return [self._achievement_to_entity(model) for model in result.scalars().all()]

    async def get_achievement_by_id(self, achievement_id: UUID) -> Optional[Achievement]:
        result = await self._session.execute(
            select(AchievementModel).where(AchievementModel.id == achievement_id)
        )
        model = result.scalar_one_or_none()
        return self._achievement_to_entity(model) if model else None

    async def get_user_achievements(self, user_id: UUID) -> list[UserAchievement]:
        result = await self._session.execute(
            select(UserAchievementModel).where(UserAchievementModel.user_id == user_id)
        )
        return [self._user_achievement_to_entity(model) for model in result.scalars().all()]

    async def get_user_achievement(
        self,
        user_id: UUID,
        achievement_id: UUID,
    ) -> Optional[UserAchievement]:
        result = await self._session.execute(
            select(UserAchievementModel)
            .where(UserAchievementModel.user_id == user_id)
            .where(UserAchievementModel.achievement_id == achievement_id)
        )
        model = result.scalar_one_or_none()
        return self._user_achievement_to_entity(model) if model else None

    async def create_user_achievement(
        self,
        user_achievement: UserAchievement,
    ) -> UserAchievement:
        model = UserAchievementModel(
            id=user_achievement.id,
            user_id=user_achievement.user_id,
            achievement_id=user_achievement.achievement_id,
            progress=user_achievement.progress,
            unlocked_at=user_achievement.unlocked_at,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._user_achievement_to_entity(model)

    async def update_user_achievement(
        self,
        user_achievement: UserAchievement,
    ) -> UserAchievement:
        result = await self._session.execute(
            select(UserAchievementModel).where(UserAchievementModel.id == user_achievement.id)
        )
        model = result.scalar_one()
        model.progress = user_achievement.progress
        model.unlocked_at = user_achievement.unlocked_at
        await self._session.commit()
        await self._session.refresh(model)
        return self._user_achievement_to_entity(model)

    async def create_achievement(self, achievement: Achievement) -> Achievement:
        model = AchievementModel(
            id=achievement.id,
            name=achievement.name,
            description=achievement.description,
            icon=achievement.icon,
            max_progress=achievement.max_progress,
            is_active=achievement.is_active,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._achievement_to_entity(model)

"""
User progression repository PostgreSQL implementation.
"""
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.progression import RankTier, UserProgress
from app.domain.repositories.progression_repository import ProgressionRepository
from app.infrastructure.database.models import UserModel, UserProgressModel


class PostgresProgressionRepository(ProgressionRepository):
    """PostgreSQL implementation of ProgressionRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: UserProgressModel) -> UserProgress:
        """Convert database model to domain entity."""
        return UserProgress(
            id=model.id,
            user_id=model.user_id,
            total_xp=model.total_xp,
            current_level=model.current_level,
            current_streak=model.current_streak,
            best_streak=model.best_streak,
            last_session_date=model.last_session_date,
            rank_tier=model.rank_tier,
            mmr=model.mmr,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: UserProgress) -> UserProgressModel:
        """Convert domain entity to database model."""
        return UserProgressModel(
            id=entity.id,
            user_id=entity.user_id,
            total_xp=entity.total_xp,
            current_level=entity.current_level,
            current_streak=entity.current_streak,
            best_streak=entity.best_streak,
            last_session_date=entity.last_session_date,
            rank_tier=entity.rank_tier,
            mmr=entity.mmr,
        )

    async def create(self, progress: UserProgress) -> UserProgress:
        model = self._to_model(progress)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, progress_id: UUID) -> UserProgress | None:
        result = await self._session.execute(
            select(UserProgressModel).where(UserProgressModel.id == progress_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_user_id(self, user_id: UUID) -> UserProgress | None:
        result = await self._session.execute(
            select(UserProgressModel).where(UserProgressModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, progress: UserProgress) -> UserProgress:
        result = await self._session.execute(
            select(UserProgressModel).where(UserProgressModel.id == progress.id)
        )
        model = result.scalar_one_or_none()

        if model:
            model.total_xp = progress.total_xp
            model.current_level = progress.current_level
            model.current_streak = progress.current_streak
            model.best_streak = progress.best_streak
            model.last_session_date = progress.last_session_date
            model.rank_tier = progress.rank_tier
            model.mmr = progress.mmr

            await self._session.commit()
            await self._session.refresh(model)
            return self._to_entity(model)

        return progress

    async def get_top_by_xp(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict]:
        result = await self._session.execute(
            select(
                UserProgressModel.user_id,
                UserProgressModel.total_xp,
                UserProgressModel.current_level,
                UserProgressModel.current_streak,
                UserProgressModel.rank_tier,
                UserModel.username,
                UserModel.avatar,
            )
            .join(UserModel, UserProgressModel.user_id == UserModel.id)
            .order_by(UserProgressModel.total_xp.desc())
            .offset(offset)
            .limit(limit)
        )

        rows = result.all()
        return [
            {
                "rank": offset + idx + 1,
                "user_id": str(row.user_id),
                "username": row.username,
                "avatar": row.avatar,
                "total_xp": row.total_xp,
                "level": row.current_level,
                "streak": row.current_streak,
                "rank_tier": row.rank_tier.value,
            }
            for idx, row in enumerate(rows)
        ]

    async def get_user_xp_rank(self, user_id: UUID) -> int:
        # Get user's XP
        user_result = await self._session.execute(
            select(UserProgressModel.total_xp).where(UserProgressModel.user_id == user_id)
        )
        user_xp = user_result.scalar_one_or_none()

        if user_xp is None:
            return 0

        # Count users with more XP
        count_result = await self._session.execute(
            select(func.count(UserProgressModel.id)).where(
                UserProgressModel.total_xp > user_xp
            )
        )
        higher_count = count_result.scalar() or 0

        return higher_count + 1

    async def get_top_by_mmr(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict]:
        result = await self._session.execute(
            select(
                UserProgressModel.user_id,
                UserProgressModel.mmr,
                UserProgressModel.rank_tier,
                UserProgressModel.current_level,
                UserModel.username,
                UserModel.avatar,
            )
            .join(UserModel, UserProgressModel.user_id == UserModel.id)
            .where(UserProgressModel.rank_tier != RankTier.UNRANKED)
            .order_by(UserProgressModel.mmr.desc())
            .offset(offset)
            .limit(limit)
        )

        rows = result.all()
        return [
            {
                "rank": offset + idx + 1,
                "user_id": str(row.user_id),
                "username": row.username,
                "avatar": row.avatar,
                "mmr": row.mmr,
                "rank_tier": row.rank_tier.value,
                "level": row.current_level,
            }
            for idx, row in enumerate(rows)
        ]

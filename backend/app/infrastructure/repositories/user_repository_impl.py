"""
User repository PostgreSQL implementation.
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User, UserStats
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.database.models import UserModel


class PostgresUserRepository(UserRepository):
    """PostgreSQL implementation of UserRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: UserModel) -> User:
        """Convert database model to domain entity."""
        return User(
            id=model.id,
            username=model.username,
            email=model.email,
            password_hash=model.password_hash,
            avatar=model.avatar,
            is_active=model.is_active,
            is_verified=model.is_verified,
            created_at=model.created_at,
            updated_at=model.updated_at,
            stats=UserStats(
                avg_wpm=model.avg_wpm,
                avg_accuracy=model.avg_accuracy,
                best_wpm=model.best_wpm,
                total_sessions=model.total_sessions,
                total_time_typed=model.total_time_typed,
                total_characters_typed=model.total_characters_typed,
            ),
        )

    def _to_model(self, entity: User) -> UserModel:
        """Convert domain entity to database model."""
        return UserModel(
            id=entity.id,
            username=entity.username,
            email=entity.email,
            password_hash=entity.password_hash,
            avatar=entity.avatar,
            is_active=entity.is_active,
            is_verified=entity.is_verified,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            avg_wpm=entity.stats.avg_wpm,
            avg_accuracy=entity.stats.avg_accuracy,
            best_wpm=entity.stats.best_wpm,
            total_sessions=entity.stats.total_sessions,
            total_time_typed=entity.stats.total_time_typed,
            total_characters_typed=entity.stats.total_characters_typed,
        )

    async def create(self, user: User) -> User:
        model = self._to_model(user)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self._session.execute(select(UserModel).where(UserModel.id == user_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self._session.execute(
            select(UserModel).where(UserModel.email == email.lower())
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self._session.execute(
            select(UserModel).where(UserModel.username == username)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, user: User) -> User:
        result = await self._session.execute(select(UserModel).where(UserModel.id == user.id))
        model = result.scalar_one()

        model.username = user.username
        model.email = user.email
        model.password_hash = user.password_hash
        model.avatar = user.avatar
        model.is_active = user.is_active
        model.is_verified = user.is_verified
        model.avg_wpm = user.stats.avg_wpm
        model.avg_accuracy = user.stats.avg_accuracy
        model.best_wpm = user.stats.best_wpm
        model.total_sessions = user.stats.total_sessions
        model.total_time_typed = user.stats.total_time_typed
        model.total_characters_typed = user.stats.total_characters_typed

        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, user_id: UUID) -> bool:
        result = await self._session.execute(select(UserModel).where(UserModel.id == user_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()
            return True
        return False

    async def search_by_username(self, query: str, limit: int = 10) -> list[User]:
        result = await self._session.execute(
            select(UserModel)
            .where(UserModel.username.ilike(f"{query}%"))
            .where(UserModel.is_active.is_(True))
            .limit(limit)
        )
        return [self._to_entity(model) for model in result.scalars().all()]

    async def exists_by_email(self, email: str) -> bool:
        result = await self._session.execute(
            select(UserModel.id).where(UserModel.email == email.lower())
        )
        return result.scalar_one_or_none() is not None

    async def exists_by_username(self, username: str) -> bool:
        result = await self._session.execute(
            select(UserModel.id).where(UserModel.username == username)
        )
        return result.scalar_one_or_none() is not None

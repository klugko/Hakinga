"""
User settings repository PostgreSQL implementation.
"""
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.settings import UserSettings
from app.domain.repositories.settings_repository import SettingsRepository
from app.infrastructure.database.models import UserSettingsModel


class PostgresSettingsRepository(SettingsRepository):
    """PostgreSQL implementation of SettingsRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: UserSettingsModel) -> UserSettings:
        """Convert model to entity."""
        return UserSettings(
            id=model.id,
            user_id=model.user_id,
            sound_effects=model.sound_effects,
            notifications=model.notifications,
            show_wpm_live=model.show_wpm_live,
            show_accuracy_live=model.show_accuracy_live,
            theme=model.theme,
            keyboard_layout=model.keyboard_layout,
        )

    async def get_by_user_id(self, user_id: UUID) -> Optional[UserSettings]:
        result = await self._session.execute(
            select(UserSettingsModel).where(UserSettingsModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, settings: UserSettings) -> UserSettings:
        model = UserSettingsModel(
            id=settings.id,
            user_id=settings.user_id,
            sound_effects=settings.sound_effects,
            notifications=settings.notifications,
            show_wpm_live=settings.show_wpm_live,
            show_accuracy_live=settings.show_accuracy_live,
            theme=settings.theme,
            keyboard_layout=settings.keyboard_layout,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, settings: UserSettings) -> UserSettings:
        result = await self._session.execute(
            select(UserSettingsModel).where(UserSettingsModel.id == settings.id)
        )
        model = result.scalar_one()
        model.sound_effects = settings.sound_effects
        model.notifications = settings.notifications
        model.show_wpm_live = settings.show_wpm_live
        model.show_accuracy_live = settings.show_accuracy_live
        model.theme = settings.theme
        model.keyboard_layout = settings.keyboard_layout
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def create_default(self, user_id: UUID) -> UserSettings:
        settings = UserSettings(id=uuid4(), user_id=user_id)
        return await self.create(settings)

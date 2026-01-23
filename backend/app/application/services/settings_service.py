"""
Settings service.

Handles user settings management.
"""
from typing import Optional
from uuid import UUID

from app.domain.entities.settings import UserSettings
from app.domain.repositories.settings_repository import SettingsRepository


class SettingsService:
    """Service handling user settings operations."""

    def __init__(self, settings_repository: SettingsRepository):
        self._settings_repo = settings_repository

    async def get_user_settings(self, user_id: UUID) -> UserSettings:
        """
        Get settings for a user, creating defaults if needed.

        Args:
            user_id: User's ID.

        Returns:
            User's settings.
        """
        settings = await self._settings_repo.get_by_user_id(user_id)

        if not settings:
            settings = await self._settings_repo.create_default(user_id)

        return settings

    async def update_settings(
        self,
        user_id: UUID,
        sound_effects: Optional[bool] = None,
        notifications: Optional[bool] = None,
        show_wpm_live: Optional[bool] = None,
        show_accuracy_live: Optional[bool] = None,
        theme: Optional[str] = None,
        keyboard_layout: Optional[str] = None,
    ) -> UserSettings:
        """
        Update user settings.

        Args:
            user_id: User's ID.
            sound_effects: Enable/disable sound effects.
            notifications: Enable/disable notifications.
            show_wpm_live: Show live WPM.
            show_accuracy_live: Show live accuracy.
            theme: UI theme.
            keyboard_layout: Keyboard layout.

        Returns:
            Updated settings.
        """
        settings = await self.get_user_settings(user_id)

        if sound_effects is not None:
            settings.sound_effects = sound_effects
        if notifications is not None:
            settings.notifications = notifications
        if show_wpm_live is not None:
            settings.show_wpm_live = show_wpm_live
        if show_accuracy_live is not None:
            settings.show_accuracy_live = show_accuracy_live
        if theme is not None:
            settings.theme = theme
        if keyboard_layout is not None:
            settings.keyboard_layout = keyboard_layout

        return await self._settings_repo.update(settings)

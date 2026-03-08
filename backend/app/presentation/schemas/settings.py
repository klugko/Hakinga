"""
Settings schemas.
"""

from pydantic import BaseModel


class SettingsResponse(BaseModel):
    """User settings response."""

    sound_effects: bool
    notifications: bool
    show_wpm_live: bool
    show_accuracy_live: bool
    theme: str
    keyboard_layout: str


class UpdateSettingsRequest(BaseModel):
    """Update settings request."""

    sound_effects: bool | None = None
    notifications: bool | None = None
    show_wpm_live: bool | None = None
    show_accuracy_live: bool | None = None
    theme: str | None = None
    keyboard_layout: str | None = None

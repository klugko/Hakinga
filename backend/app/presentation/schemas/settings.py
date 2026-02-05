"""
Settings schemas.
"""
from typing import Optional

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

    sound_effects: Optional[bool] = None
    notifications: Optional[bool] = None
    show_wpm_live: Optional[bool] = None
    show_accuracy_live: Optional[bool] = None
    theme: Optional[str] = None
    keyboard_layout: Optional[str] = None

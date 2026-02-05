"""
User settings domain entity.
"""
from dataclasses import dataclass
from uuid import UUID


@dataclass
class UserSettings:
    """
    User settings domain entity.

    Contains user preferences for the application.
    """

    id: UUID
    user_id: UUID
    sound_effects: bool = True
    notifications: bool = True
    show_wpm_live: bool = True
    show_accuracy_live: bool = True
    theme: str = "dark"
    keyboard_layout: str = "qwerty"

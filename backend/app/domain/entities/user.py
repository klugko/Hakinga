"""
User domain entity.
"""
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID


@dataclass
class UserStats:
    """User typing statistics value object."""

    avg_wpm: float = 0.0
    avg_accuracy: float = 100.0
    best_wpm: int = 0
    total_sessions: int = 0
    total_time_typed: int = 0
    total_characters_typed: int = 0


@dataclass
class User:
    """
    User domain entity representing a registered user.

    Contains user identity, profile information, and typing statistics.
    """

    id: UUID
    username: str
    email: str
    password_hash: str
    created_at: datetime
    updated_at: datetime
    avatar: str | None = None
    is_active: bool = True
    is_verified: bool = False
    stats: UserStats = field(default_factory=UserStats)

    def update_stats(
        self,
        wpm: int,
        accuracy: float,
        duration: int,
        characters: int,
    ) -> None:
        """
        Update user statistics after a completed session.

        Args:
            wpm: Words per minute achieved.
            accuracy: Accuracy percentage.
            duration: Session duration in seconds.
            characters: Total characters typed.
        """
        total = self.stats.total_sessions
        if total == 0:
            self.stats.avg_wpm = float(wpm)
            self.stats.avg_accuracy = accuracy
        else:
            self.stats.avg_wpm = (self.stats.avg_wpm * total + wpm) / (total + 1)
            self.stats.avg_accuracy = (self.stats.avg_accuracy * total + accuracy) / (total + 1)

        if wpm > self.stats.best_wpm:
            self.stats.best_wpm = wpm

        self.stats.total_sessions += 1
        self.stats.total_time_typed += duration
        self.stats.total_characters_typed += characters

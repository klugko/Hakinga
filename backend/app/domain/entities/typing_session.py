"""
Typing session domain entity.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID


class SessionMode(str, Enum):
    """Session mode enumeration."""

    SOLO = "solo"
    PRIVATE = "private"
    COMPETITION = "competition"


@dataclass
class WpmDataPoint:
    """WPM data point for session history tracking."""

    time: int
    wpm: int
    accuracy: float


@dataclass
class TypingSession:
    """
    Typing session domain entity.

    Represents a completed typing practice session with all metrics.
    """

    id: UUID
    user_id: UUID
    text_id: UUID
    text_content: str
    wpm: int
    raw_wpm: int
    accuracy: float
    errors: int
    total_characters: int
    correct_characters: int
    duration: int
    started_at: datetime
    completed_at: datetime
    mode: SessionMode
    wpm_history: List[WpmDataPoint] = field(default_factory=list)
    private_session_id: Optional[UUID] = None
    competition_id: Optional[UUID] = None

    @property
    def characters_per_minute(self) -> int:
        """Calculate characters per minute."""
        if self.duration == 0:
            return 0
        return round(self.total_characters / self.duration * 60)

    @property
    def consistency(self) -> float:
        """Calculate typing consistency based on WPM variance."""
        if len(self.wpm_history) < 2:
            return 100.0

        wpm_values = [point.wpm for point in self.wpm_history]
        max_wpm = max(wpm_values)
        min_wpm = min(wpm_values)

        if self.wpm == 0:
            return 100.0

        variance_ratio = (max_wpm - min_wpm) / self.wpm
        return max(0.0, round((1 - variance_ratio) * 100, 1))

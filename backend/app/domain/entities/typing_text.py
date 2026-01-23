"""
Typing text domain entity.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional
from uuid import UUID


class Difficulty(str, Enum):
    """Text difficulty level."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class TextLength(str, Enum):
    """Text length category."""

    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"


@dataclass
class TypingText:
    """
    Typing text domain entity.

    Represents a text used for typing practice sessions.
    """

    id: UUID
    content: str
    difficulty: Difficulty
    length: TextLength
    word_count: int
    category: Optional[str] = None
    author: Optional[str] = None
    is_active: bool = True

    @classmethod
    def calculate_difficulty(cls, text: str) -> Difficulty:
        """
        Calculate difficulty based on text complexity.

        Args:
            text: The text content to analyze.

        Returns:
            Calculated difficulty level.
        """
        words = text.split()
        if not words:
            return Difficulty.EASY

        avg_word_length = sum(len(word) for word in words) / len(words)
        special_chars = sum(1 for c in text if not c.isalnum() and not c.isspace())
        special_density = special_chars / len(text) if text else 0

        if avg_word_length < 4.5 and special_density < 0.05:
            return Difficulty.EASY
        elif avg_word_length > 6 or special_density > 0.1:
            return Difficulty.HARD
        return Difficulty.MEDIUM

    @classmethod
    def calculate_length(cls, word_count: int) -> TextLength:
        """
        Calculate length category based on word count.

        Args:
            word_count: Number of words in text.

        Returns:
            Length category.
        """
        if word_count < 30:
            return TextLength.SHORT
        elif word_count < 80:
            return TextLength.MEDIUM
        return TextLength.LONG

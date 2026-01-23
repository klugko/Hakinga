"""
Typing text repository interface.
"""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.typing_text import Difficulty, TextLength, TypingText


class TextRepository(ABC):
    """
    Abstract repository interface for TypingText persistence.
    """

    @abstractmethod
    async def create(self, text: TypingText) -> TypingText:
        """
        Create a new typing text.

        Args:
            text: Text entity to persist.

        Returns:
            Created text with generated ID.
        """
        ...

    @abstractmethod
    async def get_by_id(self, text_id: UUID) -> Optional[TypingText]:
        """
        Get a text by ID.

        Args:
            text_id: Unique text identifier.

        Returns:
            Text if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_random(
        self,
        difficulty: Optional[Difficulty] = None,
        length: Optional[TextLength] = None,
    ) -> Optional[TypingText]:
        """
        Get a random active text with optional filters.

        Args:
            difficulty: Optional difficulty filter.
            length: Optional length filter.

        Returns:
            Random text matching criteria, or None if none found.
        """
        ...

    @abstractmethod
    async def get_all(
        self,
        difficulty: Optional[Difficulty] = None,
        length: Optional[TextLength] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[TypingText], int]:
        """
        Get paginated texts with filters.

        Args:
            difficulty: Optional difficulty filter.
            length: Optional length filter.
            limit: Maximum results.
            offset: Results to skip.

        Returns:
            Tuple of (texts list, total count).
        """
        ...

    @abstractmethod
    async def update(self, text: TypingText) -> TypingText:
        """Update a text."""
        ...

    @abstractmethod
    async def delete(self, text_id: UUID) -> bool:
        """Delete a text (soft delete by setting is_active=False)."""
        ...

    @abstractmethod
    async def bulk_create(self, texts: list[TypingText]) -> list[TypingText]:
        """Create multiple texts at once."""
        ...

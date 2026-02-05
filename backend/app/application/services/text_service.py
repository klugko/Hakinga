"""
Typing text service.

Handles text retrieval and management.
"""
from typing import Optional
from uuid import UUID

from app.domain.entities.typing_text import Difficulty, TextLength, TypingText
from app.domain.exceptions import EntityNotFoundError
from app.domain.repositories.text_repository import TextRepository


class TextService:
    """Service handling typing text operations."""

    def __init__(self, text_repository: TextRepository):
        self._text_repo = text_repository

    async def get_random_text(
        self,
        difficulty: Optional[str] = None,
        length: Optional[str] = None,
    ) -> TypingText:
        """
        Get a random text with optional filters.

        Args:
            difficulty: Optional difficulty filter.
            length: Optional length filter.

        Returns:
            Random typing text.

        Raises:
            EntityNotFoundError: If no matching text found.
        """
        diff = Difficulty(difficulty) if difficulty else None
        len_ = TextLength(length) if length else None

        text = await self._text_repo.get_random(difficulty=diff, length=len_)

        if not text:
            raise EntityNotFoundError("TypingText", f"{difficulty}/{length}")

        return text

    async def get_text_by_id(self, text_id: UUID) -> TypingText:
        """
        Get a specific text by ID.

        Args:
            text_id: Text's unique identifier.

        Returns:
            Typing text.

        Raises:
            EntityNotFoundError: If text not found.
        """
        text = await self._text_repo.get_by_id(text_id)
        if not text:
            raise EntityNotFoundError("TypingText", str(text_id))
        return text

    async def list_texts(
        self,
        difficulty: Optional[str] = None,
        length: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> dict:
        """
        List texts with pagination and filters.

        Args:
            difficulty: Optional difficulty filter.
            length: Optional length filter.
            page: Page number.
            limit: Results per page.

        Returns:
            Dictionary with texts and pagination info.
        """
        diff = Difficulty(difficulty) if difficulty else None
        len_ = TextLength(length) if length else None
        offset = (page - 1) * limit

        texts, total = await self._text_repo.get_all(
            difficulty=diff,
            length=len_,
            limit=limit,
            offset=offset,
        )

        return {
            "texts": [
                {
                    "id": str(t.id),
                    "content": t.content,
                    "difficulty": t.difficulty.value,
                    "length": t.length.value,
                    "word_count": t.word_count,
                    "category": t.category,
                    "author": t.author,
                }
                for t in texts
            ],
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit,
        }

"""
Typing text schemas.
"""

from pydantic import BaseModel


class TypingTextResponse(BaseModel):
    """Typing text response."""

    id: str
    content: str
    difficulty: str
    length: str
    word_count: int
    category: str | None = None
    author: str | None = None


class TextListResponse(BaseModel):
    """Text list paginated response."""

    texts: list[TypingTextResponse]
    total: int
    page: int
    pages: int

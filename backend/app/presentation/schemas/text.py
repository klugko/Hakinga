"""
Typing text schemas.
"""
from typing import Optional

from pydantic import BaseModel


class TypingTextResponse(BaseModel):
    """Typing text response."""

    id: str
    content: str
    difficulty: str
    length: str
    word_count: int
    category: Optional[str] = None
    author: Optional[str] = None


class TextListResponse(BaseModel):
    """Text list paginated response."""

    texts: list[TypingTextResponse]
    total: int
    page: int
    pages: int

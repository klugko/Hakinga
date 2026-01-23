"""
Common Pydantic schemas used across the API.
"""
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""

    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None
    code: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""

    items: list[T]
    total: int
    page: int
    pages: int


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str

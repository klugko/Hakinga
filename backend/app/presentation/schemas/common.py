"""
Common Pydantic schemas used across the API.
"""
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""

    success: bool = True
    data: T | None = None
    error: str | None = None
    code: str | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""

    items: list[T]
    total: int
    page: int
    pages: int


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str

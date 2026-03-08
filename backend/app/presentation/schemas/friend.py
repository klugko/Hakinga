"""
Friend schemas.
"""

from pydantic import BaseModel


class FriendRequestCreate(BaseModel):
    """Create friend request."""

    username: str


class FriendRequestResponse(BaseModel):
    """Friend request response."""

    id: str
    from_user: dict
    status: str
    created_at: str


class FriendResponse(BaseModel):
    """Friend response."""

    id: str
    username: str
    avatar: str | None = None
    status: str
    last_seen: str | None = None
    stats: dict

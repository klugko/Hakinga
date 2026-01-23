"""
Friend and friendship domain entities.
"""
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID


class FriendRequestStatus(str, Enum):
    """Friend request status."""

    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class UserStatus(str, Enum):
    """User online status."""

    ONLINE = "online"
    OFFLINE = "offline"
    IN_GAME = "in-game"


@dataclass
class FriendRequest:
    """
    Friend request domain entity.

    Represents a pending, accepted, or rejected friend request.
    """

    id: UUID
    from_user_id: UUID
    to_user_id: UUID
    status: FriendRequestStatus
    created_at: datetime
    responded_at: Optional[datetime] = None

    def accept(self) -> None:
        """Accept the friend request."""
        self.status = FriendRequestStatus.ACCEPTED
        self.responded_at = datetime.utcnow()

    def reject(self) -> None:
        """Reject the friend request."""
        self.status = FriendRequestStatus.REJECTED
        self.responded_at = datetime.utcnow()


@dataclass
class Friendship:
    """
    Friendship domain entity.

    Represents an established friendship between two users.
    """

    id: UUID
    user_id: UUID
    friend_id: UUID
    created_at: datetime

"""
Friend and friendship repository interface.
"""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.friend import FriendRequest, FriendRequestStatus, Friendship


class FriendRepository(ABC):
    """
    Abstract repository interface for Friend persistence.
    """

    @abstractmethod
    async def create_friend_request(self, request: FriendRequest) -> FriendRequest:
        """Create a new friend request."""
        ...

    @abstractmethod
    async def get_friend_request_by_id(self, request_id: UUID) -> Optional[FriendRequest]:
        """Get a friend request by ID."""
        ...

    @abstractmethod
    async def get_pending_requests_for_user(self, user_id: UUID) -> list[FriendRequest]:
        """Get all pending friend requests sent to a user."""
        ...

    @abstractmethod
    async def get_pending_request_between_users(
        self,
        from_user_id: UUID,
        to_user_id: UUID,
    ) -> Optional[FriendRequest]:
        """Get pending request between two specific users."""
        ...

    @abstractmethod
    async def update_friend_request(self, request: FriendRequest) -> FriendRequest:
        """Update a friend request (accept/reject)."""
        ...

    @abstractmethod
    async def create_friendship(self, friendship: Friendship) -> Friendship:
        """Create a new friendship."""
        ...

    @abstractmethod
    async def get_user_friends(self, user_id: UUID) -> list[UUID]:
        """
        Get all friend user IDs for a user.

        Args:
            user_id: User's ID.

        Returns:
            List of friend user IDs.
        """
        ...

    @abstractmethod
    async def are_friends(self, user_id_1: UUID, user_id_2: UUID) -> bool:
        """Check if two users are friends."""
        ...

    @abstractmethod
    async def delete_friendship(self, user_id: UUID, friend_id: UUID) -> bool:
        """Delete a friendship between two users."""
        ...

    @abstractmethod
    async def get_sent_requests(
        self,
        user_id: UUID,
        status: Optional[FriendRequestStatus] = None,
    ) -> list[FriendRequest]:
        """Get friend requests sent by a user."""
        ...

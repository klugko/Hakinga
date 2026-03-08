"""
Friend service.

Handles friend requests and friendships.
"""
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.domain.entities.friend import FriendRequest, FriendRequestStatus, Friendship
from app.domain.exceptions import EntityNotFoundError, FriendRequestError, ValidationError
from app.domain.repositories.friend_repository import FriendRepository
from app.domain.repositories.user_repository import UserRepository


class FriendService:
    """Service handling friend operations."""

    def __init__(
        self,
        friend_repository: FriendRepository,
        user_repository: UserRepository,
    ):
        self._friend_repo = friend_repository
        self._user_repo = user_repository

    async def send_friend_request(
        self,
        from_user_id: UUID,
        to_username: str,
    ) -> FriendRequest:
        """
        Send a friend request to another user.

        Args:
            from_user_id: Requesting user's ID.
            to_username: Target user's username.

        Returns:
            Created friend request.

        Raises:
            EntityNotFoundError: If target user not found.
            FriendRequestError: If request already exists or users are already friends.
        """
        to_user = await self._user_repo.get_by_username(to_username)
        if not to_user:
            raise EntityNotFoundError("User", to_username)

        if to_user.id == from_user_id:
            raise ValidationError("Cannot send friend request to yourself")

        if await self._friend_repo.are_friends(from_user_id, to_user.id):
            raise FriendRequestError("Already friends with this user")

        existing = await self._friend_repo.get_pending_request_between_users(
            from_user_id, to_user.id
        )
        if existing:
            raise FriendRequestError("Friend request already sent")

        reverse = await self._friend_repo.get_pending_request_between_users(
            to_user.id, from_user_id
        )
        if reverse:
            raise FriendRequestError("This user has already sent you a friend request")

        request = FriendRequest(
            id=uuid4(),
            from_user_id=from_user_id,
            to_user_id=to_user.id,
            status=FriendRequestStatus.PENDING,
            created_at=datetime.now(UTC),
        )

        return await self._friend_repo.create_friend_request(request)

    async def accept_friend_request(
        self,
        request_id: UUID,
        user_id: UUID,
    ) -> Friendship:
        """
        Accept a friend request.

        Args:
            request_id: Friend request ID.
            user_id: User accepting the request.

        Returns:
            Created friendship.

        Raises:
            EntityNotFoundError: If request not found.
            FriendRequestError: If user is not the recipient.
        """
        request = await self._friend_repo.get_friend_request_by_id(request_id)
        if not request:
            raise EntityNotFoundError("FriendRequest", str(request_id))

        if request.to_user_id != user_id:
            raise FriendRequestError("Cannot accept this friend request")

        if request.status != FriendRequestStatus.PENDING:
            raise FriendRequestError("Friend request is no longer pending")

        request.accept()
        await self._friend_repo.update_friend_request(request)

        friendship = Friendship(
            id=uuid4(),
            user_id=request.from_user_id,
            friend_id=request.to_user_id,
            created_at=datetime.now(UTC),
        )

        return await self._friend_repo.create_friendship(friendship)

    async def reject_friend_request(
        self,
        request_id: UUID,
        user_id: UUID,
    ) -> FriendRequest:
        """
        Reject a friend request.

        Args:
            request_id: Friend request ID.
            user_id: User rejecting the request.

        Returns:
            Updated friend request.
        """
        request = await self._friend_repo.get_friend_request_by_id(request_id)
        if not request:
            raise EntityNotFoundError("FriendRequest", str(request_id))

        if request.to_user_id != user_id:
            raise FriendRequestError("Cannot reject this friend request")

        request.reject()
        return await self._friend_repo.update_friend_request(request)

    async def get_pending_requests(self, user_id: UUID) -> list[dict]:
        """
        Get pending friend requests for a user.

        Args:
            user_id: User's ID.

        Returns:
            List of pending requests with sender info.
        """
        requests = await self._friend_repo.get_pending_requests_for_user(user_id)

        result = []
        for req in requests:
            from_user = await self._user_repo.get_by_id(req.from_user_id)
            if from_user:
                result.append(
                    {
                        "id": str(req.id),
                        "from": {
                            "id": str(from_user.id),
                            "username": from_user.username,
                            "avatar": from_user.avatar,
                        },
                        "status": req.status.value,
                        "created_at": req.created_at.isoformat(),
                    }
                )

        return result

    async def get_friends_list(self, user_id: UUID) -> list[dict]:
        """
        Get user's friends list with their info.

        Args:
            user_id: User's ID.

        Returns:
            List of friends with their details.
        """
        friend_ids = await self._friend_repo.get_user_friends(user_id)

        friends = []
        for friend_id in friend_ids:
            user = await self._user_repo.get_by_id(friend_id)
            if user:
                friends.append(
                    {
                        "id": str(user.id),
                        "username": user.username,
                        "avatar": user.avatar,
                        "status": "offline",
                        "stats": {
                            "avg_wpm": user.stats.avg_wpm,
                            "total_sessions": user.stats.total_sessions,
                        },
                    }
                )

        return friends

    async def remove_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        """
        Remove a friend.

        Args:
            user_id: User's ID.
            friend_id: Friend's user ID.

        Returns:
            True if friendship was removed.
        """
        return await self._friend_repo.delete_friendship(user_id, friend_id)

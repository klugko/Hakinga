"""
Friend repository PostgreSQL implementation.
"""
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.friend import FriendRequest, FriendRequestStatus, Friendship
from app.domain.repositories.friend_repository import FriendRepository
from app.infrastructure.database.models import FriendRequestModel, FriendshipModel


class PostgresFriendRepository(FriendRepository):
    """PostgreSQL implementation of FriendRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _request_to_entity(self, model: FriendRequestModel) -> FriendRequest:
        """Convert request model to entity."""
        return FriendRequest(
            id=model.id,
            from_user_id=model.from_user_id,
            to_user_id=model.to_user_id,
            status=model.status,
            created_at=model.created_at,
            responded_at=model.responded_at,
        )

    def _friendship_to_entity(self, model: FriendshipModel) -> Friendship:
        """Convert friendship model to entity."""
        return Friendship(
            id=model.id,
            user_id=model.user_id,
            friend_id=model.friend_id,
            created_at=model.created_at,
        )

    async def create_friend_request(self, request: FriendRequest) -> FriendRequest:
        model = FriendRequestModel(
            id=request.id,
            from_user_id=request.from_user_id,
            to_user_id=request.to_user_id,
            status=request.status,
            created_at=request.created_at,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._request_to_entity(model)

    async def get_friend_request_by_id(self, request_id: UUID) -> FriendRequest | None:
        result = await self._session.execute(
            select(FriendRequestModel).where(FriendRequestModel.id == request_id)
        )
        model = result.scalar_one_or_none()
        return self._request_to_entity(model) if model else None

    async def get_pending_requests_for_user(self, user_id: UUID) -> list[FriendRequest]:
        result = await self._session.execute(
            select(FriendRequestModel)
            .where(FriendRequestModel.to_user_id == user_id)
            .where(FriendRequestModel.status == FriendRequestStatus.PENDING)
            .order_by(FriendRequestModel.created_at.desc())
        )
        return [self._request_to_entity(model) for model in result.scalars().all()]

    async def get_pending_request_between_users(
        self,
        from_user_id: UUID,
        to_user_id: UUID,
    ) -> FriendRequest | None:
        result = await self._session.execute(
            select(FriendRequestModel)
            .where(FriendRequestModel.from_user_id == from_user_id)
            .where(FriendRequestModel.to_user_id == to_user_id)
            .where(FriendRequestModel.status == FriendRequestStatus.PENDING)
        )
        model = result.scalar_one_or_none()
        return self._request_to_entity(model) if model else None

    async def update_friend_request(self, request: FriendRequest) -> FriendRequest:
        result = await self._session.execute(
            select(FriendRequestModel).where(FriendRequestModel.id == request.id)
        )
        model = result.scalar_one()
        model.status = request.status
        model.responded_at = request.responded_at
        await self._session.commit()
        await self._session.refresh(model)
        return self._request_to_entity(model)

    async def create_friendship(self, friendship: Friendship) -> Friendship:
        model = FriendshipModel(
            id=friendship.id,
            user_id=friendship.user_id,
            friend_id=friendship.friend_id,
            created_at=friendship.created_at,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._friendship_to_entity(model)

    async def get_user_friends(self, user_id: UUID) -> list[UUID]:
        result = await self._session.execute(
            select(FriendshipModel).where(
                or_(
                    FriendshipModel.user_id == user_id,
                    FriendshipModel.friend_id == user_id,
                )
            )
        )
        friendships = result.scalars().all()

        friend_ids = []
        for f in friendships:
            if f.user_id == user_id:
                friend_ids.append(f.friend_id)
            else:
                friend_ids.append(f.user_id)

        return friend_ids

    async def are_friends(self, user_id_1: UUID, user_id_2: UUID) -> bool:
        result = await self._session.execute(
            select(FriendshipModel).where(
                or_(
                    (FriendshipModel.user_id == user_id_1)
                    & (FriendshipModel.friend_id == user_id_2),
                    (FriendshipModel.user_id == user_id_2)
                    & (FriendshipModel.friend_id == user_id_1),
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def delete_friendship(self, user_id: UUID, friend_id: UUID) -> bool:
        result = await self._session.execute(
            select(FriendshipModel).where(
                or_(
                    (FriendshipModel.user_id == user_id)
                    & (FriendshipModel.friend_id == friend_id),
                    (FriendshipModel.user_id == friend_id)
                    & (FriendshipModel.friend_id == user_id),
                )
            )
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()
            return True
        return False

    async def get_sent_requests(
        self,
        user_id: UUID,
        status: FriendRequestStatus | None = None,
    ) -> list[FriendRequest]:
        query = select(FriendRequestModel).where(FriendRequestModel.from_user_id == user_id)

        if status:
            query = query.where(FriendRequestModel.status == status)

        query = query.order_by(FriendRequestModel.created_at.desc())

        result = await self._session.execute(query)
        return [self._request_to_entity(model) for model in result.scalars().all()]

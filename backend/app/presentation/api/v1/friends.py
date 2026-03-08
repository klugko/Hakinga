"""
Friends API routes.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.application.services.friend_service import FriendService
from app.domain.exceptions import DuplicateEntityError, EntityNotFoundError, ValidationError
from app.presentation.api.v1.deps import CurrentUser, get_friend_service
from app.presentation.schemas.common import ApiResponse, MessageResponse
from app.presentation.schemas.friend import (
    FriendRequestCreate,
    FriendRequestResponse,
    FriendResponse,
)

router = APIRouter()


@router.get("", response_model=ApiResponse[list[FriendResponse]])
async def get_friends(
    current_user: CurrentUser,
    friend_service: Annotated[FriendService, Depends(get_friend_service)],
) -> ApiResponse[list[FriendResponse]]:
    """Get the current user's friends list."""
    friends = await friend_service.get_friends(str(current_user.id))

    return ApiResponse(
        data=[
            FriendResponse(
                id=str(f.id),
                username=f.username,
                avatar=f.avatar,
                status=f.status.value,
                last_seen=f.last_seen.isoformat() if f.last_seen else None,
                stats={
                    "avg_wpm": f.stats.avg_wpm,
                    "total_sessions": f.stats.total_sessions,
                },
            )
            for f in friends
        ]
    )


@router.get("/requests", response_model=ApiResponse[list[FriendRequestResponse]])
async def get_friend_requests(
    current_user: CurrentUser,
    friend_service: Annotated[FriendService, Depends(get_friend_service)],
) -> ApiResponse[list[FriendRequestResponse]]:
    """Get pending friend requests for the current user."""
    requests = await friend_service.get_pending_requests(str(current_user.id))

    return ApiResponse(
        data=[
            FriendRequestResponse(
                id=str(r.id),
                from_user={
                    "id": str(r.from_user.id),
                    "username": r.from_user.username,
                    "avatar": r.from_user.avatar,
                },
                status=r.status.value,
                created_at=r.created_at.isoformat(),
            )
            for r in requests
        ]
    )


@router.post("/requests", response_model=ApiResponse[MessageResponse])
async def send_friend_request(
    request: FriendRequestCreate,
    current_user: CurrentUser,
    friend_service: Annotated[FriendService, Depends(get_friend_service)],
) -> ApiResponse[MessageResponse]:
    """Send a friend request to another user."""
    try:
        await friend_service.send_friend_request(
            from_user_id=str(current_user.id),
            to_username=request.username,
        )
        return ApiResponse(data=MessageResponse(message="Friend request sent"))
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except DuplicateEntityError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post("/requests/{request_id}/accept", response_model=ApiResponse[MessageResponse])
async def accept_friend_request(
    request_id: str,
    current_user: CurrentUser,
    friend_service: Annotated[FriendService, Depends(get_friend_service)],
) -> ApiResponse[MessageResponse]:
    """Accept a friend request."""
    try:
        await friend_service.accept_friend_request(
            request_id=request_id,
            user_id=str(current_user.id),
        )
        return ApiResponse(data=MessageResponse(message="Friend request accepted"))
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post("/requests/{request_id}/reject", response_model=ApiResponse[MessageResponse])
async def reject_friend_request(
    request_id: str,
    current_user: CurrentUser,
    friend_service: Annotated[FriendService, Depends(get_friend_service)],
) -> ApiResponse[MessageResponse]:
    """Reject a friend request."""
    try:
        await friend_service.reject_friend_request(
            request_id=request_id,
            user_id=str(current_user.id),
        )
        return ApiResponse(data=MessageResponse(message="Friend request rejected"))
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.delete("/{friend_id}", response_model=ApiResponse[MessageResponse])
async def remove_friend(
    friend_id: str,
    current_user: CurrentUser,
    friend_service: Annotated[FriendService, Depends(get_friend_service)],
) -> ApiResponse[MessageResponse]:
    """Remove a friend."""
    try:
        await friend_service.remove_friend(
            user_id=str(current_user.id),
            friend_id=friend_id,
        )
        return ApiResponse(data=MessageResponse(message="Friend removed"))
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

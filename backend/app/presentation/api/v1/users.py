"""
User API routes.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.services.user_service import UserService
from app.domain.exceptions import EntityNotFoundError, ValidationError
from app.presentation.api.v1.deps import CurrentUser, get_user_service
from app.presentation.schemas.common import ApiResponse
from app.presentation.schemas.user import (
    DashboardStatsResponse,
    UpdateProfileRequest,
    UserProfileResponse,
    UserResponse,
    UserSearchResponse,
    UserStatsResponse,
)

router = APIRouter()


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_current_user_profile(current_user: CurrentUser) -> ApiResponse[UserResponse]:
    """Get the current authenticated user's profile."""
    return ApiResponse(
        data=UserResponse(
            id=str(current_user.id),
            username=current_user.username,
            email=current_user.email,
            avatar=current_user.avatar,
            created_at=current_user.created_at,
            stats=UserStatsResponse(
                avg_wpm=current_user.stats.avg_wpm,
                avg_accuracy=current_user.stats.avg_accuracy,
                best_wpm=current_user.stats.best_wpm,
                total_sessions=current_user.stats.total_sessions,
                total_time_typed=current_user.stats.total_time_typed,
                total_characters_typed=current_user.stats.total_characters_typed,
            ),
        )
    )


@router.get("/me/dashboard", response_model=ApiResponse[DashboardStatsResponse])
async def get_dashboard_stats(
    current_user: CurrentUser,
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> ApiResponse[DashboardStatsResponse]:
    """Get dashboard statistics for the current user."""
    stats = await user_service.get_user_dashboard_stats(str(current_user.id))
    return ApiResponse(data=stats)


@router.put("/me", response_model=ApiResponse[UserResponse])
async def update_profile(
    request: UpdateProfileRequest,
    current_user: CurrentUser,
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> ApiResponse[UserResponse]:
    """Update the current user's profile."""
    try:
        user = await user_service.update_profile(
            user_id=str(current_user.id),
            username=request.username,
            email=request.email,
            avatar=request.avatar,
        )
        return ApiResponse(
            data=UserResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                avatar=user.avatar,
                created_at=user.created_at,
                stats=UserStatsResponse(
                    avg_wpm=user.stats.avg_wpm,
                    avg_accuracy=user.stats.avg_accuracy,
                    best_wpm=user.stats.best_wpm,
                    total_sessions=user.stats.total_sessions,
                    total_time_typed=user.stats.total_time_typed,
                    total_characters_typed=user.stats.total_characters_typed,
                ),
            )
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get("/{user_id}", response_model=ApiResponse[UserProfileResponse])
async def get_user_profile(
    user_id: str,
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> ApiResponse[UserProfileResponse]:
    """Get a user's public profile by ID."""
    try:
        user = await user_service.get_user_by_id(user_id)
        return ApiResponse(
            data=UserProfileResponse(
                id=str(user.id),
                username=user.username,
                avatar=user.avatar,
                created_at=user.created_at,
                stats=UserStatsResponse(
                    avg_wpm=user.stats.avg_wpm,
                    avg_accuracy=user.stats.avg_accuracy,
                    best_wpm=user.stats.best_wpm,
                    total_sessions=user.stats.total_sessions,
                    total_time_typed=user.stats.total_time_typed,
                    total_characters_typed=user.stats.total_characters_typed,
                ),
            )
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get("/search", response_model=ApiResponse[list[UserSearchResponse]])
async def search_users(
    q: Annotated[str, Query(min_length=2, max_length=50)],
    current_user: CurrentUser,
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> ApiResponse[list[UserSearchResponse]]:
    """Search for users by username."""
    users = await user_service.search_users(q, exclude_user_id=str(current_user.id))
    return ApiResponse(
        data=[
            UserSearchResponse(
                id=str(user.id),
                username=user.username,
                avatar=user.avatar,
                stats={
                    "avg_wpm": user.stats.avg_wpm,
                    "total_sessions": user.stats.total_sessions,
                },
            )
            for user in users
        ]
    )

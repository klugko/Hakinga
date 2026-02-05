"""
Leaderboard API routes.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.application.services.leaderboard_service import LeaderboardService
from app.presentation.api.v1.deps import CurrentUser, get_leaderboard_service
from app.presentation.schemas.common import ApiResponse
from app.presentation.schemas.leaderboard import LeaderboardEntryResponse, LeaderboardResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[LeaderboardResponse])
async def get_leaderboard(
    leaderboard_service: Annotated[LeaderboardService, Depends(get_leaderboard_service)],
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    period: str = Query("all", regex="^(all|month|week|today)$"),
) -> ApiResponse[LeaderboardResponse]:
    """Get the global leaderboard."""
    entries, total = await leaderboard_service.get_leaderboard(
        page=page,
        limit=limit,
        period=period,
    )

    pages = (total + limit - 1) // limit

    return ApiResponse(
        data=LeaderboardResponse(
            entries=[
                LeaderboardEntryResponse(
                    rank=entry.rank,
                    user_id=str(entry.user_id),
                    username=entry.username,
                    avatar=entry.avatar,
                    wpm=entry.wpm,
                    accuracy=entry.accuracy,
                    sessions_played=entry.sessions_played,
                )
                for entry in entries
            ],
            total=total,
            page=page,
            pages=pages,
        )
    )


@router.get("/friends", response_model=ApiResponse[LeaderboardResponse])
async def get_friends_leaderboard(
    current_user: CurrentUser,
    leaderboard_service: Annotated[LeaderboardService, Depends(get_leaderboard_service)],
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
) -> ApiResponse[LeaderboardResponse]:
    """Get the friends-only leaderboard."""
    entries, total = await leaderboard_service.get_friends_leaderboard(
        user_id=str(current_user.id),
        page=page,
        limit=limit,
    )

    pages = (total + limit - 1) // limit

    return ApiResponse(
        data=LeaderboardResponse(
            entries=[
                LeaderboardEntryResponse(
                    rank=entry.rank,
                    user_id=str(entry.user_id),
                    username=entry.username,
                    avatar=entry.avatar,
                    wpm=entry.wpm,
                    accuracy=entry.accuracy,
                    sessions_played=entry.sessions_played,
                )
                for entry in entries
            ],
            total=total,
            page=page,
            pages=pages,
        )
    )


@router.get("/me/rank", response_model=ApiResponse[LeaderboardEntryResponse | None])
async def get_my_rank(
    current_user: CurrentUser,
    leaderboard_service: Annotated[LeaderboardService, Depends(get_leaderboard_service)],
    period: str = Query("all", regex="^(all|month|week|today)$"),
) -> ApiResponse[LeaderboardEntryResponse | None]:
    """Get the current user's rank on the leaderboard."""
    entry = await leaderboard_service.get_user_rank(
        user_id=str(current_user.id),
        period=period,
    )

    if entry is None:
        return ApiResponse(data=None)

    return ApiResponse(
        data=LeaderboardEntryResponse(
            rank=entry.rank,
            user_id=str(entry.user_id),
            username=entry.username,
            avatar=entry.avatar,
            wpm=entry.wpm,
            accuracy=entry.accuracy,
            sessions_played=entry.sessions_played,
        )
    )

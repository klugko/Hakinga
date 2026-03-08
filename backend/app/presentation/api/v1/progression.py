"""
User progression API routes.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.application.services.xp_service import XPService
from app.presentation.api.v1.deps import CurrentUser, get_xp_service
from app.presentation.schemas.common import ApiResponse
from app.presentation.schemas.progression import (
    LevelInfoResponse,
    RankLeaderboardEntry,
    RankLeaderboardResponse,
    UserProgressResponse,
    XPLeaderboardEntry,
    XPLeaderboardResponse,
)

router = APIRouter()


@router.get("/me", response_model=ApiResponse[UserProgressResponse])
async def get_my_progress(
    current_user: CurrentUser,
    xp_service: Annotated[XPService, Depends(get_xp_service)],
) -> ApiResponse[UserProgressResponse]:
    """Get the current user's progression data."""
    progress = await xp_service.get_user_progress(current_user.id)
    level_info = progress.get_level_info()

    return ApiResponse(
        data=UserProgressResponse(
            user_id=str(progress.user_id),
            total_xp=progress.total_xp,
            current_level=progress.current_level,
            current_streak=progress.current_streak,
            best_streak=progress.best_streak,
            last_session_date=progress.last_session_date,
            rank_tier=progress.rank_tier.value,
            mmr=progress.mmr,
            level_info=LevelInfoResponse(
                level=level_info.level,
                current_xp=level_info.current_xp,
                xp_for_current_level=level_info.xp_for_current_level,
                xp_for_next_level=level_info.xp_for_next_level,
                progress_percent=level_info.progress_percent,
                xp_needed=level_info.xp_needed,
            ),
        )
    )


@router.get("/level", response_model=ApiResponse[LevelInfoResponse])
async def get_my_level(
    current_user: CurrentUser,
    xp_service: Annotated[XPService, Depends(get_xp_service)],
) -> ApiResponse[LevelInfoResponse]:
    """Get the current user's level information."""
    level_info = await xp_service.get_level_info(current_user.id)

    return ApiResponse(
        data=LevelInfoResponse(
            level=level_info.level,
            current_xp=level_info.current_xp,
            xp_for_current_level=level_info.xp_for_current_level,
            xp_for_next_level=level_info.xp_for_next_level,
            progress_percent=level_info.progress_percent,
            xp_needed=level_info.xp_needed,
        )
    )


@router.get("/leaderboard/xp", response_model=ApiResponse[XPLeaderboardResponse])
async def get_xp_leaderboard(
    current_user: CurrentUser,
    xp_service: Annotated[XPService, Depends(get_xp_service)],
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
) -> ApiResponse[XPLeaderboardResponse]:
    """Get the XP/level leaderboard."""
    offset = (page - 1) * limit
    entries = await xp_service.get_leaderboard_by_level(limit=limit, offset=offset)
    user_rank = await xp_service.get_user_rank_position(current_user.id)

    return ApiResponse(
        data=XPLeaderboardResponse(
            entries=[
                XPLeaderboardEntry(
                    rank=e["rank"],
                    user_id=e["user_id"],
                    username=e["username"],
                    avatar=e["avatar"],
                    total_xp=e["total_xp"],
                    level=e["level"],
                    streak=e["streak"],
                    rank_tier=e["rank_tier"],
                )
                for e in entries
            ],
            user_rank=user_rank if user_rank > 0 else None,
            total_users=len(entries),  # This could be improved with a count query
        )
    )


@router.get("/leaderboard/ranked", response_model=ApiResponse[RankLeaderboardResponse])
async def get_ranked_leaderboard(
    current_user: CurrentUser,
    xp_service: Annotated[XPService, Depends(get_xp_service)],
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
) -> ApiResponse[RankLeaderboardResponse]:
    """Get the ranked (MMR) leaderboard."""
    offset = (page - 1) * limit
    entries = await xp_service._progression_repo.get_top_by_mmr(limit=limit, offset=offset)

    return ApiResponse(
        data=RankLeaderboardResponse(
            entries=[
                RankLeaderboardEntry(
                    rank=e["rank"],
                    user_id=e["user_id"],
                    username=e["username"],
                    avatar=e["avatar"],
                    mmr=e["mmr"],
                    rank_tier=e["rank_tier"],
                    level=e["level"],
                )
                for e in entries
            ],
            total_users=len(entries),
        )
    )

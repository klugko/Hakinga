"""
Achievement API routes.
"""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.application.services.achievement_service import AchievementService
from app.presentation.api.v1.deps import CurrentUser, get_achievement_service
from app.presentation.schemas.achievement import AchievementResponse
from app.presentation.schemas.common import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[list[AchievementResponse]])
async def get_achievements(
    current_user: CurrentUser,
    achievement_service: Annotated[AchievementService, Depends(get_achievement_service)],
) -> ApiResponse[list[AchievementResponse]]:
    """Get all achievements with the current user's progress."""
    achievements = await achievement_service.get_user_achievements(str(current_user.id))

    return ApiResponse(
        data=[
            AchievementResponse(
                id=str(a.id),
                name=a.name,
                description=a.description,
                icon=a.icon,
                max_progress=a.max_progress,
                progress=a.progress,
                unlocked_at=a.unlocked_at.isoformat() if a.unlocked_at else None,
            )
            for a in achievements
        ]
    )


@router.get("/available", response_model=ApiResponse[list[AchievementResponse]])
async def get_available_achievements(
    achievement_service: Annotated[AchievementService, Depends(get_achievement_service)],
) -> ApiResponse[list[AchievementResponse]]:
    """Get all available achievements (without user progress)."""
    achievements = await achievement_service.get_all_achievements()

    return ApiResponse(
        data=[
            AchievementResponse(
                id=str(a.id),
                name=a.name,
                description=a.description,
                icon=a.icon,
                max_progress=a.max_progress,
                progress=0,
                unlocked_at=None,
            )
            for a in achievements
        ]
    )

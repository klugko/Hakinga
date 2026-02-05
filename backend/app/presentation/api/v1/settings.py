"""
User settings API routes.
"""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.application.services.settings_service import SettingsService
from app.presentation.api.v1.deps import CurrentUser, get_settings_service
from app.presentation.schemas.common import ApiResponse
from app.presentation.schemas.settings import SettingsResponse, UpdateSettingsRequest

router = APIRouter()


@router.get("", response_model=ApiResponse[SettingsResponse])
async def get_settings(
    current_user: CurrentUser,
    settings_service: Annotated[SettingsService, Depends(get_settings_service)],
) -> ApiResponse[SettingsResponse]:
    """Get the current user's settings."""
    settings = await settings_service.get_user_settings(str(current_user.id))

    return ApiResponse(
        data=SettingsResponse(
            sound_effects=settings.sound_effects,
            notifications=settings.notifications,
            show_wpm_live=settings.show_wpm_live,
            show_accuracy_live=settings.show_accuracy_live,
            theme=settings.theme,
            keyboard_layout=settings.keyboard_layout,
        )
    )


@router.put("", response_model=ApiResponse[SettingsResponse])
async def update_settings(
    request: UpdateSettingsRequest,
    current_user: CurrentUser,
    settings_service: Annotated[SettingsService, Depends(get_settings_service)],
) -> ApiResponse[SettingsResponse]:
    """Update the current user's settings."""
    settings = await settings_service.update_settings(
        user_id=str(current_user.id),
        sound_effects=request.sound_effects,
        notifications=request.notifications,
        show_wpm_live=request.show_wpm_live,
        show_accuracy_live=request.show_accuracy_live,
        theme=request.theme,
        keyboard_layout=request.keyboard_layout,
    )

    return ApiResponse(
        data=SettingsResponse(
            sound_effects=settings.sound_effects,
            notifications=settings.notifications,
            show_wpm_live=settings.show_wpm_live,
            show_accuracy_live=settings.show_accuracy_live,
            theme=settings.theme,
            keyboard_layout=settings.keyboard_layout,
        )
    )

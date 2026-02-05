"""
Authentication API routes.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.application.services.auth_service import AuthService
from app.domain.exceptions import AuthenticationError, DuplicateEntityError, ValidationError
from app.presentation.api.v1.deps import CurrentUser, get_auth_service
from app.presentation.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.presentation.schemas.common import ApiResponse, MessageResponse
from app.presentation.schemas.user import UserResponse, UserStatsResponse

router = APIRouter()


@router.post("/register", response_model=ApiResponse[AuthResponse])
async def register(
    request: RegisterRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> ApiResponse[AuthResponse]:
    """Register a new user account."""
    try:
        user, access_token, refresh_token = await auth_service.register(
            username=request.username,
            email=request.email,
            password=request.password,
        )

        user_response = UserResponse(
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

        return ApiResponse(
            data=AuthResponse(
                user=user_response,
                access_token=access_token,
                refresh_token=refresh_token,
            )
        )
    except DuplicateEntityError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post("/login", response_model=ApiResponse[AuthResponse])
async def login(
    request: LoginRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> ApiResponse[AuthResponse]:
    """Authenticate user and return tokens."""
    try:
        user, access_token, refresh_token = await auth_service.login(
            email=request.email,
            password=request.password,
        )

        user_response = UserResponse(
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

        return ApiResponse(
            data=AuthResponse(
                user=user_response,
                access_token=access_token,
                refresh_token=refresh_token,
            )
        )
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)


@router.post("/forgot-password", response_model=ApiResponse[MessageResponse])
async def forgot_password(
    request: ForgotPasswordRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> ApiResponse[MessageResponse]:
    """Request a password reset email."""
    await auth_service.request_password_reset(request.email)
    return ApiResponse(data=MessageResponse(message="If the email exists, a reset link has been sent"))


@router.post("/reset-password", response_model=ApiResponse[MessageResponse])
async def reset_password(
    request: ResetPasswordRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> ApiResponse[MessageResponse]:
    """Reset password using reset token."""
    try:
        await auth_service.reset_password(request.token, request.new_password)
        return ApiResponse(data=MessageResponse(message="Password reset successful"))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post("/change-password", response_model=ApiResponse[MessageResponse])
async def change_password(
    request: ChangePasswordRequest,
    current_user: CurrentUser,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> ApiResponse[MessageResponse]:
    """Change password for authenticated user."""
    try:
        await auth_service.change_password(
            user_id=str(current_user.id),
            current_password=request.current_password,
            new_password=request.new_password,
        )
        return ApiResponse(data=MessageResponse(message="Password changed successfully"))
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post("/logout", response_model=ApiResponse[MessageResponse])
async def logout(current_user: CurrentUser) -> ApiResponse[MessageResponse]:
    """Logout user (client should discard tokens)."""
    return ApiResponse(data=MessageResponse(message="Logged out successfully"))

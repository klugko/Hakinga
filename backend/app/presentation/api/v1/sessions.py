"""
Typing session API routes.
"""
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.services.session_service import SessionService
from app.domain.entities.typing_session import SessionMode
from app.domain.exceptions import EntityNotFoundError, ValidationError
from app.presentation.api.v1.deps import CurrentUser, get_session_service
from app.presentation.schemas.common import ApiResponse
from app.presentation.schemas.session import (
    CreateSessionRequest,
    LevelInfoSchema,
    SessionHistoryResponse,
    SessionListResponse,
    SessionResponse,
    SessionWithXPResponse,
    WpmDataPointSchema,
    XPBreakdownSchema,
)

router = APIRouter()


@router.post("", response_model=ApiResponse[SessionWithXPResponse])
async def create_session(
    request: CreateSessionRequest,
    current_user: CurrentUser,
    session_service: Annotated[SessionService, Depends(get_session_service)],
) -> ApiResponse[SessionWithXPResponse]:
    """Create a new typing session (save session results) with XP calculation."""
    try:
        now = datetime.now(UTC)
        started_at = datetime.fromtimestamp(
            now.timestamp() - request.duration, tz=UTC
        )

        session, xp_gain, level_info, leveled_up, new_streak = await session_service.create_session(
            user_id=str(current_user.id),
            text_id=request.text_id,
            text_content=request.text,
            wpm=request.wpm,
            raw_wpm=request.raw_wpm,
            accuracy=request.accuracy,
            errors=request.errors,
            total_characters=request.total_characters,
            correct_characters=request.correct_characters,
            duration=request.duration,
            started_at=started_at,
            completed_at=now,
            mode=SessionMode.SOLO,
            wpm_history=[
                {"time": h.time, "wpm": h.wpm, "accuracy": h.accuracy}
                for h in request.wpm_history
            ],
            max_combo=getattr(request, 'max_combo', 0),
            difficulty=getattr(request, 'difficulty', 'medium'),
        )

        # Build XP response
        xp_response = None
        level_response = None
        if xp_gain and level_info:
            xp_response = XPBreakdownSchema(
                base_xp=xp_gain.base_xp,
                difficulty_multiplier=xp_gain.difficulty_multiplier,
                mode_multiplier=xp_gain.mode_multiplier,
                streak_bonus=xp_gain.streak_bonus,
                perfect_accuracy_bonus=xp_gain.perfect_accuracy_bonus,
                personal_best_bonus=xp_gain.personal_best_bonus,
                total_xp=xp_gain.total_xp,
            )
            level_response = LevelInfoSchema(
                level=level_info.level,
                current_xp=level_info.current_xp,
                xp_for_current_level=level_info.xp_for_current_level,
                xp_for_next_level=level_info.xp_for_next_level,
                progress_percent=level_info.progress_percent,
                xp_needed=level_info.xp_needed,
            )

        return ApiResponse(
            data=SessionWithXPResponse(
                id=str(session.id),
                user_id=str(session.user_id),
                text_id=str(session.text_id),
                wpm=session.wpm,
                raw_wpm=session.raw_wpm,
                accuracy=session.accuracy,
                errors=session.errors,
                total_characters=session.total_characters,
                correct_characters=session.correct_characters,
                duration=session.duration,
                started_at=session.started_at,
                completed_at=session.completed_at,
                mode=session.mode.value,
                wpm_history=[
                    WpmDataPointSchema(time=h.time, wpm=h.wpm, accuracy=h.accuracy)
                    for h in session.wpm_history
                ],
                max_combo=session.max_combo,
                xp_earned=session.xp_earned,
                xp_breakdown=xp_response,
                level_info=level_response,
                leveled_up=leveled_up,
                new_level=level_info.level if leveled_up else None,
                new_streak=new_streak,
            )
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get("", response_model=ApiResponse[SessionHistoryResponse])
async def get_session_history(
    current_user: CurrentUser,
    session_service: Annotated[SessionService, Depends(get_session_service)],
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    mode: str | None = Query(None),
) -> ApiResponse[SessionHistoryResponse]:
    """Get the current user's session history."""
    result = await session_service.get_session_history(
        user_id=current_user.id,
        mode=mode,
        page=page,
        limit=limit,
    )

    return ApiResponse(
        data=SessionHistoryResponse(
            sessions=[
                SessionListResponse(
                    id=s["id"],
                    text_id=s["text_id"],
                    wpm=s["wpm"],
                    raw_wpm=s["raw_wpm"],
                    accuracy=s["accuracy"],
                    errors=s["errors"],
                    total_characters=s["total_characters"],
                    duration=s["duration"],
                    mode=s["mode"],
                    started_at=s["started_at"],
                    completed_at=s["completed_at"],
                )
                for s in result["sessions"]
            ],
            total=result["total"],
            page=result["page"],
            pages=result["pages"],
        )
    )


@router.get("/{session_id}", response_model=ApiResponse[SessionResponse])
async def get_session(
    session_id: str,
    current_user: CurrentUser,
    session_service: Annotated[SessionService, Depends(get_session_service)],
) -> ApiResponse[SessionResponse]:
    """Get a specific session by ID."""
    try:
        session = await session_service.get_session_by_id(session_id)

        if str(session.user_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this session",
            )

        return ApiResponse(
            data=SessionResponse(
                id=str(session.id),
                user_id=str(session.user_id),
                text_id=str(session.text_id),
                wpm=session.wpm,
                raw_wpm=session.raw_wpm,
                accuracy=session.accuracy,
                errors=session.errors,
                total_characters=session.total_characters,
                correct_characters=session.correct_characters,
                duration=session.duration,
                started_at=session.started_at,
                completed_at=session.completed_at,
                mode=session.mode.value,
                wpm_history=[
                    WpmDataPointSchema(time=h.time, wpm=h.wpm, accuracy=h.accuracy)
                    for h in session.wpm_history
                ],
            )
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

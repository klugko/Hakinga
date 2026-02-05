"""
Training API routes (placeholder for future features).
"""
from fastapi import APIRouter

from app.presentation.schemas.common import ApiResponse, MessageResponse

router = APIRouter()


@router.get("/plans", response_model=ApiResponse[list])
async def get_training_plans() -> ApiResponse[list]:
    """Get available training plans (coming soon)."""
    return ApiResponse(data=[])


@router.get("/exercises", response_model=ApiResponse[list])
async def get_exercises() -> ApiResponse[list]:
    """Get available training exercises (coming soon)."""
    return ApiResponse(data=[])

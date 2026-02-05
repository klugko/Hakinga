"""
API v1 router aggregating all endpoint routers.
"""
from fastapi import APIRouter

from app.presentation.api.v1 import (
    achievements,
    auth,
    friends,
    leaderboard,
    progression,
    sessions,
    settings,
    texts,
    training,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(texts.router, prefix="/texts", tags=["Texts"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
api_router.include_router(friends.router, prefix="/friends", tags=["Friends"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(training.router, prefix="/training", tags=["Training"])
api_router.include_router(progression.router, prefix="/progression", tags=["Progression"])

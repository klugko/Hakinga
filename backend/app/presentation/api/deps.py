"""
API dependencies.

Provides dependency injection for routes.
"""
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.services.achievement_service import AchievementService
from app.application.services.auth_service import AuthService
from app.application.services.friend_service import FriendService
from app.application.services.leaderboard_service import LeaderboardService
from app.application.services.session_service import SessionService
from app.application.services.settings_service import SettingsService
from app.application.services.text_service import TextService
from app.application.services.user_service import UserService
from app.core.security import decode_token
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.infrastructure.email.email_service import EmailService
from app.infrastructure.repositories.achievement_repository_impl import (
    PostgresAchievementRepository,
)
from app.infrastructure.repositories.friend_repository_impl import PostgresFriendRepository
from app.infrastructure.repositories.leaderboard_repository_impl import (
    PostgresLeaderboardRepository,
)
from app.infrastructure.repositories.session_repository_impl import PostgresSessionRepository
from app.infrastructure.repositories.settings_repository_impl import PostgresSettingsRepository
from app.infrastructure.repositories.text_repository_impl import PostgresTextRepository
from app.infrastructure.repositories.user_repository_impl import PostgresUserRepository

security = HTTPBearer()

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_user_repository(db: DbSession) -> PostgresUserRepository:
    """Get user repository instance."""
    return PostgresUserRepository(db)


async def get_session_repository(db: DbSession) -> PostgresSessionRepository:
    """Get session repository instance."""
    return PostgresSessionRepository(db)


async def get_text_repository(db: DbSession) -> PostgresTextRepository:
    """Get text repository instance."""
    return PostgresTextRepository(db)


async def get_achievement_repository(db: DbSession) -> PostgresAchievementRepository:
    """Get achievement repository instance."""
    return PostgresAchievementRepository(db)


async def get_friend_repository(db: DbSession) -> PostgresFriendRepository:
    """Get friend repository instance."""
    return PostgresFriendRepository(db)


async def get_leaderboard_repository(db: DbSession) -> PostgresLeaderboardRepository:
    """Get leaderboard repository instance."""
    return PostgresLeaderboardRepository(db)


async def get_settings_repository(db: DbSession) -> PostgresSettingsRepository:
    """Get settings repository instance."""
    return PostgresSettingsRepository(db)


def get_email_service() -> EmailService:
    """Get email service instance."""
    return EmailService()


async def get_auth_service(
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> AuthService:
    """Get auth service instance."""
    return AuthService(user_repo, email_service)


async def get_user_service(
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
    session_repo: Annotated[PostgresSessionRepository, Depends(get_session_repository)],
) -> UserService:
    """Get user service instance."""
    return UserService(user_repo, session_repo)


async def get_session_service(
    session_repo: Annotated[PostgresSessionRepository, Depends(get_session_repository)],
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
    text_repo: Annotated[PostgresTextRepository, Depends(get_text_repository)],
) -> SessionService:
    """Get session service instance."""
    return SessionService(session_repo, user_repo, text_repo)


async def get_text_service(
    text_repo: Annotated[PostgresTextRepository, Depends(get_text_repository)],
) -> TextService:
    """Get text service instance."""
    return TextService(text_repo)


async def get_achievement_service(
    achievement_repo: Annotated[PostgresAchievementRepository, Depends(get_achievement_repository)],
) -> AchievementService:
    """Get achievement service instance."""
    return AchievementService(achievement_repo)


async def get_friend_service(
    friend_repo: Annotated[PostgresFriendRepository, Depends(get_friend_repository)],
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
) -> FriendService:
    """Get friend service instance."""
    return FriendService(friend_repo, user_repo)


async def get_leaderboard_service(
    leaderboard_repo: Annotated[PostgresLeaderboardRepository, Depends(get_leaderboard_repository)],
    friend_repo: Annotated[PostgresFriendRepository, Depends(get_friend_repository)],
) -> LeaderboardService:
    """Get leaderboard service instance."""
    return LeaderboardService(leaderboard_repo, friend_repo)


async def get_settings_service(
    settings_repo: Annotated[PostgresSettingsRepository, Depends(get_settings_repository)],
) -> SettingsService:
    """Get settings service instance."""
    return SettingsService(settings_repo)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
) -> User:
    """
    Get the current authenticated user.

    Raises:
        HTTPException: If token is invalid or user not found.
    """
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_repo.get_by_id(UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]

"""
FastAPI dependencies for dependency injection.
"""
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.services.auth_service import AuthService
from app.application.services.user_service import UserService
from app.application.services.session_service import SessionService
from app.application.services.text_service import TextService
from app.application.services.achievement_service import AchievementService
from app.application.services.friend_service import FriendService
from app.application.services.leaderboard_service import LeaderboardService
from app.application.services.settings_service import SettingsService
from app.application.services.xp_service import XPService
from app.core.security import decode_token
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.user_repository_impl import PostgresUserRepository
from app.infrastructure.repositories.session_repository_impl import PostgresSessionRepository
from app.infrastructure.repositories.text_repository_impl import PostgresTextRepository
from app.infrastructure.repositories.achievement_repository_impl import PostgresAchievementRepository
from app.infrastructure.repositories.friend_repository_impl import PostgresFriendRepository
from app.infrastructure.repositories.leaderboard_repository_impl import PostgresLeaderboardRepository
from app.infrastructure.repositories.settings_repository_impl import PostgresSettingsRepository
from app.infrastructure.repositories.progression_repository_impl import PostgresProgressionRepository
from app.infrastructure.email.email_service import EmailService

# Type alias for database session dependency
DbSession = Annotated[AsyncSession, Depends(get_db)]

# Security scheme
security = HTTPBearer()


# Repository dependencies
def get_user_repository(db: DbSession) -> PostgresUserRepository:
    """Get user repository instance."""
    return PostgresUserRepository(db)


def get_session_repository(db: DbSession) -> PostgresSessionRepository:
    """Get session repository instance."""
    return PostgresSessionRepository(db)


def get_text_repository(db: DbSession) -> PostgresTextRepository:
    """Get text repository instance."""
    return PostgresTextRepository(db)


def get_achievement_repository(db: DbSession) -> PostgresAchievementRepository:
    """Get achievement repository instance."""
    return PostgresAchievementRepository(db)


def get_friend_repository(db: DbSession) -> PostgresFriendRepository:
    """Get friend repository instance."""
    return PostgresFriendRepository(db)


def get_leaderboard_repository(db: DbSession) -> PostgresLeaderboardRepository:
    """Get leaderboard repository instance."""
    return PostgresLeaderboardRepository(db)


def get_settings_repository(db: DbSession) -> PostgresSettingsRepository:
    """Get settings repository instance."""
    return PostgresSettingsRepository(db)


def get_progression_repository(db: DbSession) -> PostgresProgressionRepository:
    """Get progression repository instance."""
    return PostgresProgressionRepository(db)


def get_email_service() -> EmailService:
    """Get email service instance."""
    return EmailService()


# Service dependencies
def get_auth_service(
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> AuthService:
    """Get auth service instance."""
    return AuthService(user_repo, email_service)


def get_user_service(
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
    session_repo: Annotated[PostgresSessionRepository, Depends(get_session_repository)],
) -> UserService:
    """Get user service instance."""
    return UserService(user_repo, session_repo)


def get_session_service(
    session_repo: Annotated[PostgresSessionRepository, Depends(get_session_repository)],
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
    text_repo: Annotated[PostgresTextRepository, Depends(get_text_repository)],
    progression_repo: Annotated[PostgresProgressionRepository, Depends(get_progression_repository)],
) -> SessionService:
    """Get session service instance."""
    return SessionService(session_repo, user_repo, text_repo, progression_repo)


def get_text_service(
    text_repo: Annotated[PostgresTextRepository, Depends(get_text_repository)],
) -> TextService:
    """Get text service instance."""
    return TextService(text_repo)


def get_achievement_service(
    achievement_repo: Annotated[PostgresAchievementRepository, Depends(get_achievement_repository)],
) -> AchievementService:
    """Get achievement service instance."""
    return AchievementService(achievement_repo)


def get_friend_service(
    friend_repo: Annotated[PostgresFriendRepository, Depends(get_friend_repository)],
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
) -> FriendService:
    """Get friend service instance."""
    return FriendService(friend_repo, user_repo)


def get_leaderboard_service(
    leaderboard_repo: Annotated[PostgresLeaderboardRepository, Depends(get_leaderboard_repository)],
    friend_repo: Annotated[PostgresFriendRepository, Depends(get_friend_repository)],
) -> LeaderboardService:
    """Get leaderboard service instance."""
    return LeaderboardService(leaderboard_repo, friend_repo)


def get_settings_service(
    settings_repo: Annotated[PostgresSettingsRepository, Depends(get_settings_repository)],
) -> SettingsService:
    """Get settings service instance."""
    return SettingsService(settings_repo)


def get_xp_service(
    progression_repo: Annotated[PostgresProgressionRepository, Depends(get_progression_repository)],
) -> XPService:
    """Get XP service instance."""
    return XPService(progression_repo)


# Authentication dependency
async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    user_repo: Annotated[PostgresUserRepository, Depends(get_user_repository)],
) -> User:
    """Get the current authenticated user from the JWT token."""
    token = credentials.credentials

    try:
        payload = decode_token(token)

        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token_type = payload.get("type")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = await user_repo.get_by_id(UUID(user_id))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Type alias for current user dependency
CurrentUser = Annotated[User, Depends(get_current_user)]

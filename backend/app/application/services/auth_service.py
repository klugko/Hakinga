"""
Authentication service.

Handles user registration, login, and password management.
"""
from datetime import UTC, datetime
from uuid import uuid4

from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_password_reset_token,
)
from app.domain.entities.user import User, UserStats
from app.domain.exceptions import (
    AuthenticationError,
    DuplicateEntityError,
    EntityNotFoundError,
    ValidationError,
)
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.email.email_service import EmailService


class AuthService:
    """Service handling authentication operations."""

    def __init__(self, user_repository: UserRepository, email_service: EmailService):
        self._user_repo = user_repository
        self._email_service = email_service

    async def register(
        self,
        username: str,
        email: str,
        password: str,
    ) -> tuple[User, str, str]:
        """
        Register a new user.

        Args:
            username: Desired username.
            email: User's email address.
            password: Plain text password.

        Returns:
            Tuple of (created user, access token, refresh token).

        Raises:
            DuplicateEntityError: If email or username already exists.
            ValidationError: If validation fails.
        """
        email = email.lower().strip()
        username = username.strip()

        if len(username) < 3:
            raise ValidationError("Username must be at least 3 characters", "username")
        if len(username) > 50:
            raise ValidationError("Username must be at most 50 characters", "username")
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters", "password")

        if await self._user_repo.exists_by_email(email):
            raise DuplicateEntityError("User", "email", email)

        if await self._user_repo.exists_by_username(username):
            raise DuplicateEntityError("User", "username", username)

        now = datetime.now(UTC)
        user = User(
            id=uuid4(),
            username=username,
            email=email,
            password_hash=get_password_hash(password),
            created_at=now,
            updated_at=now,
            stats=UserStats(),
        )

        created_user = await self._user_repo.create(user)

        await self._email_service.send_welcome_email(email, username)

        access_token = create_access_token(str(created_user.id))
        refresh_token = create_refresh_token(str(created_user.id))

        return created_user, access_token, refresh_token

    async def login(self, email: str, password: str) -> tuple[User, str, str]:
        """
        Authenticate a user.

        Args:
            email: User's email address.
            password: Plain text password.

        Returns:
            Tuple of (user, access token, refresh token).

        Raises:
            AuthenticationError: If credentials are invalid.
        """
        email = email.lower().strip()
        user = await self._user_repo.get_by_email(email)

        if not user:
            raise AuthenticationError("Invalid email or password")

        if not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        if not user.is_active:
            raise AuthenticationError("Account is deactivated")

        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))

        return user, access_token, refresh_token

    async def request_password_reset(self, email: str) -> bool:
        """
        Request a password reset.

        Args:
            email: User's email address.

        Returns:
            True if email was sent (or would be sent for security).
        """
        email = email.lower().strip()
        user = await self._user_repo.get_by_email(email)

        if user and user.is_active:
            reset_token = create_password_reset_token(email)
            await self._email_service.send_password_reset_email(email, reset_token)

        return True

    async def reset_password(self, token: str, new_password: str) -> bool:
        """
        Reset a user's password using a reset token.

        Args:
            token: Password reset token.
            new_password: New plain text password.

        Returns:
            True if password was reset successfully.

        Raises:
            ValidationError: If token is invalid or password too short.
        """
        if len(new_password) < 8:
            raise ValidationError("Password must be at least 8 characters", "password")

        email = verify_password_reset_token(token)
        if not email:
            raise ValidationError("Invalid or expired reset token", "token")

        user = await self._user_repo.get_by_email(email)
        if not user:
            raise EntityNotFoundError("User", email)

        user.password_hash = get_password_hash(new_password)
        user.updated_at = datetime.now(UTC)
        await self._user_repo.update(user)

        return True

    async def change_password(
        self,
        user_id: str,
        current_password: str,
        new_password: str,
    ) -> bool:
        """
        Change a user's password.

        Args:
            user_id: User's ID.
            current_password: Current password.
            new_password: New password.

        Returns:
            True if password was changed.

        Raises:
            AuthenticationError: If current password is wrong.
            ValidationError: If new password is too short.
        """
        from uuid import UUID

        if len(new_password) < 8:
            raise ValidationError("Password must be at least 8 characters", "password")

        user = await self._user_repo.get_by_id(UUID(user_id))
        if not user:
            raise EntityNotFoundError("User", user_id)

        if not verify_password(current_password, user.password_hash):
            raise AuthenticationError("Current password is incorrect")

        user.password_hash = get_password_hash(new_password)
        user.updated_at = datetime.now(UTC)
        await self._user_repo.update(user)

        return True

    async def refresh_token(self, refresh_token: str) -> tuple[User, str, str]:
        """
        Refresh access token using a refresh token.

        Args:
            refresh_token: Valid refresh token.

        Returns:
            Tuple of (user, new access token, new refresh token).

        Raises:
            AuthenticationError: If refresh token is invalid.
        """
        from app.core.security import verify_refresh_token

        user_id = verify_refresh_token(refresh_token)
        if not user_id:
            raise AuthenticationError("Invalid or expired refresh token")

        from uuid import UUID

        user = await self._user_repo.get_by_id(UUID(user_id))
        if not user:
            raise AuthenticationError("User not found")

        if not user.is_active:
            raise AuthenticationError("Account is deactivated")

        new_access_token = create_access_token(str(user.id))
        new_refresh_token = create_refresh_token(str(user.id))

        return user, new_access_token, new_refresh_token

    async def delete_account(self, user_id: str) -> bool:
        """
        Delete a user's account permanently.

        Args:
            user_id: User's ID.

        Returns:
            True if account was deleted.

        Raises:
            EntityNotFoundError: If user not found.
        """
        from uuid import UUID

        user = await self._user_repo.get_by_id(UUID(user_id))
        if not user:
            raise EntityNotFoundError("User", user_id)

        # Soft delete by deactivating
        user.is_active = False
        user.email = f"deleted_{user.id}@deleted.local"
        user.username = f"deleted_{user.id}"
        user.updated_at = datetime.now(UTC)
        await self._user_repo.update(user)

        return True

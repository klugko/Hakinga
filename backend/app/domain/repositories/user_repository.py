"""
User repository interface.
"""
from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.user import User


class UserRepository(ABC):
    """
    Abstract repository interface for User entity persistence.

    Implementations should handle database operations for users.
    """

    @abstractmethod
    async def create(self, user: User) -> User:
        """
        Create a new user.

        Args:
            user: User entity to persist.

        Returns:
            Created user with generated ID.
        """
        ...

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> User | None:
        """
        Get a user by their ID.

        Args:
            user_id: Unique user identifier.

        Returns:
            User if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None:
        """
        Get a user by their email.

        Args:
            email: User's email address.

        Returns:
            User if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_by_username(self, username: str) -> User | None:
        """
        Get a user by their username.

        Args:
            username: User's username.

        Returns:
            User if found, None otherwise.
        """
        ...

    @abstractmethod
    async def update(self, user: User) -> User:
        """
        Update an existing user.

        Args:
            user: User entity with updated data.

        Returns:
            Updated user.
        """
        ...

    @abstractmethod
    async def delete(self, user_id: UUID) -> bool:
        """
        Delete a user.

        Args:
            user_id: ID of user to delete.

        Returns:
            True if deleted, False if not found.
        """
        ...

    @abstractmethod
    async def search_by_username(self, query: str, limit: int = 10) -> list[User]:
        """
        Search users by username prefix.

        Args:
            query: Username search query.
            limit: Maximum number of results.

        Returns:
            List of matching users.
        """
        ...

    @abstractmethod
    async def exists_by_email(self, email: str) -> bool:
        """Check if a user with the given email exists."""
        ...

    @abstractmethod
    async def exists_by_username(self, username: str) -> bool:
        """Check if a user with the given username exists."""
        ...

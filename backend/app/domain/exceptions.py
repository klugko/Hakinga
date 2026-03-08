"""
Domain exceptions.

Custom exceptions for domain-specific error conditions.
"""


class DomainError(Exception):
    """Base exception for all domain errors."""

    def __init__(self, message: str, code: str = "DOMAIN_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class EntityNotFoundError(DomainError):
    """Raised when an entity is not found."""

    def __init__(self, entity_type: str, identifier: str):
        super().__init__(
            message=f"{entity_type} with identifier '{identifier}' not found",
            code="NOT_FOUND",
        )


class DuplicateEntityError(DomainError):
    """Raised when attempting to create a duplicate entity."""

    def __init__(self, entity_type: str, field: str, value: str):
        super().__init__(
            message=f"{entity_type} with {field} '{value}' already exists",
            code=f"DUPLICATE_{field.upper()}",
        )


class AuthenticationError(DomainError):
    """Raised for authentication failures."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message=message, code="UNAUTHORIZED")


class AuthorizationError(DomainError):
    """Raised for authorization failures."""

    def __init__(self, message: str = "Access denied"):
        super().__init__(message=message, code="FORBIDDEN")


class ValidationError(DomainError):
    """Raised for validation failures."""

    def __init__(self, message: str, field: str | None = None):
        code = f"INVALID_{field.upper()}" if field else "INVALID_INPUT"
        super().__init__(message=message, code=code)


class SessionFullError(DomainError):
    """Raised when a private session is full."""

    def __init__(self):
        super().__init__(
            message="Session has reached maximum number of players",
            code="SESSION_FULL",
        )


class SessionNotFoundError(EntityNotFoundError):
    """Raised when a session is not found."""

    def __init__(self, code: str):
        super().__init__("Session", code)
        self.code = "SESSION_NOT_FOUND"


class InvalidSessionStateError(DomainError):
    """Raised when an operation is invalid for the current session state."""

    def __init__(self, current_state: str, required_state: str):
        super().__init__(
            message=f"Invalid session state: current is '{current_state}', required '{required_state}'",
            code="INVALID_SESSION_STATE",
        )


class FriendRequestError(DomainError):
    """Raised for friend request related errors."""

    def __init__(self, message: str):
        super().__init__(message=message, code="FRIEND_REQUEST_ERROR")

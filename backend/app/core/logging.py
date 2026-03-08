"""
Structured logging configuration for the application.
"""
import json
import logging
import sys
from contextvars import ContextVar
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

# Context variable for request ID
request_id_var: ContextVar[str] = ContextVar("request_id", default="")


class JSONFormatter(logging.Formatter):
    """JSON log formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_var.get(""),
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields
        if hasattr(record, "extra"):
            log_data.update(record.extra)

        return json.dumps(log_data)


def setup_logging(log_level: str = "INFO") -> None:
    """
    Configure structured logging for the application.

    Args:
        log_level: Minimum log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Create root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create console handler with JSON formatting
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(console_handler)

    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the given name.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


class LoggingContextAdapter(logging.LoggerAdapter):
    """Logger adapter that adds context to log records."""

    def process(self, msg: str, kwargs: dict[str, Any]) -> tuple:
        extra = kwargs.get("extra", {})
        extra["request_id"] = request_id_var.get("")
        kwargs["extra"] = extra
        return msg, kwargs


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses."""

    def __init__(self, app):
        super().__init__(app)
        self.logger = get_logger("http")

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Generate request ID
        request_id = str(uuid4())[:8]
        request_id_var.set(request_id)

        # Record start time
        start_time = datetime.now(UTC)

        # Log request
        self.logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query": str(request.query_params),
                "client_ip": request.client.host if request.client else None,
            },
        )

        try:
            response = await call_next(request)

            # Calculate duration
            duration_ms = (datetime.now(UTC) - start_time).total_seconds() * 1000

            # Log response
            self.logger.info(
                f"Request completed: {request.method} {request.url.path} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": round(duration_ms, 2),
                },
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            # Calculate duration
            duration_ms = (datetime.now(UTC) - start_time).total_seconds() * 1000

            # Log error
            self.logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e),
                    "duration_ms": round(duration_ms, 2),
                },
                exc_info=True,
            )
            raise


# Event loggers for specific domains
def log_session_event(
    event_type: str,
    user_id: str,
    session_id: str,
    data: dict[str, Any] | None = None,
) -> None:
    """Log a session-related event."""
    logger = get_logger("sessions")
    logger.info(
        f"Session event: {event_type}",
        extra={
            "event_type": event_type,
            "user_id": user_id,
            "session_id": session_id,
            **(data or {}),
        },
    )


def log_auth_event(
    event_type: str,
    user_id: str | None = None,
    email: str | None = None,
    success: bool = True,
    reason: str | None = None,
) -> None:
    """Log an authentication-related event."""
    logger = get_logger("auth")
    level = logging.INFO if success else logging.WARNING
    logger.log(
        level,
        f"Auth event: {event_type}",
        extra={
            "event_type": event_type,
            "user_id": user_id,
            "email": email,
            "success": success,
            "reason": reason,
        },
    )


def log_anti_cheat_event(
    event_type: str,
    user_id: str,
    session_id: str,
    flags: list,
    confidence: float,
) -> None:
    """Log an anti-cheat detection event."""
    logger = get_logger("anti_cheat")
    logger.warning(
        f"Anti-cheat event: {event_type}",
        extra={
            "event_type": event_type,
            "user_id": user_id,
            "session_id": session_id,
            "flags": flags,
            "confidence": confidence,
        },
    )

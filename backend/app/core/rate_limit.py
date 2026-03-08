"""
Rate limiting middleware for FastAPI.
Uses an in-memory sliding window algorithm.
"""
import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware using sliding window algorithm.
    Limits requests per IP address for specific endpoints.
    """

    def __init__(self, app, limits: Dict[str, Tuple[int, int]] | None = None):
        """
        Initialize rate limiter.

        Args:
            app: FastAPI application
            limits: Dict mapping endpoint patterns to (max_requests, window_seconds)
                   Example: {"/api/v1/auth/login": (5, 900)}  # 5 requests per 15 min
        """
        super().__init__(app)
        self.limits = limits or {}
        self.requests: Dict[str, Dict[str, List[float]]] = defaultdict(lambda: defaultdict(list))

    def get_client_ip(self, request: Request) -> str:
        """Get the client IP address from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def get_limit_for_path(self, path: str) -> Tuple[int, int] | None:
        """Get rate limit for a given path."""
        for pattern, limit in self.limits.items():
            if pattern in path:
                return limit
        return None

    def is_rate_limited(self, client_ip: str, path: str, limit: Tuple[int, int]) -> Tuple[bool, int]:
        """
        Check if client is rate limited.

        Returns:
            Tuple of (is_limited, retry_after_seconds)
        """
        max_requests, window_seconds = limit
        current_time = time.time()
        window_start = current_time - window_seconds

        # Clean old requests
        requests = self.requests[path][client_ip]
        self.requests[path][client_ip] = [t for t in requests if t > window_start]

        # Check if limited
        if len(self.requests[path][client_ip]) >= max_requests:
            oldest_in_window = min(self.requests[path][client_ip])
            retry_after = int(oldest_in_window + window_seconds - current_time)
            return True, max(1, retry_after)

        # Record this request
        self.requests[path][client_ip].append(current_time)
        return False, 0

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Process the request with rate limiting."""
        path = request.url.path
        limit = self.get_limit_for_path(path)

        if limit:
            client_ip = self.get_client_ip(request)
            is_limited, retry_after = self.is_rate_limited(client_ip, path, limit)

            if is_limited:
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many requests. Please try again in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)},
                )

        return await call_next(request)


# Default rate limits for critical endpoints
DEFAULT_RATE_LIMITS = {
    "/api/v1/auth/login": (5, 900),  # 5 attempts per 15 minutes
    "/api/v1/auth/register": (3, 3600),  # 3 registrations per hour
    "/api/v1/auth/forgot-password": (3, 3600),  # 3 requests per hour
    "/api/v1/sessions": (30, 3600),  # 30 sessions per hour
    "/api/v1/public-sessions/queue": (10, 600),  # 10 queue joins per 10 min
}

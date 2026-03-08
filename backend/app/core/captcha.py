"""
CAPTCHA validation service for bot protection.
Supports hCaptcha and reCAPTCHA v3.
"""
import httpx
from dataclasses import dataclass
from typing import Optional
from enum import Enum

from app.core.config import get_settings


class CaptchaProvider(Enum):
    """Supported CAPTCHA providers."""
    HCAPTCHA = "hcaptcha"
    RECAPTCHA = "recaptcha"
    NONE = "none"  # For development/testing


@dataclass
class CaptchaResult:
    """Result of CAPTCHA verification."""
    success: bool
    score: Optional[float] = None  # reCAPTCHA v3 score
    error_codes: list = None
    hostname: Optional[str] = None

    def __post_init__(self):
        if self.error_codes is None:
            self.error_codes = []


class CaptchaService:
    """
    Service for validating CAPTCHA responses.

    Supports:
    - hCaptcha
    - reCAPTCHA v3
    - Development mode (always passes)
    """

    HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify"
    RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"

    # Minimum acceptable score for reCAPTCHA v3 (0.0 to 1.0)
    MIN_RECAPTCHA_SCORE = 0.5

    def __init__(self):
        self.settings = get_settings()
        self._provider = self._get_provider()

    def _get_provider(self) -> CaptchaProvider:
        """Determine which CAPTCHA provider to use."""
        if hasattr(self.settings, 'captcha_provider'):
            provider = self.settings.captcha_provider.lower()
            if provider == "hcaptcha":
                return CaptchaProvider.HCAPTCHA
            elif provider == "recaptcha":
                return CaptchaProvider.RECAPTCHA

        # Default to none in development
        if hasattr(self.settings, 'environment') and self.settings.environment == "development":
            return CaptchaProvider.NONE

        return CaptchaProvider.NONE

    async def verify(
        self,
        token: str,
        remote_ip: Optional[str] = None,
    ) -> CaptchaResult:
        """
        Verify a CAPTCHA token.

        Args:
            token: The CAPTCHA response token from the client
            remote_ip: Optional client IP address

        Returns:
            CaptchaResult with verification status
        """
        if self._provider == CaptchaProvider.NONE:
            return CaptchaResult(success=True, score=1.0)

        if self._provider == CaptchaProvider.HCAPTCHA:
            return await self._verify_hcaptcha(token, remote_ip)

        if self._provider == CaptchaProvider.RECAPTCHA:
            return await self._verify_recaptcha(token, remote_ip)

        return CaptchaResult(success=False, error_codes=["unknown-provider"])

    async def _verify_hcaptcha(
        self,
        token: str,
        remote_ip: Optional[str] = None,
    ) -> CaptchaResult:
        """Verify hCaptcha token."""
        secret = getattr(self.settings, 'hcaptcha_secret', None)
        if not secret:
            return CaptchaResult(success=False, error_codes=["missing-secret"])

        data = {
            "secret": secret,
            "response": token,
        }
        if remote_ip:
            data["remoteip"] = remote_ip

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.HCAPTCHA_VERIFY_URL, data=data)
                result = response.json()

                return CaptchaResult(
                    success=result.get("success", False),
                    error_codes=result.get("error-codes", []),
                    hostname=result.get("hostname"),
                )
            except Exception as e:
                return CaptchaResult(
                    success=False,
                    error_codes=["verification-failed", str(e)],
                )

    async def _verify_recaptcha(
        self,
        token: str,
        remote_ip: Optional[str] = None,
    ) -> CaptchaResult:
        """Verify reCAPTCHA v3 token."""
        secret = getattr(self.settings, 'recaptcha_secret', None)
        if not secret:
            return CaptchaResult(success=False, error_codes=["missing-secret"])

        data = {
            "secret": secret,
            "response": token,
        }
        if remote_ip:
            data["remoteip"] = remote_ip

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.RECAPTCHA_VERIFY_URL, data=data)
                result = response.json()

                success = result.get("success", False)
                score = result.get("score", 0)

                # For reCAPTCHA v3, also check the score
                if success and score < self.MIN_RECAPTCHA_SCORE:
                    success = False

                return CaptchaResult(
                    success=success,
                    score=score,
                    error_codes=result.get("error-codes", []),
                    hostname=result.get("hostname"),
                )
            except Exception as e:
                return CaptchaResult(
                    success=False,
                    error_codes=["verification-failed", str(e)],
                )

    def is_enabled(self) -> bool:
        """Check if CAPTCHA verification is enabled."""
        return self._provider != CaptchaProvider.NONE


# FastAPI dependency
async def verify_captcha(token: Optional[str] = None) -> CaptchaResult:
    """
    FastAPI dependency for CAPTCHA verification.

    Usage:
        @router.post("/register")
        async def register(
            captcha_result: CaptchaResult = Depends(verify_captcha),
        ):
            if not captcha_result.success:
                raise HTTPException(400, "CAPTCHA verification failed")
    """
    service = CaptchaService()

    if not service.is_enabled():
        return CaptchaResult(success=True)

    if not token:
        return CaptchaResult(success=False, error_codes=["missing-token"])

    return await service.verify(token)


# Global instance
captcha_service = CaptchaService()

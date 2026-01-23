"""
Email service for sending transactional emails.
"""
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import get_settings

settings = get_settings()


class EmailService:
    """Service for sending emails via SMTP."""

    def __init__(self):
        self._host = settings.email_host
        self._port = settings.email_port
        self._username = settings.email_host_user
        self._password = settings.email_host_password
        self._from_email = settings.email_from or settings.email_host_user

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: str | None = None,
    ) -> bool:
        """
        Send an email.

        Args:
            to_email: Recipient email address.
            subject: Email subject.
            body_html: HTML body content.
            body_text: Plain text body content (optional).

        Returns:
            True if sent successfully, False otherwise.
        """
        if not self._host or not self._username:
            return False

        message = MIMEMultipart("alternative")
        message["From"] = self._from_email
        message["To"] = to_email
        message["Subject"] = subject

        if body_text:
            message.attach(MIMEText(body_text, "plain"))
        message.attach(MIMEText(body_html, "html"))

        try:
            await aiosmtplib.send(
                message,
                hostname=self._host,
                port=self._port,
                username=self._username,
                password=self._password,
                start_tls=True,
            )
            return True
        except Exception:
            return False

    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """
        Send a password reset email.

        Args:
            to_email: Recipient email.
            reset_token: Password reset token.

        Returns:
            True if sent successfully.
        """
        reset_url = f"http://localhost:5173/reset-password?token={reset_token}"

        subject = "Reset Your Hakinga Password"

        body_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5cf6;">Password Reset Request</h2>
            <p>You requested to reset your password for your Hakinga account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}"
                   style="background-color: #8b5cf6; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #666; word-break: break-all;">{reset_url}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 24 hours. If you did not request this reset,
                please ignore this email.
            </p>
        </body>
        </html>
        """

        body_text = f"""
        Password Reset Request

        You requested to reset your password for your Hakinga account.

        Click this link to reset your password:
        {reset_url}

        This link will expire in 24 hours. If you did not request this reset,
        please ignore this email.
        """

        return await self.send_email(to_email, subject, body_html, body_text)

    async def send_welcome_email(self, to_email: str, username: str) -> bool:
        """
        Send a welcome email to new users.

        Args:
            to_email: Recipient email.
            username: User's username.

        Returns:
            True if sent successfully.
        """
        subject = "Welcome to Hakinga!"

        body_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5cf6;">Welcome to Hakinga, {username}!</h2>
            <p>Thank you for joining our typing practice community.</p>
            <p>Here's what you can do:</p>
            <ul>
                <li>Practice solo to improve your typing speed</li>
                <li>Challenge friends in private sessions</li>
                <li>Compete on the global leaderboard</li>
                <li>Unlock achievements as you progress</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/dashboard"
                   style="background-color: #8b5cf6; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                    Start Typing
                </a>
            </p>
            <p>Happy typing!</p>
            <p>The Hakinga Team</p>
        </body>
        </html>
        """

        body_text = f"""
        Welcome to Hakinga, {username}!

        Thank you for joining our typing practice community.

        Here's what you can do:
        - Practice solo to improve your typing speed
        - Challenge friends in private sessions
        - Compete on the global leaderboard
        - Unlock achievements as you progress

        Happy typing!
        The Hakinga Team
        """

        return await self.send_email(to_email, subject, body_html, body_text)

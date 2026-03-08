"""
SQLAlchemy database models.

ORM models mapping to PostgreSQL tables.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.entities.friend import FriendRequestStatus
from app.domain.entities.private_session import PrivateSessionStatus
from app.domain.entities.progression import RankTier
from app.domain.entities.typing_session import SessionMode
from app.domain.entities.typing_text import Difficulty, TextLength
from app.infrastructure.database.base import Base, TimestampMixin


class UserModel(Base, TimestampMixin):
    """User database model."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    avg_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    avg_accuracy: Mapped[float] = mapped_column(Float, default=100.0)
    best_wpm: Mapped[int] = mapped_column(Integer, default=0)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0)
    total_time_typed: Mapped[int] = mapped_column(Integer, default=0)
    total_characters_typed: Mapped[int] = mapped_column(Integer, default=0)

    sessions: Mapped[list["TypingSessionModel"]] = relationship(back_populates="user")
    settings: Mapped[Optional["UserSettingsModel"]] = relationship(back_populates="user")
    achievements: Mapped[list["UserAchievementModel"]] = relationship(back_populates="user")


class UserSettingsModel(Base, TimestampMixin):
    """User settings database model."""

    __tablename__ = "user_settings"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    sound_effects: Mapped[bool] = mapped_column(Boolean, default=True)
    notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    show_wpm_live: Mapped[bool] = mapped_column(Boolean, default=True)
    show_accuracy_live: Mapped[bool] = mapped_column(Boolean, default=True)
    theme: Mapped[str] = mapped_column(String(20), default="dark")
    keyboard_layout: Mapped[str] = mapped_column(String(20), default="qwerty")

    user: Mapped["UserModel"] = relationship(back_populates="settings")


class TypingTextModel(Base, TimestampMixin):
    """Typing text database model."""

    __tablename__ = "typing_texts"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    content: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[Difficulty] = mapped_column(Enum(Difficulty))
    length: Mapped[TextLength] = mapped_column(Enum(TextLength))
    word_count: Mapped[int] = mapped_column(Integer)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class TypingSessionModel(Base):
    """Typing session database model."""

    __tablename__ = "typing_sessions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    # text_id is nullable to support external quotes (e.g., from type.fit API)
    text_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("typing_texts.id"), nullable=True
    )
    text_content: Mapped[str] = mapped_column(Text)
    wpm: Mapped[int] = mapped_column(Integer)
    raw_wpm: Mapped[int] = mapped_column(Integer)
    accuracy: Mapped[float] = mapped_column(Float)
    errors: Mapped[int] = mapped_column(Integer)
    total_characters: Mapped[int] = mapped_column(Integer)
    correct_characters: Mapped[int] = mapped_column(Integer)
    duration: Mapped[int] = mapped_column(Integer)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    mode: Mapped[SessionMode] = mapped_column(Enum(SessionMode))
    wpm_history: Mapped[list] = mapped_column(JSONB, default=list)
    private_session_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )
    competition_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    # Gamification fields
    max_combo: Mapped[int] = mapped_column(Integer, default=0)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["UserModel"] = relationship(back_populates="sessions")


class AchievementModel(Base, TimestampMixin):
    """Achievement definition database model."""

    __tablename__ = "achievements"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str] = mapped_column(String(500))
    icon: Mapped[str] = mapped_column(String(50))
    max_progress: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    user_achievements: Mapped[list["UserAchievementModel"]] = relationship(
        back_populates="achievement"
    )


class UserAchievementModel(Base, TimestampMixin):
    """User achievement progress database model."""

    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    achievement_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE")
    )
    progress: Mapped[int] = mapped_column(Integer, default=0)
    unlocked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["UserModel"] = relationship(back_populates="achievements")
    achievement: Mapped["AchievementModel"] = relationship(back_populates="user_achievements")


class FriendRequestModel(Base, TimestampMixin):
    """Friend request database model."""

    __tablename__ = "friend_requests"
    __table_args__ = (
        UniqueConstraint("from_user_id", "to_user_id", name="uq_friend_request"),
    )

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    from_user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    to_user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[FriendRequestStatus] = mapped_column(
        Enum(FriendRequestStatus), default=FriendRequestStatus.PENDING
    )
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    from_user: Mapped["UserModel"] = relationship(foreign_keys=[from_user_id])
    to_user: Mapped["UserModel"] = relationship(foreign_keys=[to_user_id])


class FriendshipModel(Base, TimestampMixin):
    """Friendship database model."""

    __tablename__ = "friendships"
    __table_args__ = (UniqueConstraint("user_id", "friend_id", name="uq_friendship"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    friend_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )


class PrivateSessionModel(Base, TimestampMixin):
    """Private session database model."""

    __tablename__ = "private_sessions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(6), unique=True, index=True)
    host_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    text_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("typing_texts.id"))
    status: Mapped[PrivateSessionStatus] = mapped_column(
        Enum(PrivateSessionStatus), default=PrivateSessionStatus.WAITING
    )
    max_players: Mapped[int] = mapped_column(Integer, default=4)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    host: Mapped["UserModel"] = relationship()
    text: Mapped["TypingTextModel"] = relationship()
    players: Mapped[list["SessionPlayerModel"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class SessionPlayerModel(Base, TimestampMixin):
    """Session player database model."""

    __tablename__ = "session_players"
    __table_args__ = (UniqueConstraint("session_id", "user_id", name="uq_session_player"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    session_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("private_sessions.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    username: Mapped[str] = mapped_column(String(50))
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_host: Mapped[bool] = mapped_column(Boolean, default=False)
    is_ready: Mapped[bool] = mapped_column(Boolean, default=False)
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    wpm: Mapped[int] = mapped_column(Integer, default=0)
    accuracy: Mapped[float] = mapped_column(Float, default=100.0)
    position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    session: Mapped["PrivateSessionModel"] = relationship(back_populates="players")
    user: Mapped["UserModel"] = relationship()


class UserProgressModel(Base, TimestampMixin):
    """User progression database model for XP, levels, and ranking."""

    __tablename__ = "user_progress"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    current_level: Mapped[int] = mapped_column(Integer, default=1)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    best_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_session_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    rank_tier: Mapped[RankTier] = mapped_column(
        Enum(RankTier), default=RankTier.UNRANKED
    )
    mmr: Mapped[int] = mapped_column(Integer, default=1000)

    user: Mapped["UserModel"] = relationship()

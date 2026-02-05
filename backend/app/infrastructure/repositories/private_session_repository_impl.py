"""
Private session repository PostgreSQL implementation.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.private_session import (
    PrivateSession,
    PrivateSessionStatus,
    SessionPlayer,
)
from app.domain.repositories.private_session_repository import PrivateSessionRepository
from app.infrastructure.database.models import PrivateSessionModel, SessionPlayerModel


class PostgresPrivateSessionRepository(PrivateSessionRepository):
    """PostgreSQL implementation of PrivateSessionRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _player_to_entity(self, model: SessionPlayerModel) -> SessionPlayer:
        """Convert player model to entity."""
        return SessionPlayer(
            id=model.id,
            user_id=model.user_id,
            username=model.username,
            avatar=model.avatar,
            is_host=model.is_host,
            is_ready=model.is_ready,
            progress=model.progress,
            wpm=model.wpm,
            accuracy=model.accuracy,
            position=model.position,
            finished_at=model.finished_at,
        )

    def _to_entity(self, model: PrivateSessionModel) -> PrivateSession:
        """Convert session model to entity."""
        players = [self._player_to_entity(p) for p in model.players]

        return PrivateSession(
            id=model.id,
            code=model.code,
            host_id=model.host_id,
            text_id=model.text_id,
            status=model.status,
            max_players=model.max_players,
            created_at=model.created_at,
            players=players,
            started_at=model.started_at,
            finished_at=model.finished_at,
        )

    async def create(self, session: PrivateSession) -> PrivateSession:
        model = PrivateSessionModel(
            id=session.id,
            code=session.code,
            host_id=session.host_id,
            text_id=session.text_id,
            status=session.status,
            max_players=session.max_players,
            created_at=session.created_at,
        )

        for player in session.players:
            player_model = SessionPlayerModel(
                id=player.id,
                session_id=session.id,
                user_id=player.user_id,
                username=player.username,
                avatar=player.avatar,
                is_host=player.is_host,
                is_ready=player.is_ready,
            )
            model.players.append(player_model)

        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model, ["players"])
        return self._to_entity(model)

    async def get_by_id(self, session_id: UUID) -> Optional[PrivateSession]:
        result = await self._session.execute(
            select(PrivateSessionModel)
            .options(selectinload(PrivateSessionModel.players))
            .where(PrivateSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_code(self, code: str) -> Optional[PrivateSession]:
        result = await self._session.execute(
            select(PrivateSessionModel)
            .options(selectinload(PrivateSessionModel.players))
            .where(PrivateSessionModel.code == code.upper())
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, session: PrivateSession) -> PrivateSession:
        result = await self._session.execute(
            select(PrivateSessionModel)
            .options(selectinload(PrivateSessionModel.players))
            .where(PrivateSessionModel.id == session.id)
        )
        model = result.scalar_one()

        model.status = session.status
        model.started_at = session.started_at
        model.finished_at = session.finished_at

        existing_player_ids = {p.user_id for p in model.players}
        new_player_ids = {p.user_id for p in session.players}

        for player_model in list(model.players):
            if player_model.user_id not in new_player_ids:
                model.players.remove(player_model)

        for player in session.players:
            if player.user_id in existing_player_ids:
                for pm in model.players:
                    if pm.user_id == player.user_id:
                        pm.is_ready = player.is_ready
                        pm.progress = player.progress
                        pm.wpm = player.wpm
                        pm.accuracy = player.accuracy
                        pm.position = player.position
                        pm.finished_at = player.finished_at
                        break
            else:
                player_model = SessionPlayerModel(
                    id=player.id,
                    session_id=session.id,
                    user_id=player.user_id,
                    username=player.username,
                    avatar=player.avatar,
                    is_host=player.is_host,
                    is_ready=player.is_ready,
                )
                model.players.append(player_model)

        await self._session.commit()
        await self._session.refresh(model, ["players"])
        return self._to_entity(model)

    async def delete(self, session_id: UUID) -> bool:
        result = await self._session.execute(
            select(PrivateSessionModel).where(PrivateSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()
            return True
        return False

    async def get_active_sessions_for_user(self, user_id: UUID) -> list[PrivateSession]:
        result = await self._session.execute(
            select(PrivateSessionModel)
            .options(selectinload(PrivateSessionModel.players))
            .join(SessionPlayerModel)
            .where(SessionPlayerModel.user_id == user_id)
            .where(
                PrivateSessionModel.status.in_(
                    [PrivateSessionStatus.WAITING, PrivateSessionStatus.COUNTDOWN]
                )
            )
        )
        return [self._to_entity(model) for model in result.scalars().unique().all()]

    async def cleanup_expired_sessions(self, max_age_minutes: int = 30) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=max_age_minutes)

        result = await self._session.execute(
            delete(PrivateSessionModel)
            .where(PrivateSessionModel.status == PrivateSessionStatus.WAITING)
            .where(PrivateSessionModel.created_at < cutoff)
        )
        await self._session.commit()
        return result.rowcount

    async def code_exists(self, code: str) -> bool:
        result = await self._session.execute(
            select(PrivateSessionModel.id).where(PrivateSessionModel.code == code.upper())
        )
        return result.scalar_one_or_none() is not None

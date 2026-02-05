"""
Typing session repository PostgreSQL implementation.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.typing_session import SessionMode, TypingSession, WpmDataPoint
from app.domain.repositories.session_repository import SessionRepository
from app.infrastructure.database.models import TypingSessionModel


class PostgresSessionRepository(SessionRepository):
    """PostgreSQL implementation of SessionRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: TypingSessionModel) -> TypingSession:
        """Convert database model to domain entity."""
        wpm_history = [
            WpmDataPoint(time=p["time"], wpm=p["wpm"], accuracy=p["accuracy"])
            for p in (model.wpm_history or [])
        ]

        return TypingSession(
            id=model.id,
            user_id=model.user_id,
            text_id=model.text_id,
            text_content=model.text_content,
            wpm=model.wpm,
            raw_wpm=model.raw_wpm,
            accuracy=model.accuracy,
            errors=model.errors,
            total_characters=model.total_characters,
            correct_characters=model.correct_characters,
            duration=model.duration,
            started_at=model.started_at,
            completed_at=model.completed_at,
            mode=model.mode,
            wpm_history=wpm_history,
            private_session_id=model.private_session_id,
            competition_id=model.competition_id,
        )

    def _to_model(self, entity: TypingSession) -> TypingSessionModel:
        """Convert domain entity to database model."""
        wpm_history = [
            {"time": p.time, "wpm": p.wpm, "accuracy": p.accuracy} for p in entity.wpm_history
        ]

        return TypingSessionModel(
            id=entity.id,
            user_id=entity.user_id,
            text_id=entity.text_id,
            text_content=entity.text_content,
            wpm=entity.wpm,
            raw_wpm=entity.raw_wpm,
            accuracy=entity.accuracy,
            errors=entity.errors,
            total_characters=entity.total_characters,
            correct_characters=entity.correct_characters,
            duration=entity.duration,
            started_at=entity.started_at,
            completed_at=entity.completed_at,
            mode=entity.mode,
            wpm_history=wpm_history,
            private_session_id=entity.private_session_id,
            competition_id=entity.competition_id,
        )

    async def create(self, session: TypingSession) -> TypingSession:
        model = self._to_model(session)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, session_id: UUID) -> Optional[TypingSession]:
        result = await self._session.execute(
            select(TypingSessionModel).where(TypingSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_user_sessions(
        self,
        user_id: UUID,
        mode: Optional[SessionMode] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: str = "completed_at",
        sort_order: str = "desc",
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[TypingSession], int]:
        query = select(TypingSessionModel).where(TypingSessionModel.user_id == user_id)
        count_query = select(func.count(TypingSessionModel.id)).where(
            TypingSessionModel.user_id == user_id
        )

        if mode:
            query = query.where(TypingSessionModel.mode == mode)
            count_query = count_query.where(TypingSessionModel.mode == mode)

        if start_date:
            query = query.where(TypingSessionModel.completed_at >= start_date)
            count_query = count_query.where(TypingSessionModel.completed_at >= start_date)

        if end_date:
            query = query.where(TypingSessionModel.completed_at <= end_date)
            count_query = count_query.where(TypingSessionModel.completed_at <= end_date)

        sort_column = getattr(TypingSessionModel, sort_by, TypingSessionModel.completed_at)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        query = query.offset(offset).limit(limit)

        result = await self._session.execute(query)
        count_result = await self._session.execute(count_query)

        sessions = [self._to_entity(model) for model in result.scalars().all()]
        total = count_result.scalar() or 0

        return sessions, total

    async def get_user_stats(self, user_id: UUID) -> dict:
        result = await self._session.execute(
            select(
                func.count(TypingSessionModel.id).label("total_sessions"),
                func.avg(TypingSessionModel.wpm).label("avg_wpm"),
                func.avg(TypingSessionModel.accuracy).label("avg_accuracy"),
                func.max(TypingSessionModel.wpm).label("best_wpm"),
                func.sum(TypingSessionModel.duration).label("total_time_typed"),
                func.sum(TypingSessionModel.total_characters).label("total_characters"),
            ).where(TypingSessionModel.user_id == user_id)
        )
        row = result.one()

        return {
            "total_sessions": row.total_sessions or 0,
            "avg_wpm": round(row.avg_wpm or 0, 1),
            "avg_accuracy": round(row.avg_accuracy or 100, 1),
            "best_wpm": row.best_wpm or 0,
            "total_time_typed": row.total_time_typed or 0,
            "total_characters": row.total_characters or 0,
        }

    async def get_recent_sessions(
        self,
        user_id: UUID,
        limit: int = 10,
    ) -> list[TypingSession]:
        result = await self._session.execute(
            select(TypingSessionModel)
            .where(TypingSessionModel.user_id == user_id)
            .order_by(TypingSessionModel.completed_at.desc())
            .limit(limit)
        )
        return [self._to_entity(model) for model in result.scalars().all()]

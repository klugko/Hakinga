"""
Leaderboard repository PostgreSQL implementation.
"""
from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.repositories.leaderboard_repository import LeaderboardEntry, LeaderboardRepository
from app.infrastructure.database.models import TypingSessionModel, UserModel


class PostgresLeaderboardRepository(LeaderboardRepository):
    """PostgreSQL implementation of LeaderboardRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_global_leaderboard(
        self,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[LeaderboardEntry], int]:
        subquery = select(
            TypingSessionModel.user_id,
            func.max(TypingSessionModel.wpm).label("best_wpm"),
            func.avg(TypingSessionModel.accuracy).label("avg_accuracy"),
            func.count(TypingSessionModel.id).label("sessions_count"),
        ).group_by(TypingSessionModel.user_id)

        if start_date:
            subquery = subquery.where(TypingSessionModel.completed_at >= start_date)
        if end_date:
            subquery = subquery.where(TypingSessionModel.completed_at <= end_date)

        subquery = subquery.subquery()

        query = (
            select(
                UserModel.id,
                UserModel.username,
                UserModel.avatar,
                subquery.c.best_wpm,
                subquery.c.avg_accuracy,
                subquery.c.sessions_count,
            )
            .join(subquery, UserModel.id == subquery.c.user_id)
            .where(UserModel.is_active.is_(True))
            .order_by(subquery.c.best_wpm.desc())
        )

        count_query = select(func.count()).select_from(
            select(TypingSessionModel.user_id)
            .group_by(TypingSessionModel.user_id)
            .subquery()
        )

        query = query.offset(offset).limit(limit)

        result = await self._session.execute(query)
        count_result = await self._session.execute(count_query)

        entries = []
        for idx, row in enumerate(result.all(), start=offset + 1):
            entries.append(
                LeaderboardEntry(
                    rank=idx,
                    user_id=row.id,
                    username=row.username,
                    avatar=row.avatar,
                    wpm=row.best_wpm or 0,
                    accuracy=round(row.avg_accuracy or 0, 1),
                    sessions_played=row.sessions_count or 0,
                )
            )

        total = count_result.scalar() or 0
        return entries, total

    async def get_user_rank(
        self,
        user_id: UUID,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> LeaderboardEntry | None:
        user_stats_query = select(
            func.max(TypingSessionModel.wpm).label("best_wpm"),
            func.avg(TypingSessionModel.accuracy).label("avg_accuracy"),
            func.count(TypingSessionModel.id).label("sessions_count"),
        ).where(TypingSessionModel.user_id == user_id)

        if start_date:
            user_stats_query = user_stats_query.where(
                TypingSessionModel.completed_at >= start_date
            )
        if end_date:
            user_stats_query = user_stats_query.where(TypingSessionModel.completed_at <= end_date)

        stats_result = await self._session.execute(user_stats_query)
        stats_row = stats_result.one()

        if not stats_row.best_wpm:
            return None

        rank_query = select(func.count(TypingSessionModel.user_id.distinct())).where(
            TypingSessionModel.wpm > stats_row.best_wpm
        )

        if start_date:
            rank_query = rank_query.where(TypingSessionModel.completed_at >= start_date)
        if end_date:
            rank_query = rank_query.where(TypingSessionModel.completed_at <= end_date)

        rank_result = await self._session.execute(rank_query)
        users_above = rank_result.scalar() or 0

        user_result = await self._session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = user_result.scalar_one_or_none()

        if not user:
            return None

        return LeaderboardEntry(
            rank=users_above + 1,
            user_id=user.id,
            username=user.username,
            avatar=user.avatar,
            wpm=stats_row.best_wpm,
            accuracy=round(stats_row.avg_accuracy or 0, 1),
            sessions_played=stats_row.sessions_count or 0,
        )

    async def get_friends_leaderboard(
        self,
        user_id: UUID,
        friend_ids: list[UUID],
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[LeaderboardEntry]:
        all_user_ids = [user_id] + friend_ids

        subquery = (
            select(
                TypingSessionModel.user_id,
                func.max(TypingSessionModel.wpm).label("best_wpm"),
                func.avg(TypingSessionModel.accuracy).label("avg_accuracy"),
                func.count(TypingSessionModel.id).label("sessions_count"),
            )
            .where(TypingSessionModel.user_id.in_(all_user_ids))
            .group_by(TypingSessionModel.user_id)
        )

        if start_date:
            subquery = subquery.where(TypingSessionModel.completed_at >= start_date)
        if end_date:
            subquery = subquery.where(TypingSessionModel.completed_at <= end_date)

        subquery = subquery.subquery()

        query = (
            select(
                UserModel.id,
                UserModel.username,
                UserModel.avatar,
                subquery.c.best_wpm,
                subquery.c.avg_accuracy,
                subquery.c.sessions_count,
            )
            .join(subquery, UserModel.id == subquery.c.user_id)
            .order_by(subquery.c.best_wpm.desc())
        )

        result = await self._session.execute(query)

        entries = []
        for idx, row in enumerate(result.all(), start=1):
            entries.append(
                LeaderboardEntry(
                    rank=idx,
                    user_id=row.id,
                    username=row.username,
                    avatar=row.avatar,
                    wpm=row.best_wpm or 0,
                    accuracy=round(row.avg_accuracy or 0, 1),
                    sessions_played=row.sessions_count or 0,
                )
            )

        return entries

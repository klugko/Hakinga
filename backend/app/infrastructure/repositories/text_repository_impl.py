"""
Typing text repository PostgreSQL implementation.
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.typing_text import Difficulty, TextLength, TypingText
from app.domain.repositories.text_repository import TextRepository
from app.infrastructure.database.models import TypingTextModel


class PostgresTextRepository(TextRepository):
    """PostgreSQL implementation of TextRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: TypingTextModel) -> TypingText:
        """Convert database model to domain entity."""
        return TypingText(
            id=model.id,
            content=model.content,
            difficulty=model.difficulty,
            length=model.length,
            word_count=model.word_count,
            category=model.category,
            author=model.author,
            is_active=model.is_active,
        )

    def _to_model(self, entity: TypingText) -> TypingTextModel:
        """Convert domain entity to database model."""
        return TypingTextModel(
            id=entity.id,
            content=entity.content,
            difficulty=entity.difficulty,
            length=entity.length,
            word_count=entity.word_count,
            category=entity.category,
            author=entity.author,
            is_active=entity.is_active,
        )

    async def create(self, text: TypingText) -> TypingText:
        model = self._to_model(text)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, text_id: UUID) -> Optional[TypingText]:
        result = await self._session.execute(
            select(TypingTextModel).where(TypingTextModel.id == text_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_random(
        self,
        difficulty: Optional[Difficulty] = None,
        length: Optional[TextLength] = None,
    ) -> Optional[TypingText]:
        query = select(TypingTextModel).where(TypingTextModel.is_active.is_(True))

        if difficulty:
            query = query.where(TypingTextModel.difficulty == difficulty)
        if length:
            query = query.where(TypingTextModel.length == length)

        query = query.order_by(func.random()).limit(1)

        result = await self._session.execute(query)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(
        self,
        difficulty: Optional[Difficulty] = None,
        length: Optional[TextLength] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[TypingText], int]:
        query = select(TypingTextModel).where(TypingTextModel.is_active.is_(True))
        count_query = select(func.count(TypingTextModel.id)).where(
            TypingTextModel.is_active.is_(True)
        )

        if difficulty:
            query = query.where(TypingTextModel.difficulty == difficulty)
            count_query = count_query.where(TypingTextModel.difficulty == difficulty)

        if length:
            query = query.where(TypingTextModel.length == length)
            count_query = count_query.where(TypingTextModel.length == length)

        query = query.offset(offset).limit(limit)

        result = await self._session.execute(query)
        count_result = await self._session.execute(count_query)

        texts = [self._to_entity(model) for model in result.scalars().all()]
        total = count_result.scalar() or 0

        return texts, total

    async def update(self, text: TypingText) -> TypingText:
        result = await self._session.execute(
            select(TypingTextModel).where(TypingTextModel.id == text.id)
        )
        model = result.scalar_one()

        model.content = text.content
        model.difficulty = text.difficulty
        model.length = text.length
        model.word_count = text.word_count
        model.category = text.category
        model.author = text.author
        model.is_active = text.is_active

        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, text_id: UUID) -> bool:
        result = await self._session.execute(
            select(TypingTextModel).where(TypingTextModel.id == text_id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.is_active = False
            await self._session.commit()
            return True
        return False

    async def bulk_create(self, texts: list[TypingText]) -> list[TypingText]:
        models = [self._to_model(text) for text in texts]
        self._session.add_all(models)
        await self._session.commit()
        for model in models:
            await self._session.refresh(model)
        return [self._to_entity(model) for model in models]

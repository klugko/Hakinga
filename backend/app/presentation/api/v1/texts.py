"""
Typing text API routes.
"""
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.services.text_service import TextService
from app.domain.exceptions import EntityNotFoundError
from app.presentation.api.v1.deps import get_text_service
from app.presentation.schemas.common import ApiResponse
from app.presentation.schemas.text import TextListResponse, TypingTextResponse

router = APIRouter()

# Cache for external quotes
_quotes_cache: list[dict] | None = None


@router.get("/quotes")
async def get_external_quotes() -> list[dict]:
    """Proxy endpoint for type.fit quotes API to avoid CORS issues."""
    global _quotes_cache

    if _quotes_cache is not None:
        return _quotes_cache

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://type.fit/api/quotes",
                timeout=10.0
            )
            response.raise_for_status()
            _quotes_cache = response.json()
            return _quotes_cache
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch quotes: {e!s}"
        )


@router.get("/random", response_model=ApiResponse[TypingTextResponse])
async def get_random_text(
    text_service: Annotated[TextService, Depends(get_text_service)],
    difficulty: str | None = Query(None, regex="^(easy|medium|hard)$"),
    length: str | None = Query(None, regex="^(short|medium|long)$"),
) -> ApiResponse[TypingTextResponse]:
    """Get a random typing text, optionally filtered by difficulty and length."""
    try:
        text = await text_service.get_random_text(difficulty=difficulty, length=length)
        return ApiResponse(
            data=TypingTextResponse(
                id=str(text.id),
                content=text.content,
                difficulty=text.difficulty.value,
                length=text.length.value,
                word_count=text.word_count,
                category=text.category,
                author=text.author,
            )
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get("", response_model=ApiResponse[TextListResponse])
async def list_texts(
    text_service: Annotated[TextService, Depends(get_text_service)],
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    difficulty: str | None = Query(None, regex="^(easy|medium|hard)$"),
    length: str | None = Query(None, regex="^(short|medium|long)$"),
) -> ApiResponse[TextListResponse]:
    """List all typing texts with optional filters."""
    result = await text_service.list_texts(
        page=page,
        limit=limit,
        difficulty=difficulty,
        length=length,
    )

    return ApiResponse(
        data=TextListResponse(
            texts=[
                TypingTextResponse(
                    id=t["id"],
                    content=t["content"],
                    difficulty=t["difficulty"],
                    length=t["length"],
                    word_count=t["word_count"],
                    category=t["category"],
                    author=t["author"],
                )
                for t in result["texts"]
            ],
            total=result["total"],
            page=result["page"],
            pages=result["pages"],
        )
    )


@router.get("/{text_id}", response_model=ApiResponse[TypingTextResponse])
async def get_text(
    text_id: str,
    text_service: Annotated[TextService, Depends(get_text_service)],
) -> ApiResponse[TypingTextResponse]:
    """Get a specific text by ID."""
    try:
        text = await text_service.get_text_by_id(text_id)
        return ApiResponse(
            data=TypingTextResponse(
                id=str(text.id),
                content=text.content,
                difficulty=text.difficulty.value,
                length=text.length.value,
                word_count=text.word_count,
                category=text.category,
                author=text.author,
            )
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

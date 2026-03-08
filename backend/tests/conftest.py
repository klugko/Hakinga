"""
Pytest configuration and fixtures for Hakinga tests.
"""
import pytest
from datetime import datetime, timedelta
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.infrastructure.database.base import Base


# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
def client() -> TestClient:
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
async def async_session() -> AsyncGenerator[AsyncSession, None]:
    """Create an async database session for testing."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session_maker() as session:
        yield session

    await engine.dispose()


@pytest.fixture
def mock_user() -> dict:
    """Create a mock user for testing."""
    return {
        "id": "test-user-123",
        "email": "test@example.com",
        "username": "testuser",
        "created_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_session_data() -> dict:
    """Create mock session data for testing."""
    return {
        "session_id": "session-123",
        "user_id": "test-user-123",
        "text_id": "text-456",
        "wpm": 65.5,
        "accuracy": 95.2,
        "duration_seconds": 120,
        "started_at": datetime.utcnow() - timedelta(minutes=2),
        "completed_at": datetime.utcnow(),
    }


@pytest.fixture
def mock_keystroke_data() -> list:
    """Create mock keystroke data for testing."""
    base_time = 0
    keystrokes = []
    text = "hello world"

    for i, char in enumerate(text):
        base_time += 100  # 100ms between keystrokes
        keystrokes.append({
            "timestamp_ms": base_time,
            "key": char,
            "expected_key": char,
            "correct": True,
            "time_since_last_ms": 100 if i > 0 else None,
            "position_in_text": i,
            "position_in_word": i % 6,
            "word_index": 0 if i < 5 else 1,
        })

    return keystrokes


@pytest.fixture
def mock_user_profile() -> dict:
    """Create a mock user profile for testing."""
    return {
        "user_id": "test-user-123",
        "skill_level": "intermediate",
        "avg_wpm": 55.0,
        "avg_accuracy": 92.0,
        "total_sessions": 25,
        "problematic_chars": ["q", "z", "x"],
        "problematic_bigrams": ["qu", "xc"],
        "weaknesses": ["Pinky finger weakness", "Number row"],
        "strengths": ["Good accuracy"],
    }


@pytest.fixture
def mock_session_history() -> list:
    """Create mock session history for testing."""
    from app.application.services.prediction_service import SessionRecord

    sessions = []
    base_date = datetime.utcnow() - timedelta(days=30)

    for i in range(20):
        sessions.append(SessionRecord(
            date=base_date + timedelta(days=i, hours=i % 8),
            wpm=50 + (i * 0.5),  # Gradually improving
            accuracy=90 + (i * 0.2),
            duration_seconds=120,
            difficulty="medium",
        ))

    return sessions


@pytest.fixture
def auth_headers() -> dict:
    """Create mock authentication headers."""
    return {"Authorization": "Bearer test-token-123"}

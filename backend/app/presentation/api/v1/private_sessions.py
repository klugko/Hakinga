"""
Private session API routes with WebSocket support.
"""
import asyncio
import secrets
from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.domain.entities.private_session import PrivateSessionStatus
from app.domain.entities.typing_text import Difficulty, TextLength
from app.infrastructure.database.models import (
    PrivateSessionModel,
    SessionPlayerModel,
    TypingTextModel,
)
from app.infrastructure.database.session import AsyncSessionLocal
from app.presentation.api.v1.deps import CurrentUser, DbSession
from app.presentation.schemas.common import ApiResponse

router = APIRouter()


class CreatePrivateSessionRequest(BaseModel):
    """Request to create a private session."""
    difficulty: str = "medium"
    length: str = "medium"
    max_players: int = 4


class JoinPrivateSessionRequest(BaseModel):
    """Request to join a private session."""
    code: str


class PrivateSessionResponse(BaseModel):
    """Response for private session."""
    id: str
    code: str
    host_id: str
    host_name: str
    text_id: str
    text_content: str
    text_difficulty: str
    status: str
    max_players: int
    players: list
    created_at: str


class PlayerResponse(BaseModel):
    """Response for a player in the session."""
    id: str
    username: str
    avatar: str | None
    is_host: bool
    is_ready: bool
    progress: float
    wpm: int
    accuracy: float
    position: int | None
    finished_at: str | None


class ConnectionManager:
    """Manages WebSocket connections for private sessions."""

    def __init__(self):
        self.active_connections: dict[str, dict[str, WebSocket]] = {}
        self.user_sessions: dict[str, str] = {}

    async def connect(self, websocket: WebSocket, session_code: str, user_id: str):
        """Connect a user to a session."""
        await websocket.accept()
        if session_code not in self.active_connections:
            self.active_connections[session_code] = {}
        self.active_connections[session_code][user_id] = websocket
        self.user_sessions[user_id] = session_code

    def disconnect(self, session_code: str, user_id: str):
        """Disconnect a user from a session."""
        if session_code in self.active_connections:
            self.active_connections[session_code].pop(user_id, None)
            if not self.active_connections[session_code]:
                del self.active_connections[session_code]
        self.user_sessions.pop(user_id, None)

    async def broadcast(self, session_code: str, message: dict, exclude_user: str | None = None):
        """Broadcast a message to all users in a session."""
        if session_code in self.active_connections:
            for user_id, connection in list(self.active_connections[session_code].items()):
                if exclude_user and user_id == exclude_user:
                    continue
                try:
                    await connection.send_json(message)
                except Exception:
                    self.disconnect(session_code, user_id)

    async def send_personal(self, session_code: str, user_id: str, message: dict):
        """Send a message to a specific user."""
        if session_code in self.active_connections:
            connection = self.active_connections[session_code].get(user_id)
            if connection:
                try:
                    await connection.send_json(message)
                except Exception:
                    self.disconnect(session_code, user_id)


manager = ConnectionManager()


def generate_session_code() -> str:
    """Generate a random 6-character session code."""
    return "".join(secrets.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(6))


@router.post("/create", response_model=ApiResponse[PrivateSessionResponse])
async def create_private_session(
    request: CreatePrivateSessionRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> ApiResponse[PrivateSessionResponse]:
    """Create a new private session."""
    difficulty = Difficulty(request.difficulty)
    length = TextLength(request.length)

    text_query = select(TypingTextModel).where(
        TypingTextModel.difficulty == difficulty,
        TypingTextModel.length == length,
        TypingTextModel.is_active.is_(True),
    ).order_by(TypingTextModel.id).limit(10)
    result = await db.execute(text_query)
    texts = result.scalars().all()

    if not texts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No texts available for the selected difficulty and length",
        )

    import random
    text = random.choice(texts)

    code = generate_session_code()
    for _ in range(10):
        existing = await db.execute(
            select(PrivateSessionModel).where(PrivateSessionModel.code == code)
        )
        if not existing.scalar_one_or_none():
            break
        code = generate_session_code()

    session = PrivateSessionModel(
        id=uuid4(),
        code=code,
        host_id=current_user.id,
        text_id=text.id,
        status=PrivateSessionStatus.WAITING,
        max_players=request.max_players,
    )
    db.add(session)

    host_player = SessionPlayerModel(
        id=uuid4(),
        session_id=session.id,
        user_id=current_user.id,
        username=current_user.username,
        avatar=current_user.avatar,
        is_host=True,
        is_ready=False,
    )
    db.add(host_player)

    await db.commit()
    await db.refresh(session)

    return ApiResponse(
        data=PrivateSessionResponse(
            id=str(session.id),
            code=session.code,
            host_id=str(current_user.id),
            host_name=current_user.username,
            text_id=str(text.id),
            text_content=text.content,
            text_difficulty=text.difficulty.value,
            status=session.status.value,
            max_players=session.max_players,
            players=[{
                "id": str(current_user.id),
                "username": current_user.username,
                "avatar": current_user.avatar,
                "is_host": True,
                "is_ready": False,
                "progress": 0,
                "wpm": 0,
                "accuracy": 100,
                "position": None,
                "finished_at": None,
            }],
            created_at=session.created_at.isoformat(),
        )
    )


@router.get("/{code}", response_model=ApiResponse[PrivateSessionResponse])
async def get_private_session(
    code: str,
    current_user: CurrentUser,
    db: DbSession,
) -> ApiResponse[PrivateSessionResponse]:
    """Get a private session by code."""
    query = select(PrivateSessionModel).where(
        PrivateSessionModel.code == code.upper()
    ).options(
        selectinload(PrivateSessionModel.players),
        selectinload(PrivateSessionModel.text),
        selectinload(PrivateSessionModel.host),
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    return ApiResponse(
        data=PrivateSessionResponse(
            id=str(session.id),
            code=session.code,
            host_id=str(session.host_id),
            host_name=session.host.username,
            text_id=str(session.text_id),
            text_content=session.text.content,
            text_difficulty=session.text.difficulty.value,
            status=session.status.value,
            max_players=session.max_players,
            players=[
                {
                    "id": str(p.user_id),
                    "username": p.username,
                    "avatar": p.avatar,
                    "is_host": p.is_host,
                    "is_ready": p.is_ready,
                    "progress": p.progress,
                    "wpm": p.wpm,
                    "accuracy": p.accuracy,
                    "position": p.position,
                    "finished_at": p.finished_at.isoformat() if p.finished_at else None,
                }
                for p in session.players
            ],
            created_at=session.created_at.isoformat(),
        )
    )


@router.post("/{code}/join", response_model=ApiResponse[PrivateSessionResponse])
async def join_private_session(
    code: str,
    current_user: CurrentUser,
    db: DbSession,
) -> ApiResponse[PrivateSessionResponse]:
    """Join an existing private session."""
    query = select(PrivateSessionModel).where(
        PrivateSessionModel.code == code.upper()
    ).options(
        selectinload(PrivateSessionModel.players),
        selectinload(PrivateSessionModel.text),
        selectinload(PrivateSessionModel.host),
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status != PrivateSessionStatus.WAITING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session has already started",
        )

    if len(session.players) >= session.max_players:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is full",
        )

    existing_player = next((p for p in session.players if p.user_id == current_user.id), None)
    if existing_player:
        return ApiResponse(
            data=PrivateSessionResponse(
                id=str(session.id),
                code=session.code,
                host_id=str(session.host_id),
                host_name=session.host.username,
                text_id=str(session.text_id),
                text_content=session.text.content,
                text_difficulty=session.text.difficulty.value,
                status=session.status.value,
                max_players=session.max_players,
                players=[
                    {
                        "id": str(p.user_id),
                        "username": p.username,
                        "avatar": p.avatar,
                        "is_host": p.is_host,
                        "is_ready": p.is_ready,
                        "progress": p.progress,
                        "wpm": p.wpm,
                        "accuracy": p.accuracy,
                        "position": p.position,
                        "finished_at": p.finished_at.isoformat() if p.finished_at else None,
                    }
                    for p in session.players
                ],
                created_at=session.created_at.isoformat(),
            )
        )

    new_player = SessionPlayerModel(
        id=uuid4(),
        session_id=session.id,
        user_id=current_user.id,
        username=current_user.username,
        avatar=current_user.avatar,
        is_host=False,
        is_ready=False,
    )
    db.add(new_player)
    await db.commit()

    await db.refresh(session)

    await manager.broadcast(
        code.upper(),
        {
            "type": "player_joined",
            "player": {
                "id": str(current_user.id),
                "username": current_user.username,
                "avatar": current_user.avatar,
                "is_host": False,
                "is_ready": False,
            },
        },
    )

    return ApiResponse(
        data=PrivateSessionResponse(
            id=str(session.id),
            code=session.code,
            host_id=str(session.host_id),
            host_name=session.host.username,
            text_id=str(session.text_id),
            text_content=session.text.content,
            text_difficulty=session.text.difficulty.value,
            status=session.status.value,
            max_players=session.max_players,
            players=[
                {
                    "id": str(p.user_id),
                    "username": p.username,
                    "avatar": p.avatar,
                    "is_host": p.is_host,
                    "is_ready": p.is_ready,
                    "progress": p.progress,
                    "wpm": p.wpm,
                    "accuracy": p.accuracy,
                    "position": p.position,
                    "finished_at": p.finished_at.isoformat() if p.finished_at else None,
                }
                for p in session.players
            ],
            created_at=session.created_at.isoformat(),
        )
    )


@router.post("/{code}/ready")
async def toggle_ready(
    code: str,
    current_user: CurrentUser,
    db: DbSession,
) -> ApiResponse[dict]:
    """Toggle ready status for a player."""
    query = select(SessionPlayerModel).where(
        SessionPlayerModel.session_id == select(PrivateSessionModel.id).where(
            PrivateSessionModel.code == code.upper()
        ).scalar_subquery(),
        SessionPlayerModel.user_id == current_user.id,
    )
    result = await db.execute(query)
    player = result.scalar_one_or_none()

    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found in session",
        )

    player.is_ready = not player.is_ready
    await db.commit()

    await manager.broadcast(
        code.upper(),
        {
            "type": "player_ready",
            "player_id": str(current_user.id),
            "is_ready": player.is_ready,
        },
    )

    return ApiResponse(data={"is_ready": player.is_ready})


@router.post("/{code}/start")
async def start_race(
    code: str,
    current_user: CurrentUser,
    db: DbSession,
) -> ApiResponse[dict]:
    """Start the race (host only)."""
    query = select(PrivateSessionModel).where(
        PrivateSessionModel.code == code.upper()
    ).options(selectinload(PrivateSessionModel.players))
    result = await db.execute(query)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the host can start the race",
        )

    if session.status != PrivateSessionStatus.WAITING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session has already started",
        )

    ready_count = sum(1 for p in session.players if p.is_ready or p.is_host)
    if ready_count < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 players must be ready to start",
        )

    session.status = PrivateSessionStatus.COUNTDOWN
    await db.commit()

    await manager.broadcast(
        code.upper(),
        {"type": "race_starting", "countdown": 3},
    )

    await asyncio.sleep(3)

    session.status = PrivateSessionStatus.RACING
    session.started_at = datetime.now(UTC)
    await db.commit()

    await manager.broadcast(
        code.upper(),
        {"type": "race_started"},
    )

    return ApiResponse(data={"status": "started"})


@router.websocket("/{code}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    code: str,
):
    """WebSocket endpoint for real-time race updates."""
    user_id = None
    try:
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=4001, reason="No token provided")
            return

        from app.core.security import decode_token

        try:
            payload = decode_token(token)
            if not payload:
                await websocket.close(code=4001, reason="Invalid token")
                return
            user_id = payload.get("sub")
            if not user_id:
                await websocket.close(code=4001, reason="Invalid token")
                return
        except Exception:
            await websocket.close(code=4001, reason="Invalid token")
            return

        await manager.connect(websocket, code.upper(), user_id)

        try:
            while True:
                data = await websocket.receive_json()
                message_type = data.get("type")

                if message_type == "progress":
                    await manager.broadcast(
                        code.upper(),
                        {
                            "type": "player_progress",
                            "player_id": user_id,
                            "progress": data.get("progress", 0),
                            "wpm": data.get("wpm", 0),
                            "accuracy": data.get("accuracy", 100),
                        },
                        exclude_user=user_id,
                    )

                elif message_type == "finished":
                    async with AsyncSessionLocal() as db:
                        query = select(SessionPlayerModel).where(
                            SessionPlayerModel.session_id == select(PrivateSessionModel.id).where(
                                PrivateSessionModel.code == code.upper()
                            ).scalar_subquery(),
                            SessionPlayerModel.user_id == UUID(user_id),
                        )
                        result = await db.execute(query)
                        player = result.scalar_one_or_none()

                        if player:
                            player.progress = 100
                            player.wpm = data.get("wpm", 0)
                            player.accuracy = data.get("accuracy", 100)
                            player.finished_at = datetime.now(UTC)

                            finished_count = await db.execute(
                                select(SessionPlayerModel).where(
                                    SessionPlayerModel.session_id == player.session_id,
                                    SessionPlayerModel.finished_at.isnot(None),
                                )
                            )
                            player.position = len(finished_count.scalars().all()) + 1

                            await db.commit()

                            await manager.broadcast(
                                code.upper(),
                                {
                                    "type": "player_finished",
                                    "player_id": user_id,
                                    "position": player.position,
                                    "wpm": player.wpm,
                                    "accuracy": player.accuracy,
                                },
                            )

        except WebSocketDisconnect:
            manager.disconnect(code.upper(), user_id)
            await manager.broadcast(
                code.upper(),
                {"type": "player_left", "player_id": user_id},
            )

    except Exception as e:
        print(f"WebSocket error: {e}")
        if user_id:
            manager.disconnect(code.upper(), user_id)

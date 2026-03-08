"""
Public session API routes with matchmaking queue.
"""
import asyncio
import secrets
from datetime import datetime, timezone
from typing import Dict, List, Set
from uuid import UUID, uuid4
from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel

from app.domain.entities.private_session import PrivateSessionStatus
from app.domain.entities.typing_text import Difficulty, TextLength
from app.presentation.api.v1.deps import CurrentUser, DbSession
from app.presentation.schemas.common import ApiResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import AsyncSessionLocal
from app.infrastructure.database.models import TypingTextModel, UserModel
from sqlalchemy import select
import random

router = APIRouter()


class QueuePlayer:
    """Player in the matchmaking queue."""

    def __init__(self, user_id: str, username: str, avatar: str | None, difficulty: str, websocket: WebSocket):
        self.user_id = user_id
        self.username = username
        self.avatar = avatar
        self.difficulty = difficulty
        self.websocket = websocket
        self.joined_at = datetime.now(timezone.utc)


class PublicSession:
    """A public race session."""

    def __init__(self, session_id: str, difficulty: str, text_content: str, text_id: str):
        self.id = session_id
        self.difficulty = difficulty
        self.text_content = text_content
        self.text_id = text_id
        self.status = "lobby"  # lobby, countdown, racing, finished
        self.players: Dict[str, dict] = {}  # user_id -> player data
        self.connections: Dict[str, WebSocket] = {}  # user_id -> websocket
        self.started_at: datetime | None = None
        self.finished_count = 0

    def add_player(self, user_id: str, username: str, avatar: str | None, websocket: WebSocket):
        self.players[user_id] = {
            "id": user_id,
            "username": username,
            "avatar": avatar,
            "progress": 0,
            "wpm": 0,
            "accuracy": 100,
            "position": None,
            "finished_at": None,
        }
        self.connections[user_id] = websocket

    def remove_player(self, user_id: str):
        self.players.pop(user_id, None)
        self.connections.pop(user_id, None)

    async def broadcast(self, message: dict, exclude_user: str | None = None):
        """Broadcast a message to all players."""
        for user_id, ws in list(self.connections.items()):
            if exclude_user and user_id == exclude_user:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                pass


class MatchmakingManager:
    """Manages matchmaking queues and public sessions."""

    def __init__(self):
        self.queues: Dict[str, List[QueuePlayer]] = {
            "easy": [],
            "medium": [],
            "hard": [],
        }
        self.sessions: Dict[str, PublicSession] = {}  # session_id -> session
        self.user_queue: Dict[str, str] = {}  # user_id -> difficulty
        self.user_session: Dict[str, str] = {}  # user_id -> session_id
        self.lock = asyncio.Lock()

    async def join_queue(
        self, user_id: str, username: str, avatar: str | None, difficulty: str, websocket: WebSocket
    ) -> QueuePlayer:
        """Add a player to the matchmaking queue."""
        async with self.lock:
            # Remove from any existing queue
            await self._remove_from_queue(user_id)

            player = QueuePlayer(user_id, username, avatar, difficulty, websocket)
            self.queues[difficulty].append(player)
            self.user_queue[user_id] = difficulty

            return player

    async def leave_queue(self, user_id: str):
        """Remove a player from the queue."""
        async with self.lock:
            await self._remove_from_queue(user_id)

    async def _remove_from_queue(self, user_id: str):
        """Internal method to remove player from queue."""
        if user_id in self.user_queue:
            difficulty = self.user_queue[user_id]
            self.queues[difficulty] = [p for p in self.queues[difficulty] if p.user_id != user_id]
            del self.user_queue[user_id]

    async def check_and_create_match(self, difficulty: str) -> PublicSession | None:
        """Check if there are enough players to start a match."""
        async with self.lock:
            queue = self.queues[difficulty]
            min_players = 2
            max_players = 5

            if len(queue) >= min_players:
                # Get players for this match
                players_to_match = queue[:max_players]
                self.queues[difficulty] = queue[max_players:]

                # Get a random text
                async with AsyncSessionLocal() as db:
                    text_query = select(TypingTextModel).where(
                        TypingTextModel.difficulty == Difficulty(difficulty),
                        TypingTextModel.is_active == True,
                    ).limit(20)
                    result = await db.execute(text_query)
                    texts = result.scalars().all()

                    if not texts:
                        # Put players back in queue
                        self.queues[difficulty] = players_to_match + self.queues[difficulty]
                        return None

                    text = random.choice(texts)

                # Create session
                session_id = str(uuid4())
                session = PublicSession(session_id, difficulty, text.content, str(text.id))

                for player in players_to_match:
                    session.add_player(player.user_id, player.username, player.avatar, player.websocket)
                    del self.user_queue[player.user_id]
                    self.user_session[player.user_id] = session_id

                self.sessions[session_id] = session
                return session

            return None

    def get_session(self, session_id: str) -> PublicSession | None:
        """Get a session by ID."""
        return self.sessions.get(session_id)

    def get_user_session(self, user_id: str) -> PublicSession | None:
        """Get the session a user is in."""
        session_id = self.user_session.get(user_id)
        if session_id:
            return self.sessions.get(session_id)
        return None

    def remove_from_session(self, user_id: str):
        """Remove a player from their session."""
        session_id = self.user_session.get(user_id)
        if session_id and session_id in self.sessions:
            self.sessions[session_id].remove_player(user_id)
            del self.user_session[user_id]

    def get_queue_position(self, user_id: str) -> int | None:
        """Get a player's position in the queue."""
        if user_id in self.user_queue:
            difficulty = self.user_queue[user_id]
            queue = self.queues[difficulty]
            for i, player in enumerate(queue):
                if player.user_id == user_id:
                    return i + 1
        return None


matchmaking = MatchmakingManager()


class JoinQueueRequest(BaseModel):
    """Request to join the matchmaking queue."""
    difficulty: str = "medium"


class PublicSessionResponse(BaseModel):
    """Response for a public session."""
    id: str
    difficulty: str
    text_content: str
    text_id: str
    status: str
    players: list


@router.websocket("/queue")
async def queue_websocket(websocket: WebSocket):
    """WebSocket endpoint for matchmaking queue."""
    user_id = None
    try:
        # Accept connection
        await websocket.accept()

        # Get token from query params
        token = websocket.query_params.get("token")
        difficulty = websocket.query_params.get("difficulty", "medium")

        if not token:
            await websocket.send_json({"type": "error", "message": "No token provided"})
            await websocket.close(code=4001)
            return

        # Validate token
        from app.core.security import decode_token

        try:
            payload = decode_token(token)
            if not payload:
                await websocket.send_json({"type": "error", "message": "Invalid token"})
                await websocket.close(code=4001)
                return
            user_id = payload.get("sub")
        except Exception:
            await websocket.send_json({"type": "error", "message": "Invalid token"})
            await websocket.close(code=4001)
            return

        # Get user info
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserModel).where(UserModel.id == UUID(user_id)))
            user = result.scalar_one_or_none()
            if not user:
                await websocket.send_json({"type": "error", "message": "User not found"})
                await websocket.close(code=4002)
                return
            username = user.username
            avatar = user.avatar

        # Validate difficulty
        if difficulty not in ["easy", "medium", "hard"]:
            difficulty = "medium"

        # Join queue
        player = await matchmaking.join_queue(user_id, username, avatar, difficulty, websocket)

        # Send confirmation
        await websocket.send_json({
            "type": "queue_joined",
            "difficulty": difficulty,
            "queue_size": len(matchmaking.queues[difficulty]),
        })

        # Start matchmaking check loop
        check_task = asyncio.create_task(check_matchmaking_loop(user_id, difficulty, websocket))

        try:
            while True:
                data = await websocket.receive_json()
                msg_type = data.get("type")

                if msg_type == "cancel":
                    await matchmaking.leave_queue(user_id)
                    await websocket.send_json({"type": "queue_left"})
                    break

                elif msg_type == "progress":
                    # Handle progress updates in race
                    session = matchmaking.get_user_session(user_id)
                    if session:
                        session.players[user_id]["progress"] = data.get("progress", 0)
                        session.players[user_id]["wpm"] = data.get("wpm", 0)
                        session.players[user_id]["accuracy"] = data.get("accuracy", 100)

                        await session.broadcast({
                            "type": "player_progress",
                            "player_id": user_id,
                            "progress": data.get("progress", 0),
                            "wpm": data.get("wpm", 0),
                            "accuracy": data.get("accuracy", 100),
                        }, exclude_user=user_id)

                elif msg_type == "finished":
                    session = matchmaking.get_user_session(user_id)
                    if session:
                        session.finished_count += 1
                        position = session.finished_count
                        session.players[user_id]["progress"] = 100
                        session.players[user_id]["wpm"] = data.get("wpm", 0)
                        session.players[user_id]["accuracy"] = data.get("accuracy", 100)
                        session.players[user_id]["position"] = position
                        session.players[user_id]["finished_at"] = datetime.now(timezone.utc).isoformat()

                        # Calculate points based on position
                        points_map = {1: 50, 2: 30, 3: 20, 4: 10, 5: 5}
                        points_earned = points_map.get(position, 0)

                        await session.broadcast({
                            "type": "player_finished",
                            "player_id": user_id,
                            "position": position,
                            "wpm": data.get("wpm", 0),
                            "accuracy": data.get("accuracy", 100),
                            "points_earned": points_earned,
                        })

                        # Check if all finished
                        if session.finished_count >= len(session.players):
                            session.status = "finished"
                            results = sorted(
                                session.players.values(),
                                key=lambda p: p.get("position") or 999
                            )
                            await session.broadcast({
                                "type": "race_ended",
                                "results": results,
                            })

        except WebSocketDisconnect:
            pass
        finally:
            check_task.cancel()
            await matchmaking.leave_queue(user_id)
            matchmaking.remove_from_session(user_id)

    except Exception as e:
        print(f"Public queue WebSocket error: {e}")
        if user_id:
            await matchmaking.leave_queue(user_id)
            matchmaking.remove_from_session(user_id)


async def check_matchmaking_loop(user_id: str, difficulty: str, websocket: WebSocket):
    """Background task to check for matches."""
    max_wait_time = 60  # seconds
    start_time = datetime.now(timezone.utc)
    last_queue_update = 0

    while True:
        try:
            await asyncio.sleep(1)

            # Check if still in queue
            if user_id not in matchmaking.user_queue:
                # Player was matched or left
                break

            # Check if already in session
            if user_id in matchmaking.user_session:
                break

            # Send queue position update
            current_queue_size = len(matchmaking.queues[difficulty])
            if current_queue_size != last_queue_update:
                last_queue_update = current_queue_size
                try:
                    await websocket.send_json({
                        "type": "queue_update",
                        "queue_size": current_queue_size,
                        "position": matchmaking.get_queue_position(user_id),
                    })
                except Exception:
                    break

            # Try to create a match
            session = await matchmaking.check_and_create_match(difficulty)
            if session:
                # Match found! Notify all players
                for pid, ws in session.connections.items():
                    try:
                        await ws.send_json({
                            "type": "match_found",
                            "session_id": session.id,
                            "text_content": session.text_content,
                            "text_id": session.text_id,
                            "players": list(session.players.values()),
                        })
                    except Exception:
                        pass

                # Wait and start countdown
                await asyncio.sleep(2)

                session.status = "countdown"
                for countdown in [3, 2, 1]:
                    await session.broadcast({
                        "type": "countdown",
                        "value": countdown,
                    })
                    await asyncio.sleep(1)

                # Start race
                session.status = "racing"
                session.started_at = datetime.now(timezone.utc)
                await session.broadcast({
                    "type": "race_started",
                })
                break

            # Check timeout
            elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
            if elapsed >= max_wait_time:
                # Force start with available players (min 2)
                queue = matchmaking.queues[difficulty]
                if len(queue) >= 2:
                    session = await matchmaking.check_and_create_match(difficulty)
                    if session:
                        continue  # Will be handled in next iteration
                else:
                    # Not enough players after timeout
                    try:
                        await websocket.send_json({
                            "type": "queue_timeout",
                            "message": "Not enough players found. Try again.",
                        })
                    except Exception:
                        pass
                    break

        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Matchmaking loop error: {e}")
            break


@router.get("/status")
async def get_queue_status(
    difficulty: str = "medium",
    current_user: CurrentUser = Depends(),
) -> ApiResponse[dict]:
    """Get current queue status."""
    return ApiResponse(data={
        "queue_size": len(matchmaking.queues.get(difficulty, [])),
        "active_sessions": len(matchmaking.sessions),
    })

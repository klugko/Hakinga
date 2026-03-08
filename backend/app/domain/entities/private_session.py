"""
Private session domain entity.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from uuid import UUID


class PrivateSessionStatus(StrEnum):
    """Private session status."""

    WAITING = "waiting"
    COUNTDOWN = "countdown"
    RACING = "racing"
    FINISHED = "finished"


@dataclass
class SessionPlayer:
    """
    Player in a private session.

    Tracks player state and progress during a race.
    """

    id: UUID
    user_id: UUID
    username: str
    avatar: str | None = None
    is_host: bool = False
    is_ready: bool = False
    progress: float = 0.0
    wpm: int = 0
    accuracy: float = 100.0
    position: int | None = None
    finished_at: datetime | None = None

    def mark_ready(self) -> None:
        """Mark player as ready."""
        self.is_ready = True

    def update_progress(self, progress: float, wpm: int, accuracy: float) -> None:
        """Update player progress during race."""
        self.progress = progress
        self.wpm = wpm
        self.accuracy = accuracy

    def finish(self, position: int) -> None:
        """Mark player as finished with their position."""
        self.position = position
        self.finished_at = datetime.utcnow()


@dataclass
class PrivateSession:
    """
    Private session domain entity.

    Represents a private typing race session with multiple players.
    """

    id: UUID
    code: str
    host_id: UUID
    text_id: UUID
    status: PrivateSessionStatus
    max_players: int
    created_at: datetime
    players: list[SessionPlayer] = field(default_factory=list)
    started_at: datetime | None = None
    finished_at: datetime | None = None

    @property
    def player_count(self) -> int:
        """Get current number of players."""
        return len(self.players)

    @property
    def is_full(self) -> bool:
        """Check if session is full."""
        return self.player_count >= self.max_players

    @property
    def all_ready(self) -> bool:
        """Check if all players are ready."""
        return all(p.is_ready for p in self.players) and len(self.players) > 1

    @property
    def all_finished(self) -> bool:
        """Check if all players have finished."""
        return all(p.finished_at is not None for p in self.players)

    def add_player(self, player: SessionPlayer) -> bool:
        """
        Add a player to the session.

        Returns:
            True if player was added, False if session is full.
        """
        if self.is_full:
            return False
        self.players.append(player)
        return True

    def remove_player(self, user_id: UUID) -> bool:
        """
        Remove a player from the session.

        Returns:
            True if player was removed, False if not found.
        """
        for i, player in enumerate(self.players):
            if player.user_id == user_id:
                self.players.pop(i)
                return True
        return False

    def get_player(self, user_id: UUID) -> SessionPlayer | None:
        """Get a player by user ID."""
        for player in self.players:
            if player.user_id == user_id:
                return player
        return None

    def start_countdown(self) -> None:
        """Start the countdown phase."""
        self.status = PrivateSessionStatus.COUNTDOWN

    def start_race(self) -> None:
        """Start the race."""
        self.status = PrivateSessionStatus.RACING
        self.started_at = datetime.utcnow()

    def finish_race(self) -> None:
        """Finish the race."""
        self.status = PrivateSessionStatus.FINISHED
        self.finished_at = datetime.utcnow()

    def get_next_position(self) -> int:
        """Get the next finishing position."""
        finished_count = sum(1 for p in self.players if p.finished_at is not None)
        return finished_count + 1

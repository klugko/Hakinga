"""
Keystroke collection service for ML analysis.
Collects and stores detailed keystroke data for pattern analysis.
"""
import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class KeystrokeEvent:
    """Individual keystroke event with full context."""
    event_id: str
    timestamp_ms: int
    key: str
    expected_key: str
    correct: bool
    time_since_last_ms: int | None
    key_down_duration_ms: int | None
    position_in_text: int
    position_in_word: int
    word_index: int
    finger_used: str | None  # Estimated finger
    hand: str | None  # "left" or "right"
    shift_pressed: bool
    alt_pressed: bool
    ctrl_pressed: bool


@dataclass
class SessionKeystrokeData:
    """Complete keystroke data for a session."""
    session_id: str
    user_id: str
    text_id: str
    started_at: datetime
    completed_at: datetime | None
    keystrokes: list[KeystrokeEvent] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ExportedData:
    """Exported data format for ML analysis."""
    export_id: str
    exported_at: datetime
    user_id: str
    sessions_count: int
    keystrokes_count: int
    format: str  # "json", "csv", "parquet"
    data: Any


class KeystrokeCollectorService:
    """
    Service for collecting and managing keystroke data.

    Features:
    - Record individual keystrokes with context
    - Store session metadata
    - Export data for ML analysis
    - Aggregate statistics
    """

    # Finger mapping for QWERTY layout
    FINGER_MAP = {
        # Left hand
        '`': 'left_pinky', '1': 'left_pinky', 'q': 'left_pinky', 'a': 'left_pinky', 'z': 'left_pinky',
        '2': 'left_ring', 'w': 'left_ring', 's': 'left_ring', 'x': 'left_ring',
        '3': 'left_middle', 'e': 'left_middle', 'd': 'left_middle', 'c': 'left_middle',
        '4': 'left_index', 'r': 'left_index', 'f': 'left_index', 'v': 'left_index',
        '5': 'left_index', 't': 'left_index', 'g': 'left_index', 'b': 'left_index',
        # Right hand
        '6': 'right_index', 'y': 'right_index', 'h': 'right_index', 'n': 'right_index',
        '7': 'right_index', 'u': 'right_index', 'j': 'right_index', 'm': 'right_index',
        '8': 'right_middle', 'i': 'right_middle', 'k': 'right_middle', ',': 'right_middle',
        '9': 'right_ring', 'o': 'right_ring', 'l': 'right_ring', '.': 'right_ring',
        '0': 'right_pinky', 'p': 'right_pinky', ';': 'right_pinky', '/': 'right_pinky',
        '-': 'right_pinky', '[': 'right_pinky', "'": 'right_pinky',
        '=': 'right_pinky', ']': 'right_pinky', '\\': 'right_pinky',
    }

    def __init__(self):
        self._sessions: dict[str, SessionKeystrokeData] = {}

    def start_session(
        self,
        session_id: str,
        user_id: str,
        text_id: str,
        metadata: dict | None = None,
    ) -> SessionKeystrokeData:
        """
        Start a new keystroke collection session.

        Args:
            session_id: Unique session identifier
            user_id: User identifier
            text_id: Text being typed
            metadata: Additional session metadata

        Returns:
            New session data object
        """
        session = SessionKeystrokeData(
            session_id=session_id,
            user_id=user_id,
            text_id=text_id,
            started_at=datetime.utcnow(),
            completed_at=None,
            keystrokes=[],
            metadata=metadata or {},
        )
        self._sessions[session_id] = session
        return session

    def record_keystroke(
        self,
        session_id: str,
        timestamp_ms: int,
        key: str,
        expected_key: str,
        position_in_text: int,
        position_in_word: int,
        word_index: int,
        key_down_duration_ms: int | None = None,
        shift_pressed: bool = False,
        alt_pressed: bool = False,
        ctrl_pressed: bool = False,
    ) -> KeystrokeEvent | None:
        """
        Record a single keystroke event.

        Args:
            session_id: Session identifier
            timestamp_ms: Timestamp in milliseconds
            key: Key that was pressed
            expected_key: Key that was expected
            position_in_text: Position in the full text
            position_in_word: Position within current word
            word_index: Index of current word
            key_down_duration_ms: How long key was held
            shift_pressed: Was shift key pressed
            alt_pressed: Was alt key pressed
            ctrl_pressed: Was ctrl key pressed

        Returns:
            Created keystroke event or None if session not found
        """
        session = self._sessions.get(session_id)
        if not session:
            return None

        # Calculate time since last keystroke
        time_since_last = None
        if session.keystrokes:
            last_timestamp = session.keystrokes[-1].timestamp_ms
            time_since_last = timestamp_ms - last_timestamp

        # Determine finger and hand
        key_lower = key.lower()
        finger = self.FINGER_MAP.get(key_lower)
        hand = None
        if finger:
            hand = "left" if finger.startswith("left") else "right"

        event = KeystrokeEvent(
            event_id=str(uuid.uuid4())[:8],
            timestamp_ms=timestamp_ms,
            key=key,
            expected_key=expected_key,
            correct=key == expected_key,
            time_since_last_ms=time_since_last,
            key_down_duration_ms=key_down_duration_ms,
            position_in_text=position_in_text,
            position_in_word=position_in_word,
            word_index=word_index,
            finger_used=finger,
            hand=hand,
            shift_pressed=shift_pressed,
            alt_pressed=alt_pressed,
            ctrl_pressed=ctrl_pressed,
        )

        session.keystrokes.append(event)
        return event

    def end_session(
        self,
        session_id: str,
    ) -> SessionKeystrokeData | None:
        """
        End a keystroke collection session.

        Args:
            session_id: Session identifier

        Returns:
            Completed session data
        """
        session = self._sessions.get(session_id)
        if not session:
            return None

        session.completed_at = datetime.utcnow()
        return session

    def get_session(
        self,
        session_id: str,
    ) -> SessionKeystrokeData | None:
        """Get session data."""
        return self._sessions.get(session_id)

    def export_session_json(
        self,
        session_id: str,
    ) -> str | None:
        """
        Export session data as JSON.

        Args:
            session_id: Session identifier

        Returns:
            JSON string of session data
        """
        session = self._sessions.get(session_id)
        if not session:
            return None

        data = {
            "session_id": session.session_id,
            "user_id": session.user_id,
            "text_id": session.text_id,
            "started_at": session.started_at.isoformat(),
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "metadata": session.metadata,
            "keystrokes": [
                {
                    "event_id": k.event_id,
                    "timestamp_ms": k.timestamp_ms,
                    "key": k.key,
                    "expected_key": k.expected_key,
                    "correct": k.correct,
                    "time_since_last_ms": k.time_since_last_ms,
                    "key_down_duration_ms": k.key_down_duration_ms,
                    "position_in_text": k.position_in_text,
                    "position_in_word": k.position_in_word,
                    "word_index": k.word_index,
                    "finger_used": k.finger_used,
                    "hand": k.hand,
                    "shift_pressed": k.shift_pressed,
                    "alt_pressed": k.alt_pressed,
                    "ctrl_pressed": k.ctrl_pressed,
                }
                for k in session.keystrokes
            ],
        }

        return json.dumps(data, indent=2)

    def export_user_data(
        self,
        user_id: str,
        format: str = "json",
    ) -> ExportedData:
        """
        Export all data for a user for ML analysis.

        Args:
            user_id: User identifier
            format: Export format ("json", "csv")

        Returns:
            Exported data object
        """
        user_sessions = [
            s for s in self._sessions.values()
            if s.user_id == user_id
        ]

        all_keystrokes = []
        for session in user_sessions:
            for k in session.keystrokes:
                all_keystrokes.append({
                    "session_id": session.session_id,
                    "text_id": session.text_id,
                    "event_id": k.event_id,
                    "timestamp_ms": k.timestamp_ms,
                    "key": k.key,
                    "expected_key": k.expected_key,
                    "correct": k.correct,
                    "time_since_last_ms": k.time_since_last_ms,
                    "key_down_duration_ms": k.key_down_duration_ms,
                    "position_in_text": k.position_in_text,
                    "finger_used": k.finger_used,
                    "hand": k.hand,
                })

        if format == "csv":
            # Generate CSV format
            if all_keystrokes:
                headers = list(all_keystrokes[0].keys())
                lines = [",".join(headers)]
                for row in all_keystrokes:
                    lines.append(",".join(str(row.get(h, "")) for h in headers))
                data = "\n".join(lines)
            else:
                data = ""
        else:
            data = {
                "user_id": user_id,
                "sessions": [
                    {
                        "session_id": s.session_id,
                        "text_id": s.text_id,
                        "started_at": s.started_at.isoformat(),
                        "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                        "keystrokes_count": len(s.keystrokes),
                    }
                    for s in user_sessions
                ],
                "keystrokes": all_keystrokes,
            }

        return ExportedData(
            export_id=str(uuid.uuid4())[:8],
            exported_at=datetime.utcnow(),
            user_id=user_id,
            sessions_count=len(user_sessions),
            keystrokes_count=len(all_keystrokes),
            format=format,
            data=data,
        )

    def aggregate_user_statistics(
        self,
        user_id: str,
    ) -> dict[str, Any]:
        """
        Aggregate statistics for a user.

        Args:
            user_id: User identifier

        Returns:
            Dictionary of aggregated statistics
        """
        user_sessions = [
            s for s in self._sessions.values()
            if s.user_id == user_id and s.completed_at
        ]

        if not user_sessions:
            return {
                "total_sessions": 0,
                "total_keystrokes": 0,
                "avg_wpm": 0,
                "avg_accuracy": 0,
                "total_practice_minutes": 0,
            }

        total_keystrokes = sum(len(s.keystrokes) for s in user_sessions)
        total_correct = sum(
            sum(1 for k in s.keystrokes if k.correct)
            for s in user_sessions
        )

        # Calculate total time
        total_time_ms = sum(
            s.keystrokes[-1].timestamp_ms - s.keystrokes[0].timestamp_ms
            for s in user_sessions
            if s.keystrokes and len(s.keystrokes) > 1
        )

        # Calculate WPM (assuming 5 chars per word)
        total_minutes = total_time_ms / 60000 if total_time_ms > 0 else 0
        avg_wpm = (total_keystrokes / 5) / total_minutes if total_minutes > 0 else 0

        # Calculate accuracy
        accuracy = (total_correct / total_keystrokes * 100) if total_keystrokes > 0 else 0

        # Analyze finger usage
        finger_counts: dict[str, int] = {}
        finger_errors: dict[str, int] = {}

        for session in user_sessions:
            for k in session.keystrokes:
                if k.finger_used:
                    finger_counts[k.finger_used] = finger_counts.get(k.finger_used, 0) + 1
                    if not k.correct:
                        finger_errors[k.finger_used] = finger_errors.get(k.finger_used, 0) + 1

        # Calculate finger error rates
        finger_error_rates = {
            f: (finger_errors.get(f, 0) / c * 100) if c > 0 else 0
            for f, c in finger_counts.items()
        }

        return {
            "total_sessions": len(user_sessions),
            "total_keystrokes": total_keystrokes,
            "total_correct": total_correct,
            "avg_wpm": round(avg_wpm, 1),
            "avg_accuracy": round(accuracy, 1),
            "total_practice_minutes": round(total_minutes, 1),
            "finger_usage": finger_counts,
            "finger_error_rates": finger_error_rates,
        }


# Global instance
keystroke_collector_service = KeystrokeCollectorService()

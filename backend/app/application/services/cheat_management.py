"""
Cheat management service for handling detected cheaters.
Implements ban system for repeat offenders.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from enum import Enum
import uuid


class BanDuration(Enum):
    """Ban duration levels."""
    WARNING = 0  # No ban, just warning
    SHORT = 1  # 24 hours
    MEDIUM = 7  # 1 week
    LONG = 30  # 1 month
    PERMANENT = -1  # Permanent


class ViolationType(Enum):
    """Types of anti-cheat violations."""
    IMPOSSIBLE_WPM = "impossible_wpm"
    ROBOTIC_TIMING = "robotic_timing"
    SUSPICIOUS_IMPROVEMENT = "suspicious_improvement"
    IMPOSSIBLE_DURATION = "impossible_duration"
    MULTIPLE_ACCOUNTS = "multiple_accounts"
    BOT_DETECTED = "bot_detected"


@dataclass
class Violation:
    """Record of a single violation."""
    violation_id: str
    user_id: str
    violation_type: ViolationType
    session_id: Optional[str]
    confidence: float
    details: Dict
    detected_at: datetime
    reviewed: bool = False
    reviewed_by: Optional[str] = None
    appeal_status: Optional[str] = None


@dataclass
class BanRecord:
    """Record of a user ban."""
    ban_id: str
    user_id: str
    duration: BanDuration
    reason: str
    violations: List[str]  # Violation IDs
    banned_at: datetime
    expires_at: Optional[datetime]
    lifted_at: Optional[datetime] = None
    lifted_by: Optional[str] = None
    appeal_id: Optional[str] = None


@dataclass
class UserCheatProfile:
    """Cheat profile for a user."""
    user_id: str
    violations: List[Violation]
    bans: List[BanRecord]
    warning_count: int
    trust_score: float  # 0-100, 100 = fully trusted
    is_currently_banned: bool
    current_ban: Optional[BanRecord]


class CheatManagementService:
    """
    Service for managing detected cheaters and bans.

    Features:
    - Record violations
    - Escalating ban system
    - Appeal process
    - Trust score management
    """

    # Escalation thresholds
    WARNING_THRESHOLD = 1  # First offense = warning
    SHORT_BAN_THRESHOLD = 2  # Second offense = 24h ban
    MEDIUM_BAN_THRESHOLD = 3  # Third offense = 1 week ban
    LONG_BAN_THRESHOLD = 4  # Fourth offense = 1 month ban
    PERMANENT_BAN_THRESHOLD = 5  # Fifth+ offense = permanent

    def __init__(self):
        self._violations: Dict[str, List[Violation]] = {}
        self._bans: Dict[str, List[BanRecord]] = {}

    def record_violation(
        self,
        user_id: str,
        violation_type: ViolationType,
        confidence: float,
        session_id: Optional[str] = None,
        details: Optional[Dict] = None,
    ) -> Violation:
        """
        Record a new violation for a user.

        Args:
            user_id: User identifier
            violation_type: Type of violation
            confidence: Confidence level (0-1)
            session_id: Associated session if any
            details: Additional details

        Returns:
            Created violation record
        """
        violation = Violation(
            violation_id=str(uuid.uuid4())[:8],
            user_id=user_id,
            violation_type=violation_type,
            session_id=session_id,
            confidence=confidence,
            details=details or {},
            detected_at=datetime.utcnow(),
        )

        if user_id not in self._violations:
            self._violations[user_id] = []
        self._violations[user_id].append(violation)

        return violation

    def get_user_violations(
        self,
        user_id: str,
        since: Optional[datetime] = None,
    ) -> List[Violation]:
        """
        Get all violations for a user.

        Args:
            user_id: User identifier
            since: Only return violations after this date

        Returns:
            List of violations
        """
        violations = self._violations.get(user_id, [])

        if since:
            violations = [v for v in violations if v.detected_at >= since]

        return sorted(violations, key=lambda v: v.detected_at, reverse=True)

    def determine_ban_duration(
        self,
        user_id: str,
    ) -> BanDuration:
        """
        Determine appropriate ban duration based on history.

        Args:
            user_id: User identifier

        Returns:
            Appropriate ban duration
        """
        # Count recent high-confidence violations
        recent_violations = self.get_user_violations(
            user_id,
            since=datetime.utcnow() - timedelta(days=90),
        )
        high_confidence = [v for v in recent_violations if v.confidence >= 0.7]
        offense_count = len(high_confidence)

        # Count previous bans
        previous_bans = len(self._bans.get(user_id, []))
        total_strikes = offense_count + previous_bans

        if total_strikes >= self.PERMANENT_BAN_THRESHOLD:
            return BanDuration.PERMANENT
        elif total_strikes >= self.LONG_BAN_THRESHOLD:
            return BanDuration.LONG
        elif total_strikes >= self.MEDIUM_BAN_THRESHOLD:
            return BanDuration.MEDIUM
        elif total_strikes >= self.SHORT_BAN_THRESHOLD:
            return BanDuration.SHORT
        else:
            return BanDuration.WARNING

    def ban_user(
        self,
        user_id: str,
        duration: BanDuration,
        reason: str,
        violation_ids: Optional[List[str]] = None,
    ) -> BanRecord:
        """
        Ban a user.

        Args:
            user_id: User identifier
            duration: Ban duration
            reason: Reason for ban
            violation_ids: Associated violation IDs

        Returns:
            Created ban record
        """
        now = datetime.utcnow()

        # Calculate expiry
        if duration == BanDuration.PERMANENT:
            expires_at = None
        elif duration == BanDuration.WARNING:
            expires_at = now  # Immediate expiry (warning only)
        else:
            expires_at = now + timedelta(days=duration.value)

        ban = BanRecord(
            ban_id=str(uuid.uuid4())[:8],
            user_id=user_id,
            duration=duration,
            reason=reason,
            violations=violation_ids or [],
            banned_at=now,
            expires_at=expires_at,
        )

        if user_id not in self._bans:
            self._bans[user_id] = []
        self._bans[user_id].append(ban)

        return ban

    def process_violation(
        self,
        user_id: str,
        violation_type: ViolationType,
        confidence: float,
        session_id: Optional[str] = None,
        details: Optional[Dict] = None,
    ) -> Dict:
        """
        Process a violation and determine action.

        Args:
            user_id: User identifier
            violation_type: Type of violation
            confidence: Confidence level
            session_id: Associated session
            details: Additional details

        Returns:
            Dictionary with action taken
        """
        # Record the violation
        violation = self.record_violation(
            user_id, violation_type, confidence, session_id, details
        )

        # Only take action on high-confidence violations
        if confidence < 0.7:
            return {
                "action": "logged",
                "violation_id": violation.violation_id,
                "message": "Low confidence - logged for review",
            }

        # Determine ban duration
        ban_duration = self.determine_ban_duration(user_id)

        if ban_duration == BanDuration.WARNING:
            return {
                "action": "warning",
                "violation_id": violation.violation_id,
                "message": "First offense - warning issued",
            }

        # Issue ban
        ban = self.ban_user(
            user_id,
            ban_duration,
            f"Automatic ban for {violation_type.value}",
            [violation.violation_id],
        )

        return {
            "action": "banned",
            "violation_id": violation.violation_id,
            "ban_id": ban.ban_id,
            "duration": ban_duration.name,
            "expires_at": ban.expires_at.isoformat() if ban.expires_at else "never",
            "message": f"User banned for {ban_duration.value} days" if ban_duration != BanDuration.PERMANENT else "User permanently banned",
        }

    def is_user_banned(
        self,
        user_id: str,
    ) -> bool:
        """
        Check if a user is currently banned.

        Args:
            user_id: User identifier

        Returns:
            True if user is banned
        """
        bans = self._bans.get(user_id, [])
        now = datetime.utcnow()

        for ban in bans:
            if ban.lifted_at:
                continue
            if ban.expires_at is None:  # Permanent
                return True
            if ban.expires_at > now:
                return True

        return False

    def get_current_ban(
        self,
        user_id: str,
    ) -> Optional[BanRecord]:
        """
        Get the current active ban for a user.

        Args:
            user_id: User identifier

        Returns:
            Current ban record or None
        """
        bans = self._bans.get(user_id, [])
        now = datetime.utcnow()

        for ban in reversed(bans):  # Most recent first
            if ban.lifted_at:
                continue
            if ban.expires_at is None:
                return ban
            if ban.expires_at > now:
                return ban

        return None

    def lift_ban(
        self,
        user_id: str,
        ban_id: str,
        lifted_by: str,
        reason: str = "Appeal approved",
    ) -> Optional[BanRecord]:
        """
        Lift a ban early.

        Args:
            user_id: User identifier
            ban_id: Ban identifier
            lifted_by: Admin who lifted the ban
            reason: Reason for lifting

        Returns:
            Updated ban record or None
        """
        bans = self._bans.get(user_id, [])

        for ban in bans:
            if ban.ban_id == ban_id:
                ban.lifted_at = datetime.utcnow()
                ban.lifted_by = lifted_by
                return ban

        return None

    def calculate_trust_score(
        self,
        user_id: str,
        total_sessions: int,
        account_age_days: int,
    ) -> float:
        """
        Calculate trust score for a user.

        Args:
            user_id: User identifier
            total_sessions: Total sessions completed
            account_age_days: Account age in days

        Returns:
            Trust score 0-100
        """
        base_score = 50.0

        # Add points for account age
        age_bonus = min(20, account_age_days / 30 * 5)  # Up to 20 points for 4+ months
        base_score += age_bonus

        # Add points for session count
        session_bonus = min(20, total_sessions / 50 * 10)  # Up to 20 points for 100+ sessions
        base_score += session_bonus

        # Subtract for violations
        violations = self.get_user_violations(user_id)
        high_confidence_violations = [v for v in violations if v.confidence >= 0.7]
        violation_penalty = len(high_confidence_violations) * 15
        base_score -= violation_penalty

        # Subtract for bans
        bans = self._bans.get(user_id, [])
        ban_penalty = len(bans) * 20
        base_score -= ban_penalty

        return max(0, min(100, base_score))

    def get_user_profile(
        self,
        user_id: str,
    ) -> UserCheatProfile:
        """
        Get complete cheat profile for a user.

        Args:
            user_id: User identifier

        Returns:
            User's cheat profile
        """
        violations = self.get_user_violations(user_id)
        bans = self._bans.get(user_id, [])
        warnings = sum(1 for b in bans if b.duration == BanDuration.WARNING)
        is_banned = self.is_user_banned(user_id)
        current_ban = self.get_current_ban(user_id)

        # Rough trust score calculation
        trust = 100 - (len(violations) * 5) - (len(bans) * 15)
        trust = max(0, min(100, trust))

        return UserCheatProfile(
            user_id=user_id,
            violations=violations,
            bans=bans,
            warning_count=warnings,
            trust_score=trust,
            is_currently_banned=is_banned,
            current_ban=current_ban,
        )


# Global instance
cheat_management_service = CheatManagementService()

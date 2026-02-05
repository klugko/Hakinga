"""
User progression domain entity.

Handles XP, levels, streaks, and ranking.
"""
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID


class RankTier(str, Enum):
    """Competitive rank tiers."""

    UNRANKED = "unranked"
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    DIAMOND = "diamond"
    MASTER = "master"
    GRANDMASTER = "grandmaster"


# Rank tier colors for frontend
RANK_COLORS = {
    RankTier.UNRANKED: "#808080",
    RankTier.BRONZE: "#CD7F32",
    RankTier.SILVER: "#C0C0C0",
    RankTier.GOLD: "#FFD700",
    RankTier.PLATINUM: "#00CED1",
    RankTier.DIAMOND: "#B9F2FF",
    RankTier.MASTER: "#9400D3",
    RankTier.GRANDMASTER: "#FF4500",
}

# MMR thresholds for each tier
MMR_THRESHOLDS = {
    RankTier.UNRANKED: 0,
    RankTier.BRONZE: 0,
    RankTier.SILVER: 1000,
    RankTier.GOLD: 1500,
    RankTier.PLATINUM: 2000,
    RankTier.DIAMOND: 2500,
    RankTier.MASTER: 3000,
    RankTier.GRANDMASTER: 3500,
}


@dataclass
class XPGain:
    """Represents XP gained from a session."""

    base_xp: int
    difficulty_multiplier: float
    mode_multiplier: float
    streak_bonus: int
    perfect_accuracy_bonus: int
    personal_best_bonus: int
    total_xp: int

    @property
    def breakdown(self) -> dict:
        """Get detailed XP breakdown."""
        return {
            "base_xp": self.base_xp,
            "difficulty_multiplier": self.difficulty_multiplier,
            "mode_multiplier": self.mode_multiplier,
            "streak_bonus": self.streak_bonus,
            "perfect_accuracy_bonus": self.perfect_accuracy_bonus,
            "personal_best_bonus": self.personal_best_bonus,
            "total_xp": self.total_xp,
        }


@dataclass
class LevelInfo:
    """Information about a user's level."""

    level: int
    current_xp: int
    xp_for_current_level: int
    xp_for_next_level: int
    progress_percent: float

    @property
    def xp_needed(self) -> int:
        """XP needed to reach next level."""
        return self.xp_for_next_level - self.current_xp


@dataclass
class UserProgress:
    """
    User progression domain entity.

    Tracks XP, level, streaks, and competitive ranking.
    """

    id: UUID
    user_id: UUID
    total_xp: int = 0
    current_level: int = 1
    current_streak: int = 0
    best_streak: int = 0
    last_session_date: Optional[datetime] = None
    rank_tier: RankTier = RankTier.UNRANKED
    mmr: int = 1000
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @staticmethod
    def calculate_xp_for_level(level: int) -> int:
        """
        Calculate total XP required to reach a level.

        Formula: XP = 100 * (level ** 1.8)

        Examples:
            Level 1: 0 XP
            Level 10: 3,162 XP
            Level 25: 19,953 XP
            Level 50: 82,319 XP
        """
        if level <= 1:
            return 0
        return int(100 * (level ** 1.8))

    @staticmethod
    def calculate_level_from_xp(total_xp: int) -> int:
        """Calculate level from total XP."""
        level = 1
        while UserProgress.calculate_xp_for_level(level + 1) <= total_xp:
            level += 1
        return level

    def get_level_info(self) -> LevelInfo:
        """Get detailed level information."""
        xp_for_current = self.calculate_xp_for_level(self.current_level)
        xp_for_next = self.calculate_xp_for_level(self.current_level + 1)
        xp_in_level = xp_for_next - xp_for_current
        xp_progress = self.total_xp - xp_for_current

        progress_percent = (xp_progress / xp_in_level * 100) if xp_in_level > 0 else 0

        return LevelInfo(
            level=self.current_level,
            current_xp=self.total_xp,
            xp_for_current_level=xp_for_current,
            xp_for_next_level=xp_for_next,
            progress_percent=min(100.0, max(0.0, progress_percent)),
        )

    def add_xp(self, xp_gain: XPGain) -> tuple[int, bool]:
        """
        Add XP to user progress.

        Returns:
            Tuple of (new_level, leveled_up)
        """
        old_level = self.current_level
        self.total_xp += xp_gain.total_xp
        self.current_level = self.calculate_level_from_xp(self.total_xp)
        return self.current_level, self.current_level > old_level

    def update_streak(self, session_date: datetime) -> int:
        """
        Update streak based on session date.

        Returns:
            The new streak value.
        """
        if self.last_session_date is None:
            self.current_streak = 1
        else:
            # Calculate days between sessions
            days_diff = (session_date.date() - self.last_session_date.date()).days

            if days_diff == 0:
                # Same day, streak unchanged
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                self.current_streak += 1
            else:
                # Streak broken, reset to 1
                self.current_streak = 1

        # Update best streak
        if self.current_streak > self.best_streak:
            self.best_streak = self.current_streak

        self.last_session_date = session_date
        return self.current_streak

    def get_rank_tier_from_mmr(self) -> RankTier:
        """Determine rank tier based on MMR."""
        if self.mmr >= MMR_THRESHOLDS[RankTier.GRANDMASTER]:
            return RankTier.GRANDMASTER
        elif self.mmr >= MMR_THRESHOLDS[RankTier.MASTER]:
            return RankTier.MASTER
        elif self.mmr >= MMR_THRESHOLDS[RankTier.DIAMOND]:
            return RankTier.DIAMOND
        elif self.mmr >= MMR_THRESHOLDS[RankTier.PLATINUM]:
            return RankTier.PLATINUM
        elif self.mmr >= MMR_THRESHOLDS[RankTier.GOLD]:
            return RankTier.GOLD
        elif self.mmr >= MMR_THRESHOLDS[RankTier.SILVER]:
            return RankTier.SILVER
        else:
            return RankTier.BRONZE

    def update_mmr(self, mmr_change: int) -> tuple[RankTier, bool]:
        """
        Update MMR and rank tier.

        Returns:
            Tuple of (new_rank_tier, rank_changed)
        """
        old_tier = self.rank_tier
        self.mmr = max(0, self.mmr + mmr_change)
        self.rank_tier = self.get_rank_tier_from_mmr()
        return self.rank_tier, self.rank_tier != old_tier

"""
XP calculation service.

Handles XP calculation, level progression, and streak management.
"""
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.domain.entities.progression import (
    LevelInfo,
    RankTier,
    UserProgress,
    XPGain,
)
from app.domain.entities.typing_session import SessionMode
from app.domain.repositories.progression_repository import ProgressionRepository

# XP Multipliers
DIFFICULTY_MULTIPLIERS = {
    "easy": 1.0,
    "medium": 1.3,
    "hard": 1.6,
    "expert": 2.0,
}

MODE_MULTIPLIERS = {
    SessionMode.SOLO: 1.0,
    SessionMode.PRIVATE: 1.2,
    SessionMode.COMPETITION: 1.5,
}

# Bonus XP values
PERFECT_ACCURACY_BONUS = 25  # +25% for 100% accuracy
PERSONAL_BEST_BONUS = 50  # +50% for new personal best
STREAK_BONUS_PER_DAY = 10  # +10% per streak day (max 100%)


class XPService:
    """Service handling XP calculations and progression."""

    def __init__(self, progression_repository: ProgressionRepository):
        self._progression_repo = progression_repository

    def calculate_base_xp(
        self,
        wpm: int,
        accuracy: float,
        total_characters: int,
    ) -> int:
        """
        Calculate base XP from session performance.

        Formula: Base XP = (WPM * 2) + (Accuracy * 1.5) + (Characters / 10)
        """
        wpm_component = wpm * 2
        accuracy_component = accuracy * 1.5
        character_component = total_characters / 10

        return int(wpm_component + accuracy_component + character_component)

    def calculate_xp_gain(
        self,
        wpm: int,
        accuracy: float,
        total_characters: int,
        difficulty: str = "medium",
        mode: SessionMode = SessionMode.SOLO,
        current_streak: int = 0,
        is_perfect_accuracy: bool = False,
        is_personal_best: bool = False,
    ) -> XPGain:
        """
        Calculate total XP gain with all multipliers and bonuses.

        Args:
            wpm: Words per minute achieved.
            accuracy: Accuracy percentage (0-100).
            total_characters: Total characters typed.
            difficulty: Text difficulty level.
            mode: Session mode.
            current_streak: Current daily streak.
            is_perfect_accuracy: Whether accuracy was 100%.
            is_personal_best: Whether this was a new personal best WPM.

        Returns:
            XPGain with full breakdown.
        """
        # Calculate base XP
        base_xp = self.calculate_base_xp(wpm, accuracy, total_characters)

        # Get multipliers
        difficulty_mult = DIFFICULTY_MULTIPLIERS.get(difficulty.lower(), 1.0)
        mode_mult = MODE_MULTIPLIERS.get(mode, 1.0)

        # Calculate streak bonus (capped at 100%)
        streak_bonus_percent = min(current_streak * STREAK_BONUS_PER_DAY, 100)
        streak_bonus = int(base_xp * streak_bonus_percent / 100)

        # Calculate perfect accuracy bonus
        perfect_bonus = 0
        if is_perfect_accuracy or accuracy >= 100.0:
            perfect_bonus = int(base_xp * PERFECT_ACCURACY_BONUS / 100)

        # Calculate personal best bonus
        pb_bonus = 0
        if is_personal_best:
            pb_bonus = int(base_xp * PERSONAL_BEST_BONUS / 100)

        # Calculate total
        multiplied_base = int(base_xp * difficulty_mult * mode_mult)
        total_xp = multiplied_base + streak_bonus + perfect_bonus + pb_bonus

        return XPGain(
            base_xp=base_xp,
            difficulty_multiplier=difficulty_mult,
            mode_multiplier=mode_mult,
            streak_bonus=streak_bonus,
            perfect_accuracy_bonus=perfect_bonus,
            personal_best_bonus=pb_bonus,
            total_xp=total_xp,
        )

    async def get_user_progress(self, user_id: UUID) -> UserProgress:
        """Get or create user progress."""
        progress = await self._progression_repo.get_by_user_id(user_id)

        if not progress:
            # Create new progress for user
            progress = UserProgress(
                id=uuid4(),
                user_id=user_id,
                total_xp=0,
                current_level=1,
                current_streak=0,
                best_streak=0,
                rank_tier=RankTier.UNRANKED,
                mmr=1000,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            progress = await self._progression_repo.create(progress)

        return progress

    async def award_session_xp(
        self,
        user_id: UUID,
        wpm: int,
        accuracy: float,
        total_characters: int,
        difficulty: str = "medium",
        mode: SessionMode = SessionMode.SOLO,
        previous_best_wpm: int = 0,
    ) -> tuple[XPGain, LevelInfo, bool, int]:
        """
        Award XP for a completed session.

        Args:
            user_id: User's ID.
            wpm: Words per minute achieved.
            accuracy: Accuracy percentage.
            total_characters: Total characters typed.
            difficulty: Text difficulty.
            mode: Session mode.
            previous_best_wpm: User's previous best WPM.

        Returns:
            Tuple of (xp_gain, level_info, leveled_up, new_streak).
        """
        # Get current progress
        progress = await self.get_user_progress(user_id)

        # Update streak
        session_date = datetime.now(UTC)
        new_streak = progress.update_streak(session_date)

        # Check for personal best
        is_personal_best = wpm > previous_best_wpm

        # Calculate XP
        xp_gain = self.calculate_xp_gain(
            wpm=wpm,
            accuracy=accuracy,
            total_characters=total_characters,
            difficulty=difficulty,
            mode=mode,
            current_streak=new_streak,
            is_perfect_accuracy=accuracy >= 100.0,
            is_personal_best=is_personal_best,
        )

        # Award XP
        new_level, leveled_up = progress.add_xp(xp_gain)

        # Update progress
        progress.updated_at = datetime.now(UTC)
        await self._progression_repo.update(progress)

        return xp_gain, progress.get_level_info(), leveled_up, new_streak

    async def get_level_info(self, user_id: UUID) -> LevelInfo:
        """Get user's current level information."""
        progress = await self.get_user_progress(user_id)
        return progress.get_level_info()

    async def get_leaderboard_by_level(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict]:
        """Get leaderboard sorted by level/XP."""
        return await self._progression_repo.get_top_by_xp(limit=limit, offset=offset)

    async def get_user_rank_position(self, user_id: UUID) -> int:
        """Get user's position in the XP leaderboard."""
        return await self._progression_repo.get_user_xp_rank(user_id)

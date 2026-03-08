"""
Adaptive text selection service.
Dynamically adjusts text difficulty based on user performance.
"""
from dataclasses import dataclass

from app.domain.entities.typing_text import Difficulty


@dataclass
class UserPerformanceMetrics:
    """User's recent performance metrics."""
    avg_wpm: float
    avg_accuracy: float
    recent_sessions: int
    current_level: int
    rank_tier: str


class AdaptiveTextService:
    """
    Service for adaptive text selection based on user skill.

    Adjusts difficulty dynamically to keep users in their
    optimal learning zone (not too easy, not too hard).
    """

    # WPM thresholds for difficulty levels
    EASY_THRESHOLD = 40
    MEDIUM_THRESHOLD = 70
    HARD_THRESHOLD = 100

    # Accuracy thresholds
    ACCURACY_STRUGGLING = 85  # Below this, might be too hard
    ACCURACY_MASTERING = 97   # Above this, might be too easy

    def recommend_difficulty(
        self,
        metrics: UserPerformanceMetrics,
        last_difficulty: Difficulty | None = None,
        last_accuracy: float | None = None,
    ) -> Difficulty:
        """
        Recommend the next text difficulty based on user performance.

        Args:
            metrics: User's overall performance metrics
            last_difficulty: Difficulty of the last session (if any)
            last_accuracy: Accuracy of the last session (if any)

        Returns:
            Recommended difficulty level
        """
        # Base difficulty on average WPM
        if metrics.avg_wpm < self.EASY_THRESHOLD:
            base_difficulty = Difficulty.EASY
        elif metrics.avg_wpm < self.MEDIUM_THRESHOLD:
            base_difficulty = Difficulty.MEDIUM
        else:
            base_difficulty = Difficulty.HARD

        # Adjust based on recent accuracy
        if metrics.avg_accuracy < self.ACCURACY_STRUGGLING:
            # User is struggling, consider easier texts
            if base_difficulty == Difficulty.HARD:
                return Difficulty.MEDIUM
            elif base_difficulty == Difficulty.MEDIUM:
                return Difficulty.EASY
            return Difficulty.EASY

        if metrics.avg_accuracy > self.ACCURACY_MASTERING:
            # User is mastering current level, challenge them
            if base_difficulty == Difficulty.EASY:
                return Difficulty.MEDIUM
            elif base_difficulty == Difficulty.MEDIUM:
                return Difficulty.HARD
            return Difficulty.HARD

        # Check if last session was too easy or too hard
        if last_difficulty and last_accuracy:
            if last_accuracy > 98:
                # Too easy, bump up
                if last_difficulty == Difficulty.EASY:
                    return Difficulty.MEDIUM
                elif last_difficulty == Difficulty.MEDIUM:
                    return Difficulty.HARD
            elif last_accuracy < 80:
                # Too hard, bump down
                if last_difficulty == Difficulty.HARD:
                    return Difficulty.MEDIUM
                elif last_difficulty == Difficulty.MEDIUM:
                    return Difficulty.EASY

        return base_difficulty

    def get_challenge_mode_difficulty(
        self,
        metrics: UserPerformanceMetrics,
    ) -> Difficulty:
        """
        Get difficulty for challenge mode (always pushes the user).

        Args:
            metrics: User's performance metrics

        Returns:
            Challenge difficulty (one level above normal)
        """
        normal = self.recommend_difficulty(metrics)

        if normal == Difficulty.EASY:
            return Difficulty.MEDIUM
        elif normal == Difficulty.MEDIUM:
            return Difficulty.HARD
        return Difficulty.HARD

    def get_practice_mode_difficulty(
        self,
        metrics: UserPerformanceMetrics,
    ) -> Difficulty:
        """
        Get difficulty for practice mode (comfortable zone).

        Args:
            metrics: User's performance metrics

        Returns:
            Practice difficulty (current or one level below)
        """
        normal = self.recommend_difficulty(metrics)

        if metrics.avg_accuracy < 90:
            # User needs more practice at easier level
            if normal == Difficulty.HARD:
                return Difficulty.MEDIUM
            elif normal == Difficulty.MEDIUM:
                return Difficulty.EASY
        return normal

    def explain_recommendation(
        self,
        metrics: UserPerformanceMetrics,
        recommended: Difficulty,
    ) -> str:
        """
        Generate a human-readable explanation for the recommendation.

        Args:
            metrics: User's performance metrics
            recommended: Recommended difficulty

        Returns:
            Explanation string
        """
        reasons = []

        if recommended == Difficulty.EASY:
            if metrics.avg_wpm < self.EASY_THRESHOLD:
                reasons.append(f"Your current speed ({metrics.avg_wpm:.0f} WPM) suggests starting with easier texts.")
            if metrics.avg_accuracy < self.ACCURACY_STRUGGLING:
                reasons.append(f"Your accuracy ({metrics.avg_accuracy:.1f}%) indicates you might benefit from simpler texts.")
            reasons.append("Focus on accuracy first, then gradually increase speed.")

        elif recommended == Difficulty.MEDIUM:
            if self.EASY_THRESHOLD <= metrics.avg_wpm < self.MEDIUM_THRESHOLD:
                reasons.append(f"Your speed ({metrics.avg_wpm:.0f} WPM) is perfect for medium difficulty.")
            reasons.append("You're in the optimal learning zone - challenging but achievable.")

        else:  # HARD
            if metrics.avg_wpm >= self.HARD_THRESHOLD:
                reasons.append(f"Your speed ({metrics.avg_wpm:.0f} WPM) shows you're ready for advanced texts.")
            if metrics.avg_accuracy > self.ACCURACY_MASTERING:
                reasons.append(f"Your high accuracy ({metrics.avg_accuracy:.1f}%) indicates mastery - time to challenge yourself!")

        return " ".join(reasons) if reasons else f"Based on your performance, {recommended.value} difficulty is recommended."


# Global instance
adaptive_text_service = AdaptiveTextService()

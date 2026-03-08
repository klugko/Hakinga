"""
Tests for adaptive text service.
"""
from app.application.services.adaptive_text import (
    AdaptiveTextService,
    UserPerformanceMetrics,
)
from app.domain.entities.typing_text import Difficulty


class TestAdaptiveTextService:
    """Test cases for AdaptiveTextService."""

    def setup_method(self):
        self.service = AdaptiveTextService()

    def test_recommend_difficulty_beginner(self):
        """Test difficulty recommendation for beginner."""
        metrics = UserPerformanceMetrics(
            avg_wpm=30,
            avg_accuracy=85,
            recent_sessions=10,
            current_level=1,
            rank_tier="bronze",
        )

        result = self.service.recommend_difficulty(metrics)

        assert result == Difficulty.EASY

    def test_recommend_difficulty_intermediate(self):
        """Test difficulty recommendation for intermediate user."""
        metrics = UserPerformanceMetrics(
            avg_wpm=55,
            avg_accuracy=93,
            recent_sessions=25,
            current_level=5,
            rank_tier="silver",
        )

        result = self.service.recommend_difficulty(metrics)

        assert result == Difficulty.MEDIUM

    def test_recommend_difficulty_advanced(self):
        """Test difficulty recommendation for advanced user."""
        metrics = UserPerformanceMetrics(
            avg_wpm=85,
            avg_accuracy=96,
            recent_sessions=100,
            current_level=15,
            rank_tier="gold",
        )

        result = self.service.recommend_difficulty(metrics)

        assert result == Difficulty.HARD

    def test_recommend_difficulty_struggling_user(self):
        """Test difficulty adjustment for struggling user."""
        metrics = UserPerformanceMetrics(
            avg_wpm=60,  # Medium range
            avg_accuracy=82,  # Below struggling threshold
            recent_sessions=20,
            current_level=5,
            rank_tier="silver",
        )

        result = self.service.recommend_difficulty(metrics)

        # Should recommend easier difficulty due to low accuracy
        assert result == Difficulty.EASY

    def test_recommend_difficulty_mastering_user(self):
        """Test difficulty bump for mastering user."""
        metrics = UserPerformanceMetrics(
            avg_wpm=45,  # Would normally be MEDIUM
            avg_accuracy=98,  # Above mastering threshold
            recent_sessions=30,
            current_level=5,
            rank_tier="silver",
        )

        result = self.service.recommend_difficulty(metrics)

        # Should bump up due to high accuracy (MEDIUM -> HARD)
        assert result == Difficulty.HARD

    def test_recommend_difficulty_with_last_session_too_easy(self):
        """Test adjustment when last session was too easy."""
        metrics = UserPerformanceMetrics(
            avg_wpm=55,
            avg_accuracy=93,
            recent_sessions=20,
            current_level=5,
            rank_tier="silver",
        )

        result = self.service.recommend_difficulty(
            metrics,
            last_difficulty=Difficulty.EASY,
            last_accuracy=99,  # Too easy
        )

        # Should bump up
        assert result == Difficulty.MEDIUM

    def test_recommend_difficulty_with_last_session_too_hard(self):
        """Test adjustment when last session was too hard."""
        metrics = UserPerformanceMetrics(
            avg_wpm=55,
            avg_accuracy=93,
            recent_sessions=20,
            current_level=5,
            rank_tier="silver",
        )

        result = self.service.recommend_difficulty(
            metrics,
            last_difficulty=Difficulty.HARD,
            last_accuracy=75,  # Too hard
        )

        # Should bump down
        assert result == Difficulty.MEDIUM

    def test_challenge_mode_difficulty(self):
        """Test challenge mode always pushes user."""
        metrics = UserPerformanceMetrics(
            avg_wpm=55,
            avg_accuracy=93,
            recent_sessions=20,
            current_level=5,
            rank_tier="silver",
        )

        normal = self.service.recommend_difficulty(metrics)
        challenge = self.service.get_challenge_mode_difficulty(metrics)

        # Challenge should be harder
        if normal == Difficulty.EASY:
            assert challenge == Difficulty.MEDIUM
        elif normal == Difficulty.MEDIUM:
            assert challenge == Difficulty.HARD
        else:
            assert challenge == Difficulty.HARD

    def test_practice_mode_difficulty_struggling(self):
        """Test practice mode for struggling user."""
        metrics = UserPerformanceMetrics(
            avg_wpm=55,
            avg_accuracy=85,  # Lower accuracy
            recent_sessions=20,
            current_level=5,
            rank_tier="silver",
        )

        normal = self.service.recommend_difficulty(metrics)
        practice = self.service.get_practice_mode_difficulty(metrics)

        # Practice should be easier for struggling user
        if normal in [Difficulty.HARD, Difficulty.MEDIUM]:
            assert practice.value <= normal.value

    def test_explain_recommendation_easy(self):
        """Test explanation for easy difficulty."""
        metrics = UserPerformanceMetrics(
            avg_wpm=30,
            avg_accuracy=80,
            recent_sessions=5,
            current_level=1,
            rank_tier="bronze",
        )

        explanation = self.service.explain_recommendation(metrics, Difficulty.EASY)

        assert len(explanation) > 0
        assert "WPM" in explanation or "accuracy" in explanation.lower()

    def test_explain_recommendation_hard(self):
        """Test explanation for hard difficulty."""
        metrics = UserPerformanceMetrics(
            avg_wpm=110,
            avg_accuracy=98,
            recent_sessions=100,
            current_level=20,
            rank_tier="diamond",
        )

        explanation = self.service.explain_recommendation(metrics, Difficulty.HARD)

        assert len(explanation) > 0

"""
Tests for anti-cheat service.
"""
from app.application.services.anti_cheat import AntiCheatService


class TestAntiCheatService:
    """Test cases for AntiCheatService."""

    def setup_method(self):
        self.service = AntiCheatService()

    def test_validate_session_normal_speed(self):
        """Test validation of normal typing speed."""
        result = self.service.validate_session(
            wpm=65,
            accuracy=94,
            duration_seconds=120,
            total_characters=500,
            errors=30,
        )

        assert result.is_valid
        assert result.confidence >= 0.8
        assert len(result.flags) == 0

    def test_validate_session_impossible_wpm(self):
        """Test detection of impossible WPM."""
        result = self.service.validate_session(
            wpm=300,  # Impossible speed
            accuracy=100,
            duration_seconds=60,
            total_characters=200,
            errors=0,
        )

        assert not result.is_valid
        assert "impossible_wpm" in result.flags
        assert result.confidence == 0.0

    def test_validate_session_elite_wpm_perfect_accuracy(self):
        """Test flagging of elite WPM with perfect accuracy."""
        result = self.service.validate_session(
            wpm=190,  # Elite level
            accuracy=99.9,  # Perfect accuracy
            duration_seconds=60,
            total_characters=200,
            errors=0,
        )

        assert "elite_wpm_perfect_accuracy" in result.flags
        assert result.confidence < 1.0

    def test_validate_session_suspicious_improvement(self):
        """Test detection of suspicious improvement."""
        result = self.service.validate_session(
            wpm=120,
            accuracy=95,
            duration_seconds=120,
            total_characters=500,
            errors=25,
            user_average_wpm=50,  # Big jump from average
        )

        assert "suspicious_improvement" in result.flags
        assert result.confidence < 0.8

    def test_validate_session_impossible_duration(self):
        """Test detection of impossible duration."""
        # Formula: expected_min = chars / (250 * 5) = 0.8 minutes for 1000 chars
        # Threshold: 0.8 * 0.8 = 0.64, so duration must be < 0.64 to trigger
        result = self.service.validate_session(
            wpm=150,
            accuracy=95,
            duration_seconds=0.5,  # Below threshold
            total_characters=1000,
            errors=50,
        )

        assert "impossible_duration" in result.flags

    def test_validate_keystroke_timing_normal(self):
        """Test validation of normal keystroke timing."""
        # Simulate normal typing with variation
        times = [120, 90, 150, 110, 130, 95, 140, 105, 125, 115, 600, 100, 110]

        result = self.service.validate_keystroke_timing(times)

        assert result.is_valid
        assert "robotic_timing" not in result.flags

    def test_validate_keystroke_timing_robotic(self):
        """Test detection of robotic timing."""
        # Very consistent timing (bot-like)
        times = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]

        result = self.service.validate_keystroke_timing(times)

        assert "robotic_timing" in result.flags
        assert result.confidence < 0.5

    def test_validate_keystroke_timing_impossible_speed(self):
        """Test detection of impossible keystroke speed."""
        # Some keystrokes impossibly fast (< 30ms)
        times = [100, 15, 100, 10, 100, 20, 100, 25, 100, 18, 100, 22]

        result = self.service.validate_keystroke_timing(times)

        assert "impossible_keystroke_speed" in result.flags

    def test_validate_keystroke_timing_no_pauses(self):
        """Test detection of no natural pauses."""
        # All keystrokes fast, no pauses (unnatural)
        times = [100] * 60  # 60 keystrokes, no pauses

        result = self.service.validate_keystroke_timing(times)

        assert "no_natural_pauses" in result.flags

    def test_validate_keystroke_timing_short_input(self):
        """Test handling of too few keystrokes."""
        times = [100, 120, 110]  # Less than 10

        result = self.service.validate_keystroke_timing(times)

        assert result.is_valid
        assert result.confidence == 1.0

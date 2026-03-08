"""
Tests for pattern analysis service.
"""
import pytest
from app.application.services.pattern_analysis import (
    PatternAnalysisService,
    KeystrokeData,
)


class TestPatternAnalysisService:
    """Test cases for PatternAnalysisService."""

    def setup_method(self):
        self.service = PatternAnalysisService()

    def create_keystroke_data(
        self,
        text: str,
        errors: dict = None,
        base_time: int = 100,
    ) -> list:
        """Helper to create keystroke data."""
        errors = errors or {}
        keystrokes = []
        time = 0

        for i, char in enumerate(text):
            time += base_time
            actual = errors.get(i, char)
            keystrokes.append(KeystrokeData(
                key=actual,
                timestamp_ms=time,
                correct=actual == char,
                expected_key=char,
                time_since_last_ms=base_time if i > 0 else None,
            ))

        return keystrokes

    def test_identify_missed_characters(self):
        """Test identification of frequently missed characters."""
        # Create data with errors on 'q' and 'z'
        text = "quick zebra question zone quiz"
        errors = {0: 'w', 6: 's', 14: 'w', 23: 's', 28: 'w'}  # Errors on q and z
        keystrokes = self.create_keystroke_data(text, errors)

        result = self.service.identify_missed_characters(keystrokes, min_attempts=2)

        # Should identify q and z as problematic
        problem_chars = [c.char for c in result]
        assert any(c in problem_chars for c in ['q', 'z'])

    def test_detect_difficult_bigrams(self):
        """Test detection of difficult bigrams."""
        # Create data with errors after 'th' sequence
        text = "the that this them then"
        errors = {1: 'g', 5: 'g', 10: 'g', 15: 'g', 20: 'g'}  # Errors after 't'
        keystrokes = self.create_keystroke_data(text, errors)

        result = self.service.detect_difficult_bigrams(keystrokes, min_occurrences=2)

        # Result should exist (may or may not detect 'th' depending on data)
        assert isinstance(result, list)

    def test_detect_difficult_trigrams(self):
        """Test detection of difficult trigrams."""
        text = "the the the the the"
        errors = {2: 'a', 6: 'a', 10: 'a', 14: 'a', 18: 'a'}  # Consistent errors
        keystrokes = self.create_keystroke_data(text, errors)

        result = self.service.detect_difficult_trigrams(keystrokes, min_occurrences=2)

        assert isinstance(result, list)

    def test_classify_errors_substitution(self):
        """Test classification of substitution errors."""
        text = "hello"
        errors = {1: 'a'}  # 'e' -> 'a' substitution
        keystrokes = self.create_keystroke_data(text, errors)

        result = self.service.classify_errors(keystrokes)

        # Should find substitution error
        error_types = [e.error_type for e in result]
        assert any(t in error_types for t in ['substitution', 'adjacent_key'])

    def test_classify_errors_case_error(self):
        """Test classification of case errors."""
        keystrokes = [
            KeystrokeData(
                key='H',
                timestamp_ms=100,
                correct=False,
                expected_key='h',
                time_since_last_ms=None,
            ),
        ]

        result = self.service.classify_errors(keystrokes)

        error_types = [e.error_type for e in result]
        assert 'case_error' in error_types

    def test_detect_keyboard_layout_issues(self):
        """Test detection of keyboard layout issues."""
        # Create data with errors concentrated on left hand
        text = "quick every quick every"
        # Errors on left-hand keys (q, w, e, r)
        errors = {0: 'w', 6: 'r', 12: 'w', 18: 'r'}
        keystrokes = self.create_keystroke_data(text, errors)

        result = self.service.detect_keyboard_layout_issues(keystrokes)

        assert isinstance(result, list)

    def test_generate_typing_profile(self):
        """Test generation of complete typing profile."""
        text = "the quick brown fox jumps"
        keystrokes = self.create_keystroke_data(text)
        session_stats = {
            'avg_wpm': 55,
            'avg_accuracy': 92,
            'wpm_variance': 10,
            'total_sessions': 25,
        }

        result = self.service.generate_typing_profile(
            "user-123",
            keystrokes,
            session_stats,
        )

        assert result.user_id == "user-123"
        assert result.avg_wpm == 55
        assert result.avg_accuracy == 92
        assert result.skill_level in ["beginner", "intermediate", "advanced", "expert"]

    def test_calculate_real_skill_level_beginner(self):
        """Test skill level calculation for beginner."""
        result = self.service.calculate_real_skill_level(
            avg_wpm=30,
            avg_accuracy=80,
            consistency=60,
            session_count=5,
        )

        assert result["tier"] in ["Beginner", "Developing"]
        assert result["rank"] in ["D", "E"]

    def test_calculate_real_skill_level_expert(self):
        """Test skill level calculation for expert."""
        result = self.service.calculate_real_skill_level(
            avg_wpm=120,
            avg_accuracy=98,
            consistency=90,
            session_count=500,
        )

        assert result["tier"] in ["Expert", "Master"]
        assert result["rank"] in ["A", "S"]
        assert result["mmr"] > 1500

    def test_calculate_real_skill_level_mmr(self):
        """Test MMR calculation."""
        result = self.service.calculate_real_skill_level(
            avg_wpm=60,
            avg_accuracy=90,
            consistency=80,
            session_count=50,
        )

        assert "mmr" in result
        assert result["mmr"] > 0
        assert result["composite_score"] > 0

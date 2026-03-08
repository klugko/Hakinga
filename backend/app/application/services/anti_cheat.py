"""
Anti-cheat service for detecting suspicious typing patterns.
"""
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class ValidationResult:
    """Result of anti-cheat validation."""
    is_valid: bool
    flags: List[str]
    confidence: float  # 0.0 to 1.0
    message: Optional[str] = None


class AntiCheatService:
    """
    Service for detecting cheating in typing sessions.

    Checks for:
    - Impossible WPM scores
    - Suspicious patterns (too consistent, robotic timing)
    - Copy-paste detection
    """

    # Maximum realistic WPM (world record is ~216 WPM sustained)
    MAX_REALISTIC_WPM = 250

    # Minimum realistic WPM (below this might be inactive)
    MIN_REALISTIC_WPM = 5

    # Maximum realistic accuracy for short texts
    MAX_REALISTIC_ACCURACY = 100

    # World record holder for typing speed
    ELITE_WPM_THRESHOLD = 180

    def validate_session(
        self,
        wpm: float,
        accuracy: float,
        duration_seconds: int,
        total_characters: int,
        errors: int,
        user_average_wpm: Optional[float] = None,
    ) -> ValidationResult:
        """
        Validate a typing session for potential cheating.

        Args:
            wpm: Words per minute achieved
            accuracy: Accuracy percentage
            duration_seconds: Session duration in seconds
            total_characters: Total characters typed
            errors: Number of errors made
            user_average_wpm: User's historical average WPM (if available)

        Returns:
            ValidationResult with validity status and flags
        """
        flags = []
        confidence = 1.0  # Start assuming valid

        # Check 1: Impossible WPM
        if wpm > self.MAX_REALISTIC_WPM:
            flags.append("impossible_wpm")
            confidence = 0.0
            return ValidationResult(
                is_valid=False,
                flags=flags,
                confidence=confidence,
                message=f"WPM of {wpm:.0f} exceeds maximum realistic speed of {self.MAX_REALISTIC_WPM}",
            )

        # Check 2: Elite WPM with perfect accuracy is suspicious
        if wpm > self.ELITE_WPM_THRESHOLD and accuracy >= 99.5:
            flags.append("elite_wpm_perfect_accuracy")
            confidence *= 0.7

        # Check 3: Very high WPM (above 150) requires some scrutiny
        if wpm > 150:
            flags.append("very_high_wpm")
            confidence *= 0.9

        # Check 4: Duration too short for character count
        # Average typist types about 200 characters per minute (40 WPM)
        # Elite typist might type 1000 characters per minute (200 WPM)
        expected_min_duration = total_characters / (self.MAX_REALISTIC_WPM * 5)  # 5 chars per word
        if duration_seconds < expected_min_duration * 0.8:
            flags.append("impossible_duration")
            confidence *= 0.3

        # Check 5: Sudden improvement from user's average
        if user_average_wpm:
            improvement_ratio = wpm / user_average_wpm
            if improvement_ratio > 2.0:  # More than 2x improvement is suspicious
                flags.append("suspicious_improvement")
                confidence *= 0.5
            elif improvement_ratio > 1.5:  # 50% improvement warrants notice
                flags.append("significant_improvement")
                confidence *= 0.8

        # Check 6: Too few errors for high WPM
        # At high speeds, humans typically make some errors
        if wpm > 120 and errors == 0 and total_characters > 100:
            flags.append("no_errors_high_speed")
            confidence *= 0.7

        # Determine validity
        is_valid = confidence >= 0.5 and "impossible_wpm" not in flags and "impossible_duration" not in flags

        return ValidationResult(
            is_valid=is_valid,
            flags=flags,
            confidence=confidence,
            message="Session flagged for review" if not is_valid else None,
        )

    def validate_keystroke_timing(
        self,
        inter_keystroke_times: List[float],
    ) -> ValidationResult:
        """
        Validate keystroke timing patterns for bot detection.

        Args:
            inter_keystroke_times: List of times between keystrokes in milliseconds

        Returns:
            ValidationResult with validity status
        """
        flags = []
        confidence = 1.0

        if len(inter_keystroke_times) < 10:
            return ValidationResult(is_valid=True, flags=[], confidence=1.0)

        # Calculate statistics
        avg_time = sum(inter_keystroke_times) / len(inter_keystroke_times)
        variance = sum((t - avg_time) ** 2 for t in inter_keystroke_times) / len(inter_keystroke_times)
        std_dev = variance ** 0.5

        # Check 1: Too consistent timing (bots have very low variance)
        coefficient_of_variation = std_dev / avg_time if avg_time > 0 else 0
        if coefficient_of_variation < 0.1:  # Less than 10% variation
            flags.append("robotic_timing")
            confidence *= 0.3

        # Check 2: Impossibly fast keystrokes (less than 30ms between keys)
        fast_keystrokes = sum(1 for t in inter_keystroke_times if t < 30)
        if fast_keystrokes > len(inter_keystroke_times) * 0.1:  # More than 10% are too fast
            flags.append("impossible_keystroke_speed")
            confidence *= 0.4

        # Check 3: No natural pauses (humans pause between words/thoughts)
        long_pauses = sum(1 for t in inter_keystroke_times if t > 500)
        if long_pauses == 0 and len(inter_keystroke_times) > 50:
            flags.append("no_natural_pauses")
            confidence *= 0.7

        is_valid = confidence >= 0.5

        return ValidationResult(
            is_valid=is_valid,
            flags=flags,
            confidence=confidence,
            message="Suspicious keystroke pattern detected" if not is_valid else None,
        )


# Global instance
anti_cheat_service = AntiCheatService()

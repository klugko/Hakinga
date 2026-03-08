"""
Pattern analysis service for keystroke and typing patterns.
Implements ML-based analysis for identifying weaknesses and patterns.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from collections import Counter
import math


@dataclass
class KeystrokeData:
    """Individual keystroke data."""
    key: str
    timestamp_ms: int
    correct: bool
    expected_key: str
    time_since_last_ms: Optional[int] = None


@dataclass
class BigramStats:
    """Statistics for a character bigram."""
    bigram: str
    count: int
    avg_time_ms: float
    error_rate: float
    is_problematic: bool = False


@dataclass
class CharacterStats:
    """Statistics for a single character."""
    char: str
    total_attempts: int
    errors: int
    avg_time_ms: float
    error_rate: float


@dataclass
class TypingProfile:
    """Complete typing profile for a user."""
    user_id: str
    total_sessions: int
    avg_wpm: float
    avg_accuracy: float
    problematic_chars: List[CharacterStats]
    problematic_bigrams: List[BigramStats]
    problematic_trigrams: List[str]
    keyboard_layout_issues: List[str]
    error_patterns: Dict[str, int]
    skill_level: str  # "beginner", "intermediate", "advanced", "expert"
    consistency_score: float  # 0-100
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)


@dataclass
class ErrorClassification:
    """Classification of typing errors."""
    error_type: str  # "substitution", "insertion", "deletion", "transposition"
    frequency: int
    examples: List[Tuple[str, str]]  # (expected, actual)


class PatternAnalysisService:
    """
    Service for analyzing typing patterns and identifying weaknesses.

    Implements features for:
    - Identifying frequently missed characters
    - Detecting difficult bigrams and trigrams
    - Classifying errors by type
    - Detecting keyboard layout issues
    """

    # Common keyboard layout adjacent keys (QWERTY)
    ADJACENT_KEYS = {
        'q': ['w', 'a', '1', '2'],
        'w': ['q', 'e', 'a', 's', '2', '3'],
        'e': ['w', 'r', 's', 'd', '3', '4'],
        'r': ['e', 't', 'd', 'f', '4', '5'],
        't': ['r', 'y', 'f', 'g', '5', '6'],
        'y': ['t', 'u', 'g', 'h', '6', '7'],
        'u': ['y', 'i', 'h', 'j', '7', '8'],
        'i': ['u', 'o', 'j', 'k', '8', '9'],
        'o': ['i', 'p', 'k', 'l', '9', '0'],
        'p': ['o', 'l', '0', '-'],
        'a': ['q', 'w', 's', 'z'],
        's': ['a', 'w', 'e', 'd', 'z', 'x'],
        'd': ['s', 'e', 'r', 'f', 'x', 'c'],
        'f': ['d', 'r', 't', 'g', 'c', 'v'],
        'g': ['f', 't', 'y', 'h', 'v', 'b'],
        'h': ['g', 'y', 'u', 'j', 'b', 'n'],
        'j': ['h', 'u', 'i', 'k', 'n', 'm'],
        'k': ['j', 'i', 'o', 'l', 'm'],
        'l': ['k', 'o', 'p'],
        'z': ['a', 's', 'x'],
        'x': ['z', 's', 'd', 'c'],
        'c': ['x', 'd', 'f', 'v'],
        'v': ['c', 'f', 'g', 'b'],
        'b': ['v', 'g', 'h', 'n'],
        'n': ['b', 'h', 'j', 'm'],
        'm': ['n', 'j', 'k'],
    }

    # Hand assignments for QWERTY
    LEFT_HAND = set('qwertasdfgzxcvb12345')
    RIGHT_HAND = set('yuiophjklnm67890')

    def identify_missed_characters(
        self,
        keystroke_history: List[KeystrokeData],
        min_attempts: int = 10,
    ) -> List[CharacterStats]:
        """
        Identify frequently missed characters.

        Args:
            keystroke_history: List of keystroke data
            min_attempts: Minimum attempts to consider

        Returns:
            List of problematic character statistics
        """
        char_stats: Dict[str, Dict] = {}

        for keystroke in keystroke_history:
            char = keystroke.expected_key.lower()
            if char not in char_stats:
                char_stats[char] = {
                    'total': 0,
                    'errors': 0,
                    'times': [],
                }

            char_stats[char]['total'] += 1
            if not keystroke.correct:
                char_stats[char]['errors'] += 1
            if keystroke.time_since_last_ms:
                char_stats[char]['times'].append(keystroke.time_since_last_ms)

        problematic = []
        for char, stats in char_stats.items():
            if stats['total'] >= min_attempts:
                error_rate = stats['errors'] / stats['total']
                avg_time = sum(stats['times']) / len(stats['times']) if stats['times'] else 0

                # Consider problematic if error rate > 10%
                if error_rate > 0.10:
                    problematic.append(CharacterStats(
                        char=char,
                        total_attempts=stats['total'],
                        errors=stats['errors'],
                        avg_time_ms=avg_time,
                        error_rate=error_rate,
                    ))

        # Sort by error rate descending
        return sorted(problematic, key=lambda x: x.error_rate, reverse=True)

    def detect_difficult_bigrams(
        self,
        keystroke_history: List[KeystrokeData],
        min_occurrences: int = 5,
    ) -> List[BigramStats]:
        """
        Detect difficult character bigrams (2-character sequences).

        Args:
            keystroke_history: List of keystroke data
            min_occurrences: Minimum occurrences to consider

        Returns:
            List of problematic bigram statistics
        """
        bigrams: Dict[str, Dict] = {}

        for i in range(1, len(keystroke_history)):
            prev = keystroke_history[i - 1]
            curr = keystroke_history[i]

            bigram = f"{prev.expected_key.lower()}{curr.expected_key.lower()}"

            if bigram not in bigrams:
                bigrams[bigram] = {
                    'count': 0,
                    'errors': 0,
                    'times': [],
                }

            bigrams[bigram]['count'] += 1
            if not curr.correct:
                bigrams[bigram]['errors'] += 1
            if curr.time_since_last_ms:
                bigrams[bigram]['times'].append(curr.time_since_last_ms)

        result = []
        for bigram, stats in bigrams.items():
            if stats['count'] >= min_occurrences:
                error_rate = stats['errors'] / stats['count']
                avg_time = sum(stats['times']) / len(stats['times']) if stats['times'] else 0

                is_problematic = error_rate > 0.15 or avg_time > 300  # 300ms is slow

                if is_problematic:
                    result.append(BigramStats(
                        bigram=bigram,
                        count=stats['count'],
                        avg_time_ms=avg_time,
                        error_rate=error_rate,
                        is_problematic=True,
                    ))

        return sorted(result, key=lambda x: x.error_rate, reverse=True)

    def detect_difficult_trigrams(
        self,
        keystroke_history: List[KeystrokeData],
        min_occurrences: int = 3,
    ) -> List[str]:
        """
        Detect difficult character trigrams (3-character sequences).

        Args:
            keystroke_history: List of keystroke data
            min_occurrences: Minimum occurrences to consider

        Returns:
            List of problematic trigrams
        """
        trigrams: Dict[str, Dict] = {}

        for i in range(2, len(keystroke_history)):
            chars = [keystroke_history[j].expected_key.lower() for j in range(i-2, i+1)]
            trigram = ''.join(chars)

            if trigram not in trigrams:
                trigrams[trigram] = {'count': 0, 'errors': 0}

            trigrams[trigram]['count'] += 1
            if not keystroke_history[i].correct:
                trigrams[trigram]['errors'] += 1

        problematic = []
        for trigram, stats in trigrams.items():
            if stats['count'] >= min_occurrences:
                error_rate = stats['errors'] / stats['count']
                if error_rate > 0.20:  # 20% error rate
                    problematic.append(trigram)

        return problematic

    def classify_errors(
        self,
        keystroke_history: List[KeystrokeData],
    ) -> List[ErrorClassification]:
        """
        Classify typing errors by type.

        Types:
        - Substitution: Wrong key pressed
        - Insertion: Extra key pressed
        - Deletion: Key missed
        - Transposition: Adjacent keys swapped

        Args:
            keystroke_history: List of keystroke data

        Returns:
            List of error classifications
        """
        error_types: Dict[str, Dict] = {
            'substitution': {'count': 0, 'examples': []},
            'adjacent_key': {'count': 0, 'examples': []},
            'transposition': {'count': 0, 'examples': []},
            'case_error': {'count': 0, 'examples': []},
        }

        for i, keystroke in enumerate(keystroke_history):
            if keystroke.correct:
                continue

            expected = keystroke.expected_key
            actual = keystroke.key

            # Case error
            if expected.lower() == actual.lower():
                error_types['case_error']['count'] += 1
                error_types['case_error']['examples'].append((expected, actual))
                continue

            # Adjacent key error
            if expected.lower() in self.ADJACENT_KEYS:
                if actual.lower() in self.ADJACENT_KEYS.get(expected.lower(), []):
                    error_types['adjacent_key']['count'] += 1
                    error_types['adjacent_key']['examples'].append((expected, actual))
                    continue

            # Transposition (check if next char matches current expected)
            if i < len(keystroke_history) - 1:
                next_ks = keystroke_history[i + 1]
                if next_ks.expected_key == actual and next_ks.key == expected:
                    error_types['transposition']['count'] += 1
                    error_types['transposition']['examples'].append((expected, actual))
                    continue

            # Default: substitution
            error_types['substitution']['count'] += 1
            error_types['substitution']['examples'].append((expected, actual))

        result = []
        for error_type, data in error_types.items():
            if data['count'] > 0:
                result.append(ErrorClassification(
                    error_type=error_type,
                    frequency=data['count'],
                    examples=data['examples'][:5],  # Top 5 examples
                ))

        return sorted(result, key=lambda x: x.frequency, reverse=True)

    def detect_keyboard_layout_issues(
        self,
        keystroke_history: List[KeystrokeData],
    ) -> List[str]:
        """
        Detect potential keyboard layout issues.

        Checks for:
        - Hand imbalance (one hand slower)
        - Row preference issues
        - Finger weakness patterns

        Args:
            keystroke_history: List of keystroke data

        Returns:
            List of detected issues
        """
        issues = []

        # Analyze hand performance
        left_times = []
        right_times = []
        left_errors = 0
        right_errors = 0
        left_total = 0
        right_total = 0

        for keystroke in keystroke_history:
            char = keystroke.expected_key.lower()
            time = keystroke.time_since_last_ms or 0

            if char in self.LEFT_HAND:
                left_times.append(time)
                left_total += 1
                if not keystroke.correct:
                    left_errors += 1
            elif char in self.RIGHT_HAND:
                right_times.append(time)
                right_total += 1
                if not keystroke.correct:
                    right_errors += 1

        # Check hand balance
        if left_times and right_times:
            left_avg = sum(left_times) / len(left_times)
            right_avg = sum(right_times) / len(right_times)

            if left_avg > right_avg * 1.3:
                issues.append("Left hand is significantly slower - practice left-hand exercises")
            elif right_avg > left_avg * 1.3:
                issues.append("Right hand is significantly slower - practice right-hand exercises")

        # Check error rates by hand
        if left_total > 0 and right_total > 0:
            left_error_rate = left_errors / left_total
            right_error_rate = right_errors / right_total

            if left_error_rate > right_error_rate * 1.5 and left_error_rate > 0.1:
                issues.append("Higher error rate with left hand keys")
            elif right_error_rate > left_error_rate * 1.5 and right_error_rate > 0.1:
                issues.append("Higher error rate with right hand keys")

        # Check for pinky weakness (common issue)
        pinky_chars = set('qazpol')
        pinky_errors = 0
        pinky_total = 0

        for keystroke in keystroke_history:
            if keystroke.expected_key.lower() in pinky_chars:
                pinky_total += 1
                if not keystroke.correct:
                    pinky_errors += 1

        if pinky_total > 10 and pinky_errors / pinky_total > 0.15:
            issues.append("Pinky finger weakness detected - practice edge key exercises")

        return issues

    def generate_typing_profile(
        self,
        user_id: str,
        keystroke_history: List[KeystrokeData],
        session_stats: Dict,
    ) -> TypingProfile:
        """
        Generate a complete typing profile for a user.

        Args:
            user_id: User identifier
            keystroke_history: Historical keystroke data
            session_stats: Aggregated session statistics

        Returns:
            Complete typing profile
        """
        problematic_chars = self.identify_missed_characters(keystroke_history)
        problematic_bigrams = self.detect_difficult_bigrams(keystroke_history)
        problematic_trigrams = self.detect_difficult_trigrams(keystroke_history)
        error_classifications = self.classify_errors(keystroke_history)
        layout_issues = self.detect_keyboard_layout_issues(keystroke_history)

        # Calculate skill level
        avg_wpm = session_stats.get('avg_wpm', 0)
        avg_accuracy = session_stats.get('avg_accuracy', 0)

        if avg_wpm >= 100 and avg_accuracy >= 97:
            skill_level = "expert"
        elif avg_wpm >= 70 and avg_accuracy >= 95:
            skill_level = "advanced"
        elif avg_wpm >= 40 and avg_accuracy >= 90:
            skill_level = "intermediate"
        else:
            skill_level = "beginner"

        # Calculate consistency score
        wpm_variance = session_stats.get('wpm_variance', 0)
        consistency_score = max(0, min(100, 100 - (wpm_variance / 2)))

        # Identify strengths and weaknesses
        strengths = []
        weaknesses = []

        if avg_wpm > 80:
            strengths.append("High typing speed")
        if avg_accuracy > 97:
            strengths.append("Excellent accuracy")
        if consistency_score > 80:
            strengths.append("Consistent performance")

        if problematic_chars:
            weaknesses.append(f"Struggles with characters: {', '.join(c.char for c in problematic_chars[:3])}")
        if problematic_bigrams:
            weaknesses.append(f"Difficult sequences: {', '.join(b.bigram for b in problematic_bigrams[:3])}")
        if layout_issues:
            weaknesses.extend(layout_issues[:2])

        # Aggregate error patterns
        error_patterns = {ec.error_type: ec.frequency for ec in error_classifications}

        return TypingProfile(
            user_id=user_id,
            total_sessions=session_stats.get('total_sessions', 0),
            avg_wpm=avg_wpm,
            avg_accuracy=avg_accuracy,
            problematic_chars=problematic_chars,
            problematic_bigrams=problematic_bigrams,
            problematic_trigrams=problematic_trigrams,
            keyboard_layout_issues=layout_issues,
            error_patterns=error_patterns,
            skill_level=skill_level,
            consistency_score=consistency_score,
            strengths=strengths,
            weaknesses=weaknesses,
        )

    def calculate_real_skill_level(
        self,
        avg_wpm: float,
        avg_accuracy: float,
        consistency: float,
        session_count: int,
    ) -> Dict:
        """
        Calculate a real skill level based on multiple factors.

        Returns:
            Dictionary with skill level details
        """
        # Weighted score calculation
        wpm_score = min(100, (avg_wpm / 120) * 100)  # 120 WPM = max score
        accuracy_score = avg_accuracy
        consistency_score = consistency

        # Weight: 40% WPM, 40% accuracy, 20% consistency
        composite_score = (wpm_score * 0.4) + (accuracy_score * 0.4) + (consistency_score * 0.2)

        # Determine tier
        if composite_score >= 90:
            tier = "Master"
            rank = "S"
        elif composite_score >= 80:
            tier = "Expert"
            rank = "A"
        elif composite_score >= 70:
            tier = "Advanced"
            rank = "B"
        elif composite_score >= 55:
            tier = "Intermediate"
            rank = "C"
        elif composite_score >= 40:
            tier = "Developing"
            rank = "D"
        else:
            tier = "Beginner"
            rank = "E"

        # Calculate MMR-like rating
        base_mmr = int(composite_score * 20)  # 0-2000 range
        experience_bonus = min(200, session_count * 2)
        mmr = base_mmr + experience_bonus

        return {
            "tier": tier,
            "rank": rank,
            "mmr": mmr,
            "composite_score": round(composite_score, 1),
            "wpm_contribution": round(wpm_score * 0.4, 1),
            "accuracy_contribution": round(accuracy_score * 0.4, 1),
            "consistency_contribution": round(consistency_score * 0.2, 1),
        }


# Global instance
pattern_analysis_service = PatternAnalysisService()

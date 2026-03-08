"""
Fatigue detection service for typing sessions.
Detects when users are experiencing fatigue and suggests breaks.
"""
from dataclasses import dataclass


@dataclass
class FatigueIndicator:
    """Indicator of fatigue."""
    indicator_type: str
    severity: str  # "low", "medium", "high"
    value: float
    threshold: float
    description: str


@dataclass
class FatigueAnalysis:
    """Complete fatigue analysis result."""
    is_fatigued: bool
    fatigue_level: float  # 0-100
    indicators: list[FatigueIndicator]
    recommendation: str
    suggested_break_minutes: int


@dataclass
class FocusSession:
    """Recommended focus session."""
    session_type: str  # "warm_up", "intensive", "cooldown", "recovery"
    duration_minutes: int
    difficulty: str
    focus_area: str | None
    description: str


class FatigueDetectionService:
    """
    Service for detecting fatigue during typing sessions.

    Analyzes patterns to detect:
    - Speed decline over session
    - Accuracy drops
    - Increased error rates
    - Keystroke timing changes
    """

    # Fatigue thresholds
    SPEED_DECLINE_THRESHOLD = 15  # 15% decline triggers fatigue
    ACCURACY_DROP_THRESHOLD = 5  # 5% drop triggers fatigue
    ERROR_RATE_INCREASE_THRESHOLD = 50  # 50% increase in errors
    SESSION_LENGTH_THRESHOLD = 20  # Minutes before fatigue risk increases

    def detect_fatigue_in_session(
        self,
        wpm_over_time: list[float],
        accuracy_over_time: list[float],
        error_rates: list[float],
        session_duration_minutes: float,
    ) -> FatigueAnalysis:
        """
        Detect fatigue within a single session.

        Args:
            wpm_over_time: WPM measurements at intervals
            accuracy_over_time: Accuracy at intervals
            error_rates: Error rates at intervals
            session_duration_minutes: Total session duration

        Returns:
            FatigueAnalysis with indicators and recommendations
        """
        indicators = []
        fatigue_score = 0

        # Check speed decline
        if len(wpm_over_time) >= 3:
            initial_wpm = sum(wpm_over_time[:2]) / 2
            recent_wpm = sum(wpm_over_time[-2:]) / 2

            if initial_wpm > 0:
                speed_decline = (initial_wpm - recent_wpm) / initial_wpm * 100

                if speed_decline > self.SPEED_DECLINE_THRESHOLD:
                    severity = "high" if speed_decline > 25 else "medium"
                    indicators.append(FatigueIndicator(
                        indicator_type="speed_decline",
                        severity=severity,
                        value=speed_decline,
                        threshold=self.SPEED_DECLINE_THRESHOLD,
                        description=f"Speed dropped by {speed_decline:.1f}% since session start",
                    ))
                    fatigue_score += 30 if severity == "high" else 20

        # Check accuracy drop
        if len(accuracy_over_time) >= 3:
            initial_acc = sum(accuracy_over_time[:2]) / 2
            recent_acc = sum(accuracy_over_time[-2:]) / 2

            accuracy_drop = initial_acc - recent_acc

            if accuracy_drop > self.ACCURACY_DROP_THRESHOLD:
                severity = "high" if accuracy_drop > 10 else "medium"
                indicators.append(FatigueIndicator(
                    indicator_type="accuracy_drop",
                    severity=severity,
                    value=accuracy_drop,
                    threshold=self.ACCURACY_DROP_THRESHOLD,
                    description=f"Accuracy dropped by {accuracy_drop:.1f}%",
                ))
                fatigue_score += 25 if severity == "high" else 15

        # Check error rate increase
        if len(error_rates) >= 3:
            initial_errors = sum(error_rates[:2]) / 2
            recent_errors = sum(error_rates[-2:]) / 2

            if initial_errors > 0:
                error_increase = (recent_errors - initial_errors) / initial_errors * 100

                if error_increase > self.ERROR_RATE_INCREASE_THRESHOLD:
                    severity = "high" if error_increase > 100 else "medium"
                    indicators.append(FatigueIndicator(
                        indicator_type="error_increase",
                        severity=severity,
                        value=error_increase,
                        threshold=self.ERROR_RATE_INCREASE_THRESHOLD,
                        description=f"Error rate increased by {error_increase:.0f}%",
                    ))
                    fatigue_score += 20 if severity == "high" else 10

        # Check session duration
        if session_duration_minutes > self.SESSION_LENGTH_THRESHOLD:
            severity = "high" if session_duration_minutes > 40 else "medium" if session_duration_minutes > 30 else "low"
            indicators.append(FatigueIndicator(
                indicator_type="long_session",
                severity=severity,
                value=session_duration_minutes,
                threshold=self.SESSION_LENGTH_THRESHOLD,
                description=f"Session has been running for {session_duration_minutes:.0f} minutes",
            ))
            fatigue_score += 15 if severity == "high" else 10 if severity == "medium" else 5

        # Determine overall fatigue
        is_fatigued = fatigue_score >= 30

        # Generate recommendation
        if fatigue_score >= 50:
            recommendation = "You're showing significant signs of fatigue. Take a 10-15 minute break to rest your hands and eyes."
            break_minutes = 15
        elif fatigue_score >= 30:
            recommendation = "Mild fatigue detected. Consider taking a short 5-minute break."
            break_minutes = 5
        elif fatigue_score >= 15:
            recommendation = "You're doing well. A quick stretch might help maintain performance."
            break_minutes = 2
        else:
            recommendation = "No fatigue detected. Keep up the good work!"
            break_minutes = 0

        return FatigueAnalysis(
            is_fatigued=is_fatigued,
            fatigue_level=min(100, fatigue_score),
            indicators=indicators,
            recommendation=recommendation,
            suggested_break_minutes=break_minutes,
        )

    def detect_daily_fatigue(
        self,
        sessions_today: list[dict],
        total_typing_minutes: float,
    ) -> FatigueAnalysis:
        """
        Detect cumulative fatigue over a day.

        Args:
            sessions_today: List of session data from today
            total_typing_minutes: Total minutes spent typing today

        Returns:
            FatigueAnalysis for daily fatigue
        """
        indicators = []
        fatigue_score = 0

        # Check total practice time
        if total_typing_minutes > 120:  # More than 2 hours
            severity = "high" if total_typing_minutes > 180 else "medium"
            indicators.append(FatigueIndicator(
                indicator_type="cumulative_time",
                severity=severity,
                value=total_typing_minutes,
                threshold=120,
                description=f"You've practiced for {total_typing_minutes:.0f} minutes today",
            ))
            fatigue_score += 30 if severity == "high" else 20

        # Check performance trend through the day
        if len(sessions_today) >= 3:
            first_half_wpm = sum(s.get('wpm', 0) for s in sessions_today[:len(sessions_today)//2]) / (len(sessions_today)//2)
            second_half_wpm = sum(s.get('wpm', 0) for s in sessions_today[len(sessions_today)//2:]) / (len(sessions_today) - len(sessions_today)//2)

            if first_half_wpm > 0:
                decline = (first_half_wpm - second_half_wpm) / first_half_wpm * 100
                if decline > 10:
                    indicators.append(FatigueIndicator(
                        indicator_type="daily_decline",
                        severity="medium",
                        value=decline,
                        threshold=10,
                        description=f"Performance declined {decline:.1f}% through the day",
                    ))
                    fatigue_score += 15

        # Check number of sessions
        if len(sessions_today) > 10:
            indicators.append(FatigueIndicator(
                indicator_type="many_sessions",
                severity="medium",
                value=len(sessions_today),
                threshold=10,
                description=f"You've completed {len(sessions_today)} sessions today",
            ))
            fatigue_score += 10

        is_fatigued = fatigue_score >= 25

        if fatigue_score >= 40:
            recommendation = "You've practiced a lot today! Consider resting until tomorrow for optimal learning."
            break_minutes = 60
        elif fatigue_score >= 25:
            recommendation = "Good practice session today. Take a longer break before your next session."
            break_minutes = 30
        else:
            recommendation = "You're fresh and ready for more practice!"
            break_minutes = 0

        return FatigueAnalysis(
            is_fatigued=is_fatigued,
            fatigue_level=min(100, fatigue_score),
            indicators=indicators,
            recommendation=recommendation,
            suggested_break_minutes=break_minutes,
        )

    def suggest_focus_sessions(
        self,
        user_profile: dict,
        recent_fatigue: FatigueAnalysis | None = None,
        time_available_minutes: int = 30,
    ) -> list[FocusSession]:
        """
        Suggest focus sessions based on user state.

        Args:
            user_profile: User's typing profile
            recent_fatigue: Recent fatigue analysis if available
            time_available_minutes: Available practice time

        Returns:
            List of recommended focus sessions
        """
        sessions = []

        # Determine session intensity based on fatigue
        is_recovering = recent_fatigue and recent_fatigue.is_fatigued

        if is_recovering:
            # Recovery mode - gentle sessions
            sessions.append(FocusSession(
                session_type="recovery",
                duration_minutes=min(10, time_available_minutes),
                difficulty="easy",
                focus_area=None,
                description="Light practice to maintain muscle memory without strain",
            ))
            return sessions

        # Normal session planning
        weak_areas = user_profile.get('weaknesses', [])
        skill_level = user_profile.get('skill_level', 'intermediate')

        # Warm-up session
        if time_available_minutes >= 5:
            sessions.append(FocusSession(
                session_type="warm_up",
                duration_minutes=5,
                difficulty="easy",
                focus_area=None,
                description="Quick warm-up to get your fingers ready",
            ))

        # Main intensive session
        if time_available_minutes >= 15:
            main_duration = min(20, time_available_minutes - 10)
            focus_area = weak_areas[0] if weak_areas else None

            sessions.append(FocusSession(
                session_type="intensive",
                duration_minutes=main_duration,
                difficulty="medium" if skill_level == "beginner" else "hard",
                focus_area=focus_area,
                description="Main practice session" + (f" focusing on {focus_area}" if focus_area else ""),
            ))

        # Cooldown
        if time_available_minutes >= 25:
            sessions.append(FocusSession(
                session_type="cooldown",
                duration_minutes=5,
                difficulty="easy",
                focus_area=None,
                description="Relaxed session to wind down",
            ))

        # If limited time, single focused session
        if not sessions:
            sessions.append(FocusSession(
                session_type="quick_practice",
                duration_minutes=time_available_minutes,
                difficulty="medium",
                focus_area=weak_areas[0] if weak_areas else None,
                description="Quick focused practice session",
            ))

        return sessions


# Global instance
fatigue_detection_service = FatigueDetectionService()

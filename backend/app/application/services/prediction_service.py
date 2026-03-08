"""
Prediction service for typing performance forecasting.
Uses statistical models to predict future performance and detect patterns.
"""
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import math


@dataclass
class SessionRecord:
    """Historical session record."""
    date: datetime
    wpm: float
    accuracy: float
    duration_seconds: int
    difficulty: str


@dataclass
class WPMPrediction:
    """Predicted future WPM."""
    predicted_wpm: float
    confidence_interval: Tuple[float, float]
    days_ahead: int
    trend: str  # "improving", "stable", "declining"


@dataclass
class PlateauDetection:
    """Plateau detection result."""
    is_plateau: bool
    plateau_duration_days: int
    current_avg_wpm: float
    suggested_actions: List[str]


@dataclass
class DailyInsight:
    """Daily insight for the user."""
    insight_type: str
    title: str
    message: str
    data: Optional[Dict] = None
    priority: int = 1  # 1 = high, 2 = medium, 3 = low


@dataclass
class PerformanceExplanation:
    """Explanation of performance patterns."""
    factor: str
    impact: str  # "positive", "negative", "neutral"
    explanation: str
    recommendation: Optional[str] = None


class PredictionService:
    """
    Service for predicting typing performance and generating insights.

    Implements:
    - Future WPM prediction
    - Plateau detection
    - Daily insights
    - Performance explanations
    """

    # Minimum sessions for reliable predictions
    MIN_SESSIONS_FOR_PREDICTION = 10

    # Plateau detection parameters
    PLATEAU_THRESHOLD_PERCENT = 3  # Less than 3% change = plateau
    PLATEAU_MIN_DAYS = 7  # At least 7 days to consider a plateau

    def predict_future_wpm(
        self,
        session_history: List[SessionRecord],
        days_ahead: int = 30,
    ) -> Optional[WPMPrediction]:
        """
        Predict user's WPM in the future.

        Uses linear regression with exponential smoothing for prediction.

        Args:
            session_history: List of historical sessions
            days_ahead: Number of days to predict ahead

        Returns:
            WPM prediction or None if insufficient data
        """
        if len(session_history) < self.MIN_SESSIONS_FOR_PREDICTION:
            return None

        # Sort by date
        sorted_sessions = sorted(session_history, key=lambda x: x.date)

        # Calculate daily averages
        daily_wpm: Dict[datetime.date, List[float]] = {}
        for session in sorted_sessions:
            day = session.date.date()
            if day not in daily_wpm:
                daily_wpm[day] = []
            daily_wpm[day].append(session.wpm)

        # Create time series
        days = sorted(daily_wpm.keys())
        if len(days) < 5:
            return None

        # Calculate average WPM per day
        y_values = [sum(daily_wpm[d]) / len(daily_wpm[d]) for d in days]

        # Linear regression
        n = len(days)
        x_values = list(range(n))

        x_mean = sum(x_values) / n
        y_mean = sum(y_values) / n

        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, y_values))
        denominator = sum((x - x_mean) ** 2 for x in x_values)

        if denominator == 0:
            slope = 0
        else:
            slope = numerator / denominator

        intercept = y_mean - slope * x_mean

        # Predict future value
        future_x = n + days_ahead
        predicted_wpm = intercept + slope * future_x

        # Calculate standard error for confidence interval
        residuals = [y - (intercept + slope * x) for x, y in zip(x_values, y_values)]
        std_error = math.sqrt(sum(r ** 2 for r in residuals) / (n - 2)) if n > 2 else 5

        # 95% confidence interval
        margin = 1.96 * std_error * math.sqrt(1 + 1/n + (future_x - x_mean)**2 / denominator) if denominator > 0 else 10

        # Determine trend
        if slope > 0.1:
            trend = "improving"
        elif slope < -0.1:
            trend = "declining"
        else:
            trend = "stable"

        # Ensure predicted WPM is reasonable
        current_avg = sum(y_values[-5:]) / min(5, len(y_values))
        predicted_wpm = max(5, min(predicted_wpm, current_avg * 1.5))

        return WPMPrediction(
            predicted_wpm=round(predicted_wpm, 1),
            confidence_interval=(
                round(max(5, predicted_wpm - margin), 1),
                round(predicted_wpm + margin, 1),
            ),
            days_ahead=days_ahead,
            trend=trend,
        )

    def detect_plateau(
        self,
        session_history: List[SessionRecord],
    ) -> PlateauDetection:
        """
        Detect if user is in a performance plateau.

        Args:
            session_history: List of historical sessions

        Returns:
            Plateau detection result
        """
        if len(session_history) < 10:
            return PlateauDetection(
                is_plateau=False,
                plateau_duration_days=0,
                current_avg_wpm=0,
                suggested_actions=["Complete more sessions to detect patterns"],
            )

        # Sort by date
        sorted_sessions = sorted(session_history, key=lambda x: x.date)

        # Get recent sessions (last 2 weeks)
        two_weeks_ago = datetime.now() - timedelta(days=14)
        recent = [s for s in sorted_sessions if s.date >= two_weeks_ago]

        if len(recent) < 5:
            return PlateauDetection(
                is_plateau=False,
                plateau_duration_days=0,
                current_avg_wpm=0,
                suggested_actions=["Practice more regularly to detect patterns"],
            )

        # Calculate weekly averages
        week_ago = datetime.now() - timedelta(days=7)
        this_week = [s.wpm for s in recent if s.date >= week_ago]
        last_week = [s.wpm for s in recent if s.date < week_ago]

        if not this_week or not last_week:
            current_avg = sum(s.wpm for s in recent) / len(recent)
            return PlateauDetection(
                is_plateau=False,
                plateau_duration_days=0,
                current_avg_wpm=current_avg,
                suggested_actions=[],
            )

        this_week_avg = sum(this_week) / len(this_week)
        last_week_avg = sum(last_week) / len(last_week)

        # Calculate percentage change
        if last_week_avg > 0:
            percent_change = abs(this_week_avg - last_week_avg) / last_week_avg * 100
        else:
            percent_change = 0

        is_plateau = percent_change < self.PLATEAU_THRESHOLD_PERCENT

        # Calculate plateau duration
        plateau_duration = 0
        if is_plateau:
            # Look back to find when plateau started
            for i in range(len(sorted_sessions) - 1, -1, -1):
                session = sorted_sessions[i]
                if abs(session.wpm - this_week_avg) / this_week_avg * 100 > self.PLATEAU_THRESHOLD_PERCENT:
                    break
                plateau_duration = (datetime.now() - session.date).days

        # Generate suggestions
        suggestions = []
        if is_plateau:
            suggestions = [
                "Try increasing difficulty level for new challenges",
                "Focus on accuracy over speed temporarily",
                "Practice specific weak areas identified in your profile",
                "Take short breaks between sessions to prevent fatigue",
                "Try different text types (code, quotes, random words)",
            ]

        return PlateauDetection(
            is_plateau=is_plateau,
            plateau_duration_days=plateau_duration,
            current_avg_wpm=this_week_avg,
            suggested_actions=suggestions,
        )

    def generate_daily_insights(
        self,
        session_history: List[SessionRecord],
        user_profile: Dict,
    ) -> List[DailyInsight]:
        """
        Generate personalized daily insights.

        Args:
            session_history: List of historical sessions
            user_profile: User's typing profile

        Returns:
            List of daily insights
        """
        insights = []

        if not session_history:
            return [DailyInsight(
                insight_type="getting_started",
                title="Welcome!",
                message="Complete your first typing session to start tracking your progress.",
                priority=1,
            )]

        sorted_sessions = sorted(session_history, key=lambda x: x.date, reverse=True)

        # Check if practiced today
        today = datetime.now().date()
        today_sessions = [s for s in sorted_sessions if s.date.date() == today]

        if not today_sessions:
            # Check streak
            yesterday = today - timedelta(days=1)
            had_session_yesterday = any(s.date.date() == yesterday for s in sorted_sessions)

            if had_session_yesterday:
                insights.append(DailyInsight(
                    insight_type="streak_reminder",
                    title="Keep Your Streak!",
                    message="You practiced yesterday. Keep the momentum going with a session today!",
                    priority=1,
                ))
        else:
            # Today's performance
            today_avg_wpm = sum(s.wpm for s in today_sessions) / len(today_sessions)
            today_avg_acc = sum(s.accuracy for s in today_sessions) / len(today_sessions)

            insights.append(DailyInsight(
                insight_type="today_summary",
                title="Today's Progress",
                message=f"You completed {len(today_sessions)} session(s) today with an average of {today_avg_wpm:.0f} WPM and {today_avg_acc:.1f}% accuracy.",
                data={"sessions": len(today_sessions), "avg_wpm": today_avg_wpm, "avg_accuracy": today_avg_acc},
                priority=2,
            ))

        # Check for personal best
        if len(session_history) >= 2:
            best_wpm = max(s.wpm for s in session_history)
            recent_best = max(s.wpm for s in sorted_sessions[:10]) if len(sorted_sessions) >= 10 else best_wpm

            if recent_best >= best_wpm * 0.98:  # Within 2% of personal best
                insights.append(DailyInsight(
                    insight_type="near_personal_best",
                    title="Close to Your Best!",
                    message=f"Your recent best ({recent_best:.0f} WPM) is very close to your all-time record ({best_wpm:.0f} WPM). Keep pushing!",
                    priority=2,
                ))

        # Improvement insight
        if len(sorted_sessions) >= 20:
            recent_10 = sorted_sessions[:10]
            older_10 = sorted_sessions[10:20]

            recent_avg = sum(s.wpm for s in recent_10) / len(recent_10)
            older_avg = sum(s.wpm for s in older_10) / len(older_10)

            improvement = recent_avg - older_avg
            if improvement > 5:
                insights.append(DailyInsight(
                    insight_type="improvement",
                    title="Great Progress!",
                    message=f"You've improved by {improvement:.0f} WPM compared to your previous sessions!",
                    data={"improvement": improvement},
                    priority=2,
                ))
            elif improvement < -5:
                insights.append(DailyInsight(
                    insight_type="slowdown",
                    title="Slight Slowdown",
                    message="Your recent sessions show a slight decrease. Focus on accuracy and the speed will follow.",
                    priority=3,
                ))

        # Weak area insight
        if user_profile.get('problematic_chars'):
            weak_chars = user_profile['problematic_chars'][:3]
            insights.append(DailyInsight(
                insight_type="weak_area",
                title="Focus Area",
                message=f"Practice these characters to improve: {', '.join(c['char'] for c in weak_chars)}",
                data={"weak_chars": weak_chars},
                priority=2,
            ))

        # Sort by priority
        return sorted(insights, key=lambda x: x.priority)

    def explain_performance(
        self,
        session_history: List[SessionRecord],
        recent_session: SessionRecord,
    ) -> List[PerformanceExplanation]:
        """
        Provide explanations for recent performance.

        Args:
            session_history: Historical sessions
            recent_session: Most recent session

        Returns:
            List of performance explanations
        """
        explanations = []

        if len(session_history) < 5:
            return explanations

        sorted_sessions = sorted(session_history, key=lambda x: x.date)
        avg_wpm = sum(s.wpm for s in sorted_sessions) / len(sorted_sessions)
        avg_accuracy = sum(s.accuracy for s in sorted_sessions) / len(sorted_sessions)

        # Compare to average
        wpm_diff = recent_session.wpm - avg_wpm
        acc_diff = recent_session.accuracy - avg_accuracy

        # Speed analysis
        if wpm_diff > 10:
            explanations.append(PerformanceExplanation(
                factor="speed",
                impact="positive",
                explanation=f"Your speed ({recent_session.wpm:.0f} WPM) was {wpm_diff:.0f} WPM above your average!",
                recommendation="Try to maintain this pace while keeping accuracy high.",
            ))
        elif wpm_diff < -10:
            explanations.append(PerformanceExplanation(
                factor="speed",
                impact="negative",
                explanation=f"Your speed ({recent_session.wpm:.0f} WPM) was {abs(wpm_diff):.0f} WPM below your average.",
                recommendation="This could be due to fatigue or difficult text. Try a warm-up session next time.",
            ))

        # Accuracy analysis
        if acc_diff > 2:
            explanations.append(PerformanceExplanation(
                factor="accuracy",
                impact="positive",
                explanation=f"Excellent accuracy ({recent_session.accuracy:.1f}%)! Above your average.",
            ))
        elif acc_diff < -5:
            explanations.append(PerformanceExplanation(
                factor="accuracy",
                impact="negative",
                explanation=f"Accuracy ({recent_session.accuracy:.1f}%) was lower than usual.",
                recommendation="Slow down slightly to improve accuracy. Speed follows accuracy.",
            ))

        # Time of day analysis
        hour = recent_session.date.hour
        same_hour_sessions = [s for s in sorted_sessions if s.date.hour == hour]

        if len(same_hour_sessions) >= 3:
            hour_avg = sum(s.wpm for s in same_hour_sessions) / len(same_hour_sessions)
            if hour_avg > avg_wpm * 1.1:
                explanations.append(PerformanceExplanation(
                    factor="time_of_day",
                    impact="positive",
                    explanation=f"You tend to perform better around {hour}:00!",
                    recommendation="Consider scheduling practice sessions at this time.",
                ))
            elif hour_avg < avg_wpm * 0.9:
                explanations.append(PerformanceExplanation(
                    factor="time_of_day",
                    impact="neutral",
                    explanation=f"Your performance around {hour}:00 is typically lower.",
                    recommendation="You might perform better at a different time of day.",
                ))

        # Difficulty analysis
        same_difficulty = [s for s in sorted_sessions if s.difficulty == recent_session.difficulty]
        if len(same_difficulty) >= 3:
            diff_avg = sum(s.wpm for s in same_difficulty) / len(same_difficulty)
            if recent_session.wpm > diff_avg * 1.1:
                explanations.append(PerformanceExplanation(
                    factor="difficulty",
                    impact="positive",
                    explanation=f"Great performance on {recent_session.difficulty} difficulty!",
                    recommendation="You might be ready for the next difficulty level.",
                ))

        # Duration analysis
        if recent_session.duration_seconds > 300:  # More than 5 minutes
            explanations.append(PerformanceExplanation(
                factor="duration",
                impact="neutral",
                explanation="Longer sessions can lead to fatigue affecting performance.",
                recommendation="Consider shorter, more frequent practice sessions.",
            ))

        return explanations


# Global instance
prediction_service = PredictionService()

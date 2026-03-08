"""
Monitoring and metrics service for system health and ML model monitoring.
"""
import threading
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any


@dataclass
class MetricPoint:
    """Single metric data point."""
    name: str
    value: float
    timestamp: datetime
    labels: dict[str, str] = field(default_factory=dict)


@dataclass
class SystemMetrics:
    """System-level metrics."""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    active_connections: int
    requests_per_minute: float
    avg_response_time_ms: float
    error_rate: float


@dataclass
class MLModelMetrics:
    """ML model performance metrics."""
    model_name: str
    timestamp: datetime
    predictions_count: int
    avg_prediction_time_ms: float
    accuracy: float
    precision: float
    recall: float
    drift_score: float  # 0-1, higher = more drift detected
    last_retrained: datetime | None


@dataclass
class MLDecisionTrace:
    """Trace of an ML decision for debugging."""
    trace_id: str
    timestamp: datetime
    model_name: str
    user_id: str
    input_data: dict[str, Any]
    output: Any
    confidence: float
    decision_path: list[str]
    execution_time_ms: float


class MetricsCollector:
    """
    Service for collecting and managing system and ML metrics.

    Features:
    - Collect system metrics
    - Track ML model health
    - Trace ML decisions
    - Alert on anomalies
    """

    def __init__(self, max_history: int = 1000):
        self._metrics: dict[str, deque] = {}
        self._max_history = max_history
        self._request_times: deque = deque(maxlen=1000)
        self._error_count = 0
        self._request_count = 0
        self._ml_traces: deque = deque(maxlen=500)
        self._ml_metrics: dict[str, MLModelMetrics] = {}
        self._lock = threading.Lock()

    def record_metric(
        self,
        name: str,
        value: float,
        labels: dict[str, str] | None = None,
    ) -> MetricPoint:
        """
        Record a metric value.

        Args:
            name: Metric name
            value: Metric value
            labels: Optional labels for the metric

        Returns:
            Created metric point
        """
        point = MetricPoint(
            name=name,
            value=value,
            timestamp=datetime.utcnow(),
            labels=labels or {},
        )

        with self._lock:
            if name not in self._metrics:
                self._metrics[name] = deque(maxlen=self._max_history)
            self._metrics[name].append(point)

        return point

    def get_metric_history(
        self,
        name: str,
        since: datetime | None = None,
    ) -> list[MetricPoint]:
        """
        Get historical values for a metric.

        Args:
            name: Metric name
            since: Only return values after this time

        Returns:
            List of metric points
        """
        with self._lock:
            points = list(self._metrics.get(name, []))

        if since:
            points = [p for p in points if p.timestamp >= since]

        return points

    def record_request(
        self,
        response_time_ms: float,
        is_error: bool = False,
    ) -> None:
        """
        Record a request for metrics.

        Args:
            response_time_ms: Response time in milliseconds
            is_error: Whether the request resulted in an error
        """
        with self._lock:
            self._request_times.append((datetime.utcnow(), response_time_ms))
            self._request_count += 1
            if is_error:
                self._error_count += 1

    def get_system_metrics(self) -> SystemMetrics:
        """
        Get current system metrics.

        Returns:
            Current system metrics
        """
        now = datetime.utcnow()
        one_minute_ago = now - timedelta(minutes=1)

        with self._lock:
            # Calculate requests per minute
            recent_requests = [
                (t, rt) for t, rt in self._request_times
                if t >= one_minute_ago
            ]
            requests_per_minute = len(recent_requests)

            # Calculate average response time
            if recent_requests:
                avg_response_time = sum(rt for _, rt in recent_requests) / len(recent_requests)
            else:
                avg_response_time = 0

            # Calculate error rate
            if self._request_count > 0:
                error_rate = self._error_count / self._request_count
            else:
                error_rate = 0

        return SystemMetrics(
            timestamp=now,
            cpu_percent=0,  # Would need psutil for real values
            memory_percent=0,
            active_connections=0,
            requests_per_minute=requests_per_minute,
            avg_response_time_ms=avg_response_time,
            error_rate=error_rate,
        )

    def trace_ml_decision(
        self,
        model_name: str,
        user_id: str,
        input_data: dict[str, Any],
        output: Any,
        confidence: float,
        decision_path: list[str],
        execution_time_ms: float,
    ) -> MLDecisionTrace:
        """
        Trace an ML decision for debugging.

        Args:
            model_name: Name of the model
            user_id: User the decision was for
            input_data: Input to the model
            output: Model output
            confidence: Confidence score
            decision_path: Steps in decision making
            execution_time_ms: Execution time

        Returns:
            Created trace
        """
        import uuid

        trace = MLDecisionTrace(
            trace_id=str(uuid.uuid4())[:8],
            timestamp=datetime.utcnow(),
            model_name=model_name,
            user_id=user_id,
            input_data=input_data,
            output=output,
            confidence=confidence,
            decision_path=decision_path,
            execution_time_ms=execution_time_ms,
        )

        with self._lock:
            self._ml_traces.append(trace)

        return trace

    def get_ml_traces(
        self,
        model_name: str | None = None,
        user_id: str | None = None,
        limit: int = 100,
    ) -> list[MLDecisionTrace]:
        """
        Get ML decision traces.

        Args:
            model_name: Filter by model name
            user_id: Filter by user ID
            limit: Maximum traces to return

        Returns:
            List of traces
        """
        with self._lock:
            traces = list(self._ml_traces)

        if model_name:
            traces = [t for t in traces if t.model_name == model_name]
        if user_id:
            traces = [t for t in traces if t.user_id == user_id]

        return traces[-limit:]

    def update_ml_model_metrics(
        self,
        model_name: str,
        predictions_count: int,
        avg_prediction_time_ms: float,
        accuracy: float,
        precision: float,
        recall: float,
        drift_score: float,
        last_retrained: datetime | None = None,
    ) -> MLModelMetrics:
        """
        Update metrics for an ML model.

        Args:
            model_name: Model name
            predictions_count: Number of predictions made
            avg_prediction_time_ms: Average prediction time
            accuracy: Model accuracy
            precision: Model precision
            recall: Model recall
            drift_score: Data drift score
            last_retrained: When model was last retrained

        Returns:
            Updated metrics
        """
        metrics = MLModelMetrics(
            model_name=model_name,
            timestamp=datetime.utcnow(),
            predictions_count=predictions_count,
            avg_prediction_time_ms=avg_prediction_time_ms,
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            drift_score=drift_score,
            last_retrained=last_retrained,
        )

        with self._lock:
            self._ml_metrics[model_name] = metrics

        # Record individual metrics
        self.record_metric(f"ml.{model_name}.accuracy", accuracy)
        self.record_metric(f"ml.{model_name}.drift_score", drift_score)
        self.record_metric(f"ml.{model_name}.prediction_time_ms", avg_prediction_time_ms)

        return metrics

    def get_ml_model_metrics(
        self,
        model_name: str,
    ) -> MLModelMetrics | None:
        """
        Get metrics for an ML model.

        Args:
            model_name: Model name

        Returns:
            Model metrics or None
        """
        with self._lock:
            return self._ml_metrics.get(model_name)

    def get_all_ml_model_metrics(self) -> dict[str, MLModelMetrics]:
        """
        Get metrics for all ML models.

        Returns:
            Dictionary of model name to metrics
        """
        with self._lock:
            return dict(self._ml_metrics)

    def check_ml_health(
        self,
        model_name: str,
    ) -> dict[str, Any]:
        """
        Check health of an ML model.

        Args:
            model_name: Model name

        Returns:
            Health check results
        """
        metrics = self.get_ml_model_metrics(model_name)

        if not metrics:
            return {
                "status": "unknown",
                "model_name": model_name,
                "message": "No metrics available",
            }

        issues = []

        # Check accuracy
        if metrics.accuracy < 0.8:
            issues.append(f"Low accuracy: {metrics.accuracy:.2%}")

        # Check drift
        if metrics.drift_score > 0.3:
            issues.append(f"Data drift detected: {metrics.drift_score:.2f}")

        # Check prediction time
        if metrics.avg_prediction_time_ms > 100:
            issues.append(f"Slow predictions: {metrics.avg_prediction_time_ms:.0f}ms")

        # Check if retrained recently
        if metrics.last_retrained:
            days_since_retrain = (datetime.utcnow() - metrics.last_retrained).days
            if days_since_retrain > 30:
                issues.append(f"Not retrained in {days_since_retrain} days")

        if issues:
            status = "degraded" if len(issues) <= 2 else "unhealthy"
        else:
            status = "healthy"

        return {
            "status": status,
            "model_name": model_name,
            "accuracy": metrics.accuracy,
            "drift_score": metrics.drift_score,
            "prediction_time_ms": metrics.avg_prediction_time_ms,
            "issues": issues,
            "last_updated": metrics.timestamp.isoformat(),
        }

    def get_dashboard_data(self) -> dict[str, Any]:
        """
        Get data for monitoring dashboard.

        Returns:
            Dashboard data
        """
        system = self.get_system_metrics()
        ml_models = self.get_all_ml_model_metrics()

        model_health = {
            name: self.check_ml_health(name)
            for name in ml_models.keys()
        }

        return {
            "system": {
                "requests_per_minute": system.requests_per_minute,
                "avg_response_time_ms": system.avg_response_time_ms,
                "error_rate": system.error_rate,
            },
            "ml_models": model_health,
            "timestamp": datetime.utcnow().isoformat(),
        }


# Global instance
metrics_collector = MetricsCollector()


# Convenience functions
def record_metric(name: str, value: float, labels: dict | None = None) -> MetricPoint:
    """Record a metric value."""
    return metrics_collector.record_metric(name, value, labels)


def record_request(response_time_ms: float, is_error: bool = False) -> None:
    """Record a request."""
    metrics_collector.record_request(response_time_ms, is_error)


def trace_ml_decision(
    model_name: str,
    user_id: str,
    input_data: dict,
    output: Any,
    confidence: float,
    decision_path: list[str],
    execution_time_ms: float,
) -> MLDecisionTrace:
    """Trace an ML decision."""
    return metrics_collector.trace_ml_decision(
        model_name, user_id, input_data, output, confidence, decision_path, execution_time_ms
    )

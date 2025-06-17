"""
Performance & Load Testing Suite v1.0

Comprehensive testing for 100k+ concurrent users with:
- Load testing (stress, spike, soak)
- Performance benchmarking
- Bottleneck identification
- Optimization validation
- Production readiness verification
"""

from typing import Dict, List, Optional, Any, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import time
import statistics
import logging

logger = logging.getLogger(__name__)


class LoadTestType(Enum):
    """Types of load tests"""
    BASELINE = "baseline"  # Normal load
    STRESS = "stress"  # Increase until failure
    SPIKE = "spike"  # Sudden increase
    SOAK = "soak"  # Sustained load over time
    RAMP = "ramp"  # Gradual increase


@dataclass
class TestScenario:
    """Load test scenario configuration"""
    
    name: str
    description: str
    test_type: LoadTestType
    
    # User simulation
    concurrent_users: int
    ramp_up_time_seconds: int  # Time to reach full concurrency
    test_duration_seconds: int
    ramp_down_time_seconds: int = 60
    
    # Request configuration
    request_rate: int = 100  # Requests per second
    think_time_ms: int = 500  # Time between requests per user
    timeout_seconds: int = 30
    
    # Success criteria
    response_time_p95_ms: float = 500
    response_time_p99_ms: float = 1000
    error_rate_max: float = 0.01  # 1%
    throughput_min: int = 1000  # requests/sec
    
    # Target metrics
    target_concurrent_users: int = 100000
    target_requests_per_second: int = 45000
    target_response_time_p50_ms: float = 150


@dataclass
class PerformanceMetrics:
    """Performance test results"""
    
    test_name: str
    timestamp: datetime
    duration_seconds: float
    
    # Request metrics
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    error_rate: float = 0.0
    
    # Response time metrics (milliseconds)
    response_time_min: float = float('inf')
    response_time_max: float = 0.0
    response_time_mean: float = 0.0
    response_time_median: float = 0.0
    response_time_p95: float = 0.0
    response_time_p99: float = 0.0
    
    # Throughput metrics
    requests_per_second: float = 0.0
    bytes_per_second: float = 0.0
    
    # Resource metrics
    cpu_usage_max: float = 0.0
    cpu_usage_mean: float = 0.0
    memory_usage_max: float = 0.0
    memory_usage_mean: float = 0.0
    
    # User experience
    concurrent_users: int = 0
    think_time_ms: int = 0
    
    # Analysis
    passed: bool = False
    bottlenecks: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    
    def calculate_metrics(self, response_times: List[float]) -> None:
        """Calculate performance metrics from response times"""
        if not response_times:
            return
        
        self.response_time_min = min(response_times)
        self.response_time_max = max(response_times)
        self.response_time_mean = statistics.mean(response_times)
        self.response_time_median = statistics.median(response_times)
        
        sorted_times = sorted(response_times)
        self.response_time_p95 = sorted_times[int(len(sorted_times) * 0.95)]
        self.response_time_p99 = sorted_times[int(len(sorted_times) * 0.99)]
    
    def validate_against_scenario(self, scenario: TestScenario) -> Tuple[bool, List[str]]:
        """Check if metrics meet scenario requirements"""
        failures = []
        
        if self.response_time_p95 > scenario.response_time_p95_ms:
            failures.append(f"P95 response time {self.response_time_p95:.0f}ms exceeds {scenario.response_time_p95_ms}ms")
        
        if self.response_time_p99 > scenario.response_time_p99_ms:
            failures.append(f"P99 response time {self.response_time_p99:.0f}ms exceeds {scenario.response_time_p99_ms}ms")
        
        if self.error_rate > scenario.error_rate_max:
            failures.append(f"Error rate {self.error_rate:.2%} exceeds {scenario.error_rate_max:.2%}")
        
        if self.requests_per_second < scenario.throughput_min:
            failures.append(f"Throughput {self.requests_per_second:.0f} req/s below {scenario.throughput_min}")
        
        return len(failures) == 0, failures


class LoadTestGenerator:
    """Generate simulated user load"""
    
    @staticmethod
    async def generate_load(
        scenario: TestScenario,
        request_function: Callable,
        progress_callback: Optional[Callable] = None
    ) -> PerformanceMetrics:
        """
        Generate load according to scenario
        
        Example:
            async def make_request():
                # Simulate API request
                return {"status": "success", "time": 100}
            
            metrics = await LoadTestGenerator.generate_load(
                scenario=test_scenario,
                request_function=make_request
            )
        """
        
        metrics = PerformanceMetrics(
            test_name=scenario.name,
            timestamp=datetime.now(),
            duration_seconds=scenario.test_duration_seconds,
            concurrent_users=scenario.concurrent_users,
            think_time_ms=scenario.think_time_ms,
        )
        
        response_times = []
        errors = 0
        
        start_time = time.time()
        
        # Ramp up phase
        ramp_up_rate = scenario.concurrent_users / scenario.ramp_up_time_seconds
        current_users = 0
        
        # Test execution phase
        test_end_time = start_time + scenario.test_duration_seconds
        request_count = 0
        
        while time.time() < test_end_time:
            # Ramp up users
            if current_users < scenario.concurrent_users:
                current_users = min(
                    scenario.concurrent_users,
                    current_users + (ramp_up_rate * 0.1)
                )
            
            # Generate requests
            tasks = []
            num_requests = int(current_users * (scenario.request_rate / 1000))
            
            for _ in range(num_requests):
                try:
                    # Add think time
                    await asyncio.sleep(scenario.think_time_ms / 1000 / num_requests)
                    
                    # Execute request with timeout
                    request_start = time.time()
                    result = await asyncio.wait_for(
                        request_function(),
                        timeout=scenario.timeout_seconds
                    )
                    response_time = (time.time() - request_start) * 1000
                    
                    response_times.append(response_time)
                    request_count += 1
                    
                except asyncio.TimeoutError:
                    errors += 1
                except Exception as e:
                    errors += 1
                    logger.error(f"Request failed: {e}")
            
            # Progress callback
            if progress_callback:
                progress_callback(
                    users=int(current_users),
                    requests=request_count,
                    errors=errors
                )
        
        # Finalize metrics
        metrics.total_requests = request_count + errors
        metrics.successful_requests = request_count
        metrics.failed_requests = errors
        metrics.error_rate = errors / metrics.total_requests if metrics.total_requests > 0 else 0
        metrics.requests_per_second = request_count / scenario.test_duration_seconds
        metrics.calculate_metrics(response_times)
        
        return metrics


class PerformanceBenchmark:
    """
    Benchmark key operations
    """
    
    BENCHMARK_OPERATIONS = {
        "database_query": {
            "description": "Simple database query",
            "target_ms": 50,
        },
        "user_lookup": {
            "description": "Lookup user by ID",
            "target_ms": 20,
        },
        "conversation_list": {
            "description": "List user conversations",
            "target_ms": 100,
        },
        "message_send": {
            "description": "Send chat message",
            "target_ms": 200,
        },
        "stream_response": {
            "description": "Stream AI response",
            "target_ms": 500,  # First chunk
        },
        "api_call": {
            "description": "Complete API call",
            "target_ms": 300,
        },
        "cache_hit": {
            "description": "Cache hit response",
            "target_ms": 10,
        },
        "cache_miss": {
            "description": "Cache miss (database fallback)",
            "target_ms": 100,
        },
    }
    
    @staticmethod
    async def run_benchmark(
        operation_name: str,
        operation_func: Callable,
        iterations: int = 1000
    ) -> Dict[str, Any]:
        """
        Run performance benchmark
        
        Example:
            async def test_operation():
                return await db.query_user(user_id=1)
            
            results = await PerformanceBenchmark.run_benchmark(
                "user_lookup",
                test_operation,
                iterations=1000
            )
        """
        
        times = []
        
        for _ in range(iterations):
            start = time.time()
            try:
                await operation_func() if asyncio.iscoroutinefunction(operation_func) else operation_func()
                elapsed = (time.time() - start) * 1000
                times.append(elapsed)
            except Exception as e:
                logger.error(f"Benchmark failed: {e}")
        
        if not times:
            return {}
        
        target = PerformanceBenchmark.BENCHMARK_OPERATIONS.get(
            operation_name, {}
        ).get("target_ms", 100)
        
        return {
            "operation": operation_name,
            "iterations": iterations,
            "min_ms": min(times),
            "max_ms": max(times),
            "mean_ms": statistics.mean(times),
            "median_ms": statistics.median(times),
            "p95_ms": sorted(times)[int(len(times) * 0.95)],
            "p99_ms": sorted(times)[int(len(times) * 0.99)],
            "target_ms": target,
            "passed": statistics.median(times) <= target,
        }


class BottleneckAnalyzer:
    """Identify performance bottlenecks"""
    
    @staticmethod
    def analyze_metrics(metrics: PerformanceMetrics) -> Dict[str, Any]:
        """
        Analyze metrics to identify bottlenecks
        
        Returns: Dictionary with identified bottlenecks and recommendations
        """
        
        bottlenecks = []
        recommendations = []
        
        # Response time issues
        if metrics.response_time_p99 > 1000:
            bottlenecks.append("High P99 response time (>1s)")
            recommendations.append("Check database query performance, add caching")
        
        if metrics.response_time_mean > 500:
            bottlenecks.append("High average response time (>500ms)")
            recommendations.append("Profile application, identify slow operations")
        
        # Error rate issues
        if metrics.error_rate > 0.01:
            bottlenecks.append(f"High error rate ({metrics.error_rate:.2%})")
            recommendations.append("Investigate error logs, improve error handling")
        
        # Throughput issues
        if metrics.requests_per_second < 10000:
            bottlenecks.append("Low throughput (<10k req/s)")
            recommendations.append("Increase connection pool, optimize query performance")
        
        # Resource usage
        if metrics.cpu_usage_max > 0.9:
            bottlenecks.append("High CPU usage (>90%)")
            recommendations.append("Add more servers, optimize CPU-intensive operations")
        
        if metrics.memory_usage_max > 0.85:
            bottlenecks.append("High memory usage (>85%)")
            recommendations.append("Implement caching, reduce memory allocations")
        
        return {
            "bottlenecks": bottlenecks,
            "recommendations": recommendations,
            "severity": "critical" if len(bottlenecks) > 2 else "warning" if bottlenecks else "none",
        }


class ProductionReadinessTest:
    """Verify production readiness"""
    
    @staticmethod
    def get_production_checklist() -> List[Dict[str, Any]]:
        """Production readiness checklist"""
        return [
            {
                "category": "Performance",
                "items": [
                    "P95 response time < 500ms",
                    "P99 response time < 1s",
                    "Error rate < 1%",
                    "Throughput > 10k req/s",
                    "Cache hit rate > 70%",
                ]
            },
            {
                "category": "Reliability",
                "items": [
                    "No single point of failure",
                    "Automatic failover working",
                    "Circuit breakers active",
                    "Retry logic implemented",
                    "Health checks passing",
                ]
            },
            {
                "category": "Security",
                "items": [
                    "HTTPS enforced",
                    "Security headers present",
                    "Rate limiting active",
                    "Input validation working",
                    "Secrets encrypted",
                ]
            },
            {
                "category": "Operations",
                "items": [
                    "Logging configured",
                    "Monitoring alerts set",
                    "Backup strategy tested",
                    "Disaster recovery plan",
                    "Runbooks documented",
                ]
            },
            {
                "category": "Scalability",
                "items": [
                    "Load tested to 100k users",
                    "Database indexed properly",
                    "Connection pooling optimized",
                    "Caching strategy implemented",
                    "Message queue ready",
                ]
            },
        ]


# Predefined test scenarios for common use cases
TEST_SCENARIOS = {
    "baseline": TestScenario(
        name="Baseline Load Test",
        description="Normal production load",
        test_type=LoadTestType.BASELINE,
        concurrent_users=10000,
        ramp_up_time_seconds=600,
        test_duration_seconds=1800,
        request_rate=45000,
        response_time_p95_ms=500,
        response_time_p99_ms=1000,
    ),
    
    "stress": TestScenario(
        name="Stress Test",
        description="Increase load until failure",
        test_type=LoadTestType.STRESS,
        concurrent_users=100000,
        ramp_up_time_seconds=300,
        test_duration_seconds=600,
        request_rate=200000,
        response_time_p95_ms=2000,
        response_time_p99_ms=5000,
    ),
    
    "spike": TestScenario(
        name="Spike Test",
        description="Sudden traffic spike",
        test_type=LoadTestType.SPIKE,
        concurrent_users=50000,
        ramp_up_time_seconds=60,
        test_duration_seconds=300,
        request_rate=100000,
        response_time_p95_ms=1000,
    ),
    
    "soak": TestScenario(
        name="Soak Test",
        description="Sustained load over time",
        test_type=LoadTestType.SOAK,
        concurrent_users=25000,
        ramp_up_time_seconds=600,
        test_duration_seconds=14400,  # 4 hours
        request_rate=50000,
    ),
}

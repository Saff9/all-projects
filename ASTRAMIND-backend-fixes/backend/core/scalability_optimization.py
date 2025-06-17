"""
Scalability Optimization Engine for 100k+ Users

Comprehensive optimization strategies for:
- Database query optimization
- Connection pooling management
- Intelligent caching layers
- Indexing strategies
- Memory management
- Request batching
- Async optimization
"""

from typing import Dict, List, Any, Optional, Tuple
from functools import lru_cache, wraps
from datetime import datetime, timedelta
import hashlib
import logging
from collections import OrderedDict
import asyncio
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from sqlalchemy.pool import QueuePool

logger = logging.getLogger(__name__)


class DatabaseOptimizer:
    """Optimizes database operations for massive scale"""
    
    # Query result caching
    CACHE_DURATION = {
        "users": 300,  # 5 minutes
        "models": 3600,  # 1 hour
        "conversations": 60,  # 1 minute
        "stats": 300,  # 5 minutes
    }
    
    @staticmethod
    def optimize_connection_pool(
        pool_size: int = 20,
        max_overflow: int = 40,
        pool_recycle: int = 3600,
        pool_pre_ping: bool = True
    ) -> Dict[str, Any]:
        """
        Optimize connection pool for 100k+ users
        
        Parameters:
        - pool_size: Base connections (20-30)
        - max_overflow: Extra connections (30-50)
        - pool_recycle: Recycle connections after time (seconds)
        - pool_pre_ping: Test connections before use
        
        Returns: Pool configuration
        """
        return {
            "pool_size": pool_size,
            "max_overflow": max_overflow,
            "pool_recycle": pool_recycle,
            "pool_pre_ping": pool_pre_ping,
            "echo_pool": False,
            "isolation_level": "READ_COMMITTED",
        }
    
    @staticmethod
    def get_recommended_indexes() -> List[Dict[str, Any]]:
        """
        Database indexes for optimal query performance
        
        Returns: List of recommended index configurations
        """
        return [
            # User table indexes
            {
                "table": "users",
                "columns": ["email"],
                "type": "UNIQUE",
                "reason": "Fast user lookup by email"
            },
            {
                "table": "users",
                "columns": ["api_key"],
                "type": "UNIQUE",
                "reason": "Fast API key validation"
            },
            {
                "table": "users",
                "columns": ["created_at"],
                "type": "BTREE",
                "reason": "Time-based queries"
            },
            
            # Conversation table indexes
            {
                "table": "conversations",
                "columns": ["user_id"],
                "type": "BTREE",
                "reason": "User conversation lookup"
            },
            {
                "table": "conversations",
                "columns": ["user_id", "created_at"],
                "type": "COMPOSITE",
                "reason": "Fast user conversation history"
            },
            {
                "table": "conversations",
                "columns": ["status"],
                "type": "BTREE",
                "reason": "Filter by status"
            },
            
            # Message table indexes
            {
                "table": "messages",
                "columns": ["conversation_id"],
                "type": "BTREE",
                "reason": "Fast message retrieval per conversation"
            },
            {
                "table": "messages",
                "columns": ["conversation_id", "created_at"],
                "type": "COMPOSITE",
                "reason": "Ordered message retrieval"
            },
            
            # Rate limit tracking
            {
                "table": "api_usage_logs",
                "columns": ["ip_address", "created_at"],
                "type": "COMPOSITE",
                "reason": "Rate limiting lookups"
            },
            {
                "table": "api_usage_logs",
                "columns": ["user_id", "endpoint"],
                "type": "COMPOSITE",
                "reason": "User-specific quota tracking"
            },
        ]
    
    @staticmethod
    def query_optimization_patterns() -> Dict[str, str]:
        """
        Common query optimization patterns for 100k+ users
        
        Returns: Dictionary of optimization strategies
        """
        return {
            "select_specific_columns": """
                # WRONG: SELECT * FROM users
                # RIGHT: SELECT id, email, name FROM users
                # Saves bandwidth, memory, network latency
            """,
            
            "use_indexes": """
                # Index frequently filtered columns
                # CREATE INDEX idx_user_email ON users(email)
                # Reduces full table scans by 1000x
            """,
            
            "batch_queries": """
                # WRONG: for user_id in user_ids:
                #     user = db.query(User).filter(User.id == user_id).first()
                # RIGHT: users = db.query(User).filter(User.id.in_(user_ids)).all()
                # Reduces database round trips from N to 1
            """,
            
            "lazy_loading": """
                # Use lazy loading for large relationships
                # relationship(lazy='select') for optional data
                # Prevents N+1 query problems
            """,
            
            "pagination": """
                # WRONG: SELECT * FROM messages LIMIT 1000000 OFFSET 5000000
                # RIGHT: Use keyset pagination with ID
                # SELECT * FROM messages WHERE id > last_id LIMIT 100
                # Eliminates offset overhead at scale
            """,
            
            "connection_pooling": """
                # Use connection pool with:
                # - pool_size=20 (base connections)
                # - max_overflow=40 (burst connections)
                # - pool_recycle=3600 (recycle old connections)
                # Reduces connection overhead by 90%
            """,
        }


class CachingOptimizer:
    """
    Multi-layer caching strategy for 100k+ users
    
    Layers:
    1. In-memory cache (hot data)
    2. Redis cache (distributed)
    3. HTTP cache headers (browser)
    """
    
    def __init__(self, ttl_seconds: int = 300):
        self.ttl_seconds = ttl_seconds
        self.cache: OrderedDict = OrderedDict()
        self.cache_metadata: Dict[str, Dict] = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired"""
        if key not in self.cache:
            return None
        
        metadata = self.cache_metadata.get(key, {})
        if datetime.now() > metadata.get("expires", datetime.now()):
            del self.cache[key]
            del self.cache_metadata[key]
            return None
        
        return self.cache[key]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Cache value with TTL"""
        ttl = ttl or self.ttl_seconds
        
        self.cache[key] = value
        self.cache_metadata[key] = {
            "expires": datetime.now() + timedelta(seconds=ttl),
            "size": len(str(value)),
            "hits": 0,
        }
    
    def invalidate(self, pattern: str) -> int:
        """Invalidate cache keys matching pattern"""
        keys_to_delete = [k for k in self.cache.keys() if pattern in k]
        for key in keys_to_delete:
            del self.cache[key]
            del self.cache_metadata[key]
        return len(keys_to_delete)
    
    @staticmethod
    def get_caching_strategy() -> Dict[str, str]:
        """Multi-layer caching strategy"""
        return {
            "layer_1_in_memory": """
                Cache frequently accessed data in-memory
                - User profiles (5 min TTL)
                - Model configurations (1 hour TTL)
                - Session data (15 min TTL)
                Uses @lru_cache decorator or custom cache
            """,
            
            "layer_2_redis": """
                Distributed cache for multi-instance setup
                - Shared across server instances
                - Persistent across restarts
                - Atomic operations for race conditions
                - TTL management per key
            """,
            
            "layer_3_http": """
                Browser and CDN caching
                - Cache-Control: max-age=300, public
                - ETag headers for validation
                - Last-Modified headers
                - Vary headers for content negotiation
            """,
            
            "cache_key_generation": """
                Consistent key generation strategy
                - Include version: "user:v1:123"
                - Include filter params: "users:active:v1:123"
                - Use hash for long strings
                - Example: f"user:{user_id}:{version}"
            """,
        }


class QueryBatcher:
    """Batch database queries to reduce round trips"""
    
    def __init__(self, batch_size: int = 100, wait_time_ms: float = 10):
        self.batch_size = batch_size
        self.wait_time_ms = wait_time_ms
        self.queue: List[Dict[str, Any]] = []
        self.flush_task: Optional[asyncio.Task] = None
    
    async def add_query(self, query_id: str, params: Dict) -> Any:
        """
        Add query to batch
        
        Automatically flushes when:
        - Batch reaches batch_size
        - wait_time_ms elapsed
        """
        self.queue.append({"id": query_id, "params": params})
        
        if len(self.queue) >= self.batch_size:
            return await self.flush()
        
        if not self.flush_task:
            self.flush_task = asyncio.create_task(
                self._auto_flush()
            )
        
        return None
    
    async def _auto_flush(self) -> None:
        """Auto-flush after wait_time_ms"""
        await asyncio.sleep(self.wait_time_ms / 1000)
        if self.queue:
            await self.flush()
    
    async def flush(self) -> List[Any]:
        """Execute batched queries"""
        if not self.queue:
            return []
        
        batch = self.queue.copy()
        self.queue.clear()
        self.flush_task = None
        
        # Execute batch query
        # In production: db.execute(batch_query)
        logger.info(f"Executing batch of {len(batch)} queries")
        return batch


class MemoryOptimizer:
    """Optimize memory usage at 100k+ scale"""
    
    @staticmethod
    def get_strategies() -> Dict[str, str]:
        """Memory optimization strategies"""
        return {
            "streaming_responses": """
                Stream large responses instead of loading in memory
                - Use generators for pagination
                - Stream file uploads/downloads
                - Chunked response handling
                Saves memory from O(n) to O(1)
            """,
            
            "delete_old_data": """
                Automatic cleanup of old data
                - Delete conversations older than 90 days
                - Archive logs to external storage
                - Compress old backups
                Keeps database size bounded
            """,
            
            "connection_reuse": """
                Reuse connections via pooling
                - Don't create new connections per request
                - Use connection pool (QueuePool)
                - Test connections before reuse
                Reduces overhead by 80%
            """,
            
            "lazy_loading": """
                Load related data only when needed
                - User.conversations: lazy='select'
                - Use selectinload() for eager load
                - Avoid loading unnecessary relationships
                Reduces memory per request by 50-70%
            """,
        }


class PerformanceMonitorOptimizer:
    """Optimize performance monitoring at scale"""
    
    @staticmethod
    def get_monitoring_strategy() -> Dict[str, Any]:
        """Monitoring strategy for 100k+ users"""
        return {
            "metrics_to_track": [
                "response_time_p50",  # Median
                "response_time_p95",  # 95th percentile
                "response_time_p99",  # 99th percentile
                "error_rate",
                "cache_hit_rate",
                "database_connection_count",
                "memory_usage",
                "cpu_usage",
            ],
            
            "sampling_strategy": {
                "production": "0.1% of requests",  # 1 in 1000
                "staging": "10% of requests",
                "development": "100% of requests",
            },
            
            "alert_thresholds": {
                "response_time_p99": 5000,  # 5 seconds
                "error_rate": 0.01,  # 1%
                "cache_hit_rate": 0.7,  # 70%
                "memory_usage": 0.85,  # 85%
                "cpu_usage": 0.80,  # 80%
            },
        }


# Configuration template for 100k+ users
SCALABILITY_CONFIG = {
    "database": {
        "pool_size": 20,
        "max_overflow": 40,
        "pool_recycle": 3600,
        "echo": False,
    },
    "cache": {
        "default_ttl": 300,
        "max_size": 10000,
        "eviction_policy": "lru",
    },
    "rate_limiting": {
        "window_seconds": 60,
        "max_requests": 100,
        "storage": "memory",  # Use Redis for distributed
    },
    "timeouts": {
        "request_timeout": 30,
        "database_timeout": 10,
        "external_api_timeout": 15,
    },
    "monitoring": {
        "sample_rate": 0.001,  # 0.1% in production
        "metrics_retention": 86400,  # 24 hours
        "log_level": "INFO",
    },
}


def benchmark_decorator(func):
    """Decorator to benchmark function execution"""
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        start = datetime.now()
        try:
            result = await func(*args, **kwargs)
            duration = (datetime.now() - start).total_seconds()
            if duration > 1:  # Log slow operations
                logger.warning(
                    f"{func.__name__} took {duration:.2f}s"
                )
            return result
        except Exception as e:
            duration = (datetime.now() - start).total_seconds()
            logger.error(
                f"{func.__name__} failed after {duration:.2f}s: {e}"
            )
            raise
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        start = datetime.now()
        try:
            result = func(*args, **kwargs)
            duration = (datetime.now() - start).total_seconds()
            if duration > 1:
                logger.warning(
                    f"{func.__name__} took {duration:.2f}s"
                )
            return result
        except Exception as e:
            duration = (datetime.now() - start).total_seconds()
            logger.error(
                f"{func.__name__} failed after {duration:.2f}s: {e}"
            )
            raise
    
    return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

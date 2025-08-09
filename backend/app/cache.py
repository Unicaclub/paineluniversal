import redis
import json
from typing import Optional, Any
from datetime import timedelta
import os

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=0,
    decode_responses=True
)

def get_cache_key(prefix: str, *args) -> str:
    """Generate cache key"""
    return f"{prefix}:{':'.join(map(str, args))}"

def get_cached_data(key: str) -> Optional[Any]:
    """Get data from cache"""
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except:
        return None

def set_cached_data(key: str, data: Any, ttl: int = 300) -> None:
    """Set data in cache with TTL (default 5 minutes)"""
    try:
        redis_client.setex(key, ttl, json.dumps(data, default=str))
    except:
        pass

def clear_cache_pattern(pattern: str) -> None:
    """Clear cache entries matching pattern"""
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
    except:
        pass

"""
通用重試邏輯
"""
import asyncio
from functools import wraps
from typing import Callable, TypeVar, Any
from loguru import logger

T = TypeVar("T")


def retry(
    max_attempts: int = 3,
    delay: int = 60,
    backoff: int = 1,
    exceptions: tuple = (Exception,),
):
    """
    重試裝飾器
    
    Args:
        max_attempts: 最大嘗試次數
        delay: 重試間隔（秒）
        backoff: 退避倍數
        exceptions: 要重試的例外類型
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> T:
            last_exception = None
            current_delay = delay
            
            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts:
                        logger.warning(
                            f"Attempt {attempt}/{max_attempts} failed: {e}. "
                            f"Retrying in {current_delay} seconds..."
                        )
                        await asyncio.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error(
                            f"All {max_attempts} attempts exhausted. "
                            f"Last exception: {e}"
                        )
            
            raise last_exception
        
        @wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> T:
            last_exception = None
            current_delay = delay
            
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts:
                        logger.warning(
                            f"Attempt {attempt}/{max_attempts} failed: {e}. "
                            f"Retrying in {current_delay} seconds..."
                        )
                        import time
                        time.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error(
                            f"All {max_attempts} attempts exhausted. "
                            f"Last exception: {e}"
                        )
            
            raise last_exception
        
        # 根據函式是否為 async 選擇對應的 wrapper
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


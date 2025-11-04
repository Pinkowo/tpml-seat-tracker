"""
資料庫連線池設定
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from loguru import logger

from src.config import settings


def create_db_engine() -> AsyncEngine:
    """
    建立資料庫 async engine

    設定項目：
    - Connection pool size: 5-20
    - Max overflow: 10
    - Pool timeout: 30 seconds
    - Pool recycle: 3600 seconds

    注意：async engine 會自動使用 AsyncAdaptedQueuePool，不需要指定 poolclass
    """
    # 測試環境：使用 SQLite in-memory
    if os.getenv("TESTING") == "1":
        from sqlalchemy.pool import StaticPool

        engine = create_async_engine(
            "sqlite+aiosqlite:///:memory:",
            poolclass=StaticPool,
            connect_args={"check_same_thread": False},
            echo=False,
        )
        logger.info("測試環境：使用 SQLite in-memory 資料庫")
    else:
        engine = create_async_engine(
            settings.database_url,
            pool_size=10,  # 基礎連線池大小
            max_overflow=10,  # 最大額外連線數
            pool_timeout=30,  # 取得連線的超時時間（秒）
            pool_recycle=3600,  # 連線回收時間（秒）
            pool_pre_ping=True,  # 連線前檢查連線是否有效
            echo=False,  # 在開發時可設為 True 查看 SQL
        )
        logger.info("資料庫 engine 已建立")
    return engine


# 全域 engine 實例
# 測試環境會自動使用 SQLite in-memory
engine = create_db_engine()

"""
Async session factory with context manager
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from src.db.connection import engine
from loguru import logger


# 建立 session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async session context manager
    
    使用方式:
        async with get_async_session() as session:
            result = await session.execute(select(Library))
            ...
            await session.commit()
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            logger.exception("資料庫交易發生錯誤，已執行 rollback")
            raise
        finally:
            await session.close()


"""
FastAPI dependency injection
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_async_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    資料庫 session dependency
    
    用法: db: AsyncSession = Depends(get_db)
    """
    async for session in get_async_session():
        yield session




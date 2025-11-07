"""
資料庫連線管理

支援兩種模式：
1. 本地開發：使用傳統 DATABASE_URL
2. 生產環境（Cloud Run）：使用 Unix socket 或 DATABASE_URL
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from src.config import settings

# 資料庫 Base 類別
Base = declarative_base()

# 全域變數
_engine = None


def get_engine():
    """取得 SQLAlchemy 引擎"""
    global _engine

    if _engine is None:
        # 直接使用 DATABASE_URL（支援 Unix socket 和 TCP 連線）
        _engine = create_async_engine(
            settings.database_url,
            echo=settings.log_level == "DEBUG",
            pool_pre_ping=True,
        )

    return _engine


def get_session_factory():
    """取得 Session factory（延遲初始化）"""
    return sessionmaker(
        bind=get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )


async def get_db():
    """
    FastAPI dependency: 取得資料庫 session

    Usage:
        @app.get("/items")
        async def read_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async_session = get_session_factory()
    async with async_session() as session:
        yield session


async def close_db_connections():
    """關閉資料庫連線（應用程式關閉時呼叫）"""
    global _engine

    if _engine is not None:
        await _engine.dispose()
        _engine = None

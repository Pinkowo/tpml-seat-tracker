"""
pytest 共用設定與 fixtures
"""
import os
import sys

# 設定測試環境變數（在導入任何會使用資料庫的模組之前）
# 必須在所有 import 之前設定
os.environ["TESTING"] = "1"

import pytest
from unittest.mock import patch
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

# 檢查必要的依賴
def pytest_configure(config):
    """在 pytest 配置時檢查依賴"""
    missing = []
    try:
        import fastapi
    except ImportError:
        missing.append("fastapi")
    
    try:
        import pytest_asyncio
    except ImportError:
        missing.append("pytest-asyncio")
    
    if missing:
        print("\n" + "="*60)
        print("❌ 缺少必要的依賴套件！")
        print("="*60)
        print(f"缺少的套件: {', '.join(missing)}")
        print("\n請執行以下指令安裝依賴：")
        print("  cd backend")
        print("  pip install -e \".[dev]\"")
        print("\n或使用：")
        print("  pip install fastapi pytest-asyncio pytest pytest-cov ruff aiosqlite")
        print("="*60 + "\n")
        sys.exit(1)

from src.models.base import Base


@pytest.fixture
async def test_db_engine():
    """
    建立測試用 PostgreSQL engine
    
    使用獨立的測試資料庫（test_tpml_seat_tracker）
    """
    # 使用 SQLite in-memory 資料庫進行測試（或使用獨立的 PostgreSQL 測試資料庫）
    test_db_url = "sqlite+aiosqlite:///:memory:"
    
    engine = create_async_engine(
        test_db_url,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
        echo=False,
    )
    
    # 建立所有資料表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # 清理
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def test_db_session(test_db_engine):
    """
    提供測試用 async session
    """
    async_session_factory = async_sessionmaker(
        test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with async_session_factory() as session:
        yield session
        await session.rollback()


@pytest.fixture(autouse=True, scope="session")
def setup_test_db():
    """
    在測試會話開始時設定測試環境
    
    注意：這個 fixture 主要是確保 TESTING 環境變數已設定
    實際的資料庫設定由 test_db_engine fixture 處理
    """
    # TESTING 環境變數已在檔案開頭設定
    # 這裡不需要額外的資料庫初始化，因為 test_db_engine fixture 會處理
    yield
    # 清理在 test_db_engine fixture 中處理


@pytest.fixture
async def clean_db(test_db_session):
    """
    每次測試前清空資料表
    """
    # 清空所有資料表（按順序避免外鍵約束）
    for table in reversed(Base.metadata.sorted_tables):
        await test_db_session.execute(table.delete())
    await test_db_session.commit()
    
    yield test_db_session
    
    # 測試後清理
    for table in reversed(Base.metadata.sorted_tables):
        await test_db_session.execute(table.delete())
    await test_db_session.commit()

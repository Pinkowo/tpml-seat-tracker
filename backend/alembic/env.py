"""Alembic 環境設定"""
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import AsyncEngine
from alembic import context
import os
import sys

# 將專案根目錄加入 path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Alembic Config 物件
config = context.config

# 從環境變數讀取 DATABASE_URL（如果有的話）
database_url = os.getenv("DATABASE_URL")
if database_url:
    # Alembic 是同步的，需要將 asyncpg URL 轉換為同步版本
    # postgresql+asyncpg:// -> postgresql+psycopg:// (使用 psycopg3，或 psycopg2)
    if "+asyncpg" in database_url:
        # 優先使用 psycopg3 (psycopg)，如果沒有則嘗試 psycopg2，最後回退到預設
        try:
            import psycopg  # psycopg3
            database_url = database_url.replace("+asyncpg", "+psycopg")
        except ImportError:
            try:
                import psycopg2  # psycopg2
                database_url = database_url.replace("+asyncpg", "+psycopg2")
            except ImportError:
                # 移除 asyncpg，讓 SQLAlchemy 使用預設 driver（會嘗試 psycopg2）
                database_url = database_url.replace("+asyncpg", "")
    config.set_main_option("sqlalchemy.url", database_url)

# 如果有 alembic.ini 中的 loggers 設定，使用它
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 目標 metadata（會在 models 中定義）
try:
    from src.models.base import Base
    target_metadata = Base.metadata
except ImportError:
    # 如果 models 還未建立，使用 None
    target_metadata = None

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()


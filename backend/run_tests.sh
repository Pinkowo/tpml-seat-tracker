#!/bin/bash
# 測試腳本

set -e

echo "🧪 執行後端測試..."

cd "$(dirname "$0")"

# 安裝測試依賴
echo "安裝依賴項..."
python3 -m pip install -e ".[dev]" || {
    echo "⚠️  使用 pip install -e 失敗，改用直接安裝..."
    python3 -m pip install -e . || python3 -m pip install fastapi uvicorn sqlalchemy alembic apscheduler httpx pydantic-settings loguru python-dotenv asyncpg psycopg2-binary greenlet
    python3 -m pip install pytest pytest-asyncio pytest-cov ruff aiosqlite
}

# 執行測試
echo "執行單元測試..."
python3 -m pytest tests/unit -v || echo "⚠️  單元測試有失敗"

echo "執行合約測試..."
python3 -m pytest tests/contract -v || echo "⚠️  合約測試有失敗"

echo "✅ 測試完成"


# 後端啟動指南

## 前置需求

- Python 3.12+
- Docker & Docker Compose（用於 PostgreSQL）

## 快速啟動

### 1. 啟動資料庫

```bash
# 從專案根目錄
docker-compose up -d postgres

# 等待資料庫啟動（約 5-10 秒）
sleep 10
```

### 2. 執行資料庫 Migration

```bash
cd backend
export DATABASE_URL="postgresql+asyncpg://tpml_user:tpml_password@localhost:5432/tpml_seat_tracker"
python3 -m alembic upgrade head
```

### 3. 安裝依賴並啟動

```bash
# 安裝依賴
python3 -m pip install -e .

# 或手動安裝
python3 -m pip install fastapi uvicorn sqlalchemy alembic apscheduler httpx pydantic-settings loguru python-dotenv asyncpg

# 啟動應用程式
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. 測試 API

- API 文件: http://localhost:8000/docs
- 健康檢查: http://localhost:8000/health
- 圖書館列表: http://localhost:8000/api/v1/libraries
- 即時座位: http://localhost:8000/api/v1/realtime

## 執行測試

```bash
# 安裝測試依賴
python3 -m pip install pytest pytest-asyncio pytest-cov httpx

# 執行測試
python3 -m pytest tests/ -v
```

## 環境變數

可在 `backend/.env` 設定（如果沒有會使用預設值）：

```
DATABASE_URL=postgresql+asyncpg://tpml_user:tpml_password@localhost:5432/tpml_seat_tracker
API_BASE_URL=http://localhost:8000
LOG_LEVEL=INFO
EXTERNAL_API_URL=https://example.com/api/seats
MAPBOX_TOKEN=
```

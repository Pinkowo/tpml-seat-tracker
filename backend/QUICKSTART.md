# 快速啟動指南

## 步驟 1: 啟動 PostgreSQL 資料庫

```bash
# 從專案根目錄執行
cd /Users/claireliang/Desktop/mytest/three-birds-on-mountain/tpml-seat-tracker
docker-compose up -d postgres
```

等待 10 秒讓資料庫完全啟動。

## 步驟 2: 執行資料庫 Migration

```bash
cd backend
export DATABASE_URL="postgresql+asyncpg://tpml_user:tpml_password@localhost:5432/tpml_seat_tracker"
python3 -m alembic upgrade head
```

## 步驟 3: 安裝依賴

```bash
# 使用 pip 安裝
python3 -m pip install fastapi uvicorn sqlalchemy alembic apscheduler httpx pydantic-settings loguru python-dotenv asyncpg

# 或使用 uv（如果已安裝）
uv pip install -e .
```

## 步驟 4: 啟動應用程式

```bash
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## 步驟 5: 測試 API

在瀏覽器開啟：
- **API 文件**: http://localhost:8000/docs
- **健康檢查**: http://localhost:8000/health
- **簡單健康檢查**: http://localhost:8000/health

或使用 curl：

```bash
# 健康檢查
curl http://localhost:8000/health

# 圖書館列表
curl http://localhost:8000/api/v1/libraries

# 即時座位資料
curl http://localhost:8000/api/v1/realtime
```

## 疑難排解

### 問題 1: 資料庫連線失敗

檢查 PostgreSQL 是否運行：
```bash
docker-compose ps
```

如果未運行，重新啟動：
```bash
docker-compose restart postgres
```

### 問題 2: Migration 失敗

檢查資料庫是否存在：
```bash
docker exec -it tpml-seat-tracker-db psql -U tpml_user -d tpml_seat_tracker -c "\dt"
```

### 問題 3: 依賴安裝失敗

使用 Python 3.12+：
```bash
python3 --version  # 應該顯示 Python 3.12 或更高
```

### 問題 4: 端口被佔用

如果 8000 端口被佔用，可以使用其他端口：
```bash
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```


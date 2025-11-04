# 專案啟動指南

本指南說明如何啟動圖書館座位追蹤系統專案，包含資料庫初始化、Alembic migration 和服務啟動。

## 📋 前置需求

- Docker 和 Docker Compose
- Git（用於 clone 專案）

---

## 🚀 快速啟動（推薦）

### 步驟 1: 啟動所有服務

```bash
# 從專案根目錄執行
cd tpml-seat-tracker/backend

# 啟動 PostgreSQL 和 Backend 服務
docker-compose up --build -d
```

### 步驟 2: 等待 PostgreSQL 就緒

```bash
# 檢查 PostgreSQL 健康狀態
docker-compose ps

# 應該看到 postgres 狀態為 "healthy"
```

### 步驟 3: 執行 Alembic Migration

```bash
# 進入 backend 容器執行 migration
docker-compose exec backend alembic upgrade head
```

### 步驟 4: 驗證啟動成功

```bash
# 檢查所有服務狀態
docker-compose ps

# 檢查後端日誌
docker-compose logs -f backend

# 測試 API（在另一個終端）
curl http://localhost:8000/health  # 簡單健康檢查
curl http://localhost:8000/api/v1/health  # 完整健康檢查
```

### 步驟 5: 填充測試資料（可選）

```bash
# 執行 seed script 填充測試資料
docker-compose exec backend python scripts/seed_data.py
```

---

## 📝 詳細步驟說明

### 1. 第一次啟動（完整流程）

```bash
# 1. 啟動服務
docker-compose up --build -d

# 2. 等待 PostgreSQL 完全啟動（約 10-20 秒）
sleep 15

# 3. 檢查 PostgreSQL 狀態
docker-compose ps postgres

# 4. 執行 migration
docker-compose exec backend alembic upgrade head

# 5. 檢查 migration 狀態
docker-compose exec backend alembic current

# 6. 填充測試資料
docker-compose exec backend python scripts/seed_data.py

# 7. 查看 API 文件
# 瀏覽器開啟: http://localhost:8000/docs
```

### 2. 日常開發啟動

```bash
# 啟動服務（如果已存在 volume，會使用現有資料）
docker-compose up -d

# 檢查服務狀態
docker-compose ps

# 如果需要重新執行 migration
docker-compose exec backend alembic upgrade head
```

### 3. 查看日誌

```bash
# 查看所有服務日誌
docker-compose logs -f

# 只看後端日誌
docker-compose logs -f backend

# 只看資料庫日誌
docker-compose logs -f postgres
```

### 4. 停止服務

```bash
# 停止所有服務（保留資料）
docker-compose stop

# 停止並刪除容器（保留 volume）
docker-compose down

# 停止並刪除所有（包含 volume，⚠️ 會刪除資料）
docker-compose down -v
```

---

## 🔍 常見問題排查

### 問題 1: Migration 失敗

```bash
# 檢查資料庫連線
docker-compose exec backend python -c "from src.config import settings; print(settings.database_url)"

# 手動測試資料庫連線
docker-compose exec backend python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test():
    engine = create_async_engine('postgresql+asyncpg://tpml_user:tpml_password@postgres:5432/tpml_seat_tracker')
    async with engine.connect() as conn:
        result = await conn.execute('SELECT 1')
        print('✅ 資料庫連線成功')
    await engine.dispose()

asyncio.run(test())
"

# 檢查 migration 歷史
docker-compose exec backend alembic history

# 檢查目前版本
docker-compose exec backend alembic current
```

### 問題 2: 後端無法啟動

```bash
# 檢查後端日誌
docker-compose logs backend

# 檢查後端容器狀態
docker-compose ps backend

# 重新啟動後端
docker-compose restart backend

# 如果還是有問題，重新建置
docker-compose up --build -d backend
```

### 問題 3: PostgreSQL 無法啟動

```bash
# 檢查 PostgreSQL 日誌
docker-compose logs postgres

# 檢查是否有 port 衝突
lsof -i :5432

# 刪除 volume 重新開始（⚠️ 會刪除所有資料）
docker-compose down -v
docker-compose up -d postgres
```

### 問題 4: Migration 已經執行過

```bash
# 檢查目前版本
docker-compose exec backend alembic current

# 如果需要重置（⚠️ 會刪除所有資料）
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose exec backend alembic upgrade head
```

---

## 🧪 測試 API

### 健康檢查

```bash
# 簡單健康檢查（相容性端點）
curl http://localhost:8000/health

# 完整健康檢查（包含資料庫和排程狀態）
curl http://localhost:8000/api/v1/health
```

### 取得圖書館列表

```bash
curl http://localhost:8000/api/v1/libraries
```

### 取得即時座位資料

```bash
curl http://localhost:8000/api/v1/realtime
```

### 取得預測結果

```bash
curl "http://localhost:8000/api/v1/predict?branch_name=總館"
```

### 查看 API 文件

瀏覽器開啟：http://localhost:8000/docs

---

## 📊 服務資訊

### 服務端口

- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **API 文件**: http://localhost:8000/docs
- **健康檢查（簡單）**: http://localhost:8000/health
- **健康檢查（完整）**: http://localhost:8000/api/v1/health

### 資料庫連線資訊

- **Host**: postgres (容器內) / localhost (主機)
- **Port**: 5432
- **Database**: tpml_seat_tracker
- **User**: tpml_user
- **Password**: tpml_password

### Volume 說明

- `postgres-data`: PostgreSQL 資料持久化
- `model-storage`: 機器學習模型儲存

---

## 🔄 Alembic Migration 指令

### 常用指令

```bash
# 執行所有待執行的 migration
docker-compose exec backend alembic upgrade head

# 降級一個版本
docker-compose exec backend alembic downgrade -1

# 降級到特定版本
docker-compose exec backend alembic downgrade <revision_id>

# 查看 migration 歷史
docker-compose exec backend alembic history

# 查看目前版本
docker-compose exec backend alembic current

# 查看待執行的 migration
docker-compose exec backend alembic upgrade head --sql
```

### Migration 版本列表

- `001`: create_library_info
- `002`: create_seat_realtime
- `003`: create_seat_history
- `004`: create_prediction_results
- `005`: create_model_registry
- `006`: add_indexes

---

## 🛠️ 開發模式

### 熱重載

後端已設定為開發模式，程式碼變更會自動重載：

```bash
# 查看重載日誌
docker-compose logs -f backend | grep "reload"
```

### 修改程式碼

1. 修改 `backend/src/` 下的程式碼
2. 後端會自動偵測並重載
3. 無需重啟容器

---

## 📦 資料填充

### 執行 Seed Script

```bash
# 填充測試資料
docker-compose exec backend python scripts/seed_data.py

# Seed script 會：
# 1. 從臺北市資料大平臺取得圖書館資料
# 2. 從座位 API 取得即時座位資料
# 3. 填充歷史資料（從 API）
# 4. 填充預測結果和模型註冊表
```

---

## ✅ 啟動檢查清單

- [ ] Docker 和 Docker Compose 已安裝
- [ ] 專案已 clone 到本地
- [ ] 執行 `docker-compose up --build -d`
- [ ] PostgreSQL 容器狀態為 `healthy`
- [ ] 執行 `docker-compose exec backend alembic upgrade head`
- [ ] Migration 執行成功
- [ ] 後端服務正常啟動
- [ ] 可以訪問 http://localhost:8000/docs
- [ ] 健康檢查 API 回傳成功

---

## 🎯 快速指令參考

```bash
# 一鍵啟動（包含 migration）
docker-compose up --build -d && sleep 15 && docker-compose exec backend alembic upgrade head

# 查看所有服務狀態
docker-compose ps

# 查看後端日誌
docker-compose logs -f backend

# 進入後端容器
docker-compose exec backend bash

# 進入資料庫容器
docker-compose exec postgres psql -U tpml_user -d tpml_seat_tracker

# 重置所有（⚠️ 會刪除所有資料）
docker-compose down -v && docker-compose up --build -d && sleep 15 && docker-compose exec backend alembic upgrade head
```

---

## 📚 相關文件

- API 文件: http://localhost:8000/docs
- 規格文件: `specs/001-library-seat-tracker/`
- 後端 README: `backend/README.md`

---

**最後更新**: 2025-01-16

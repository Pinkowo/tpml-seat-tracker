# Quickstart: 圖書館座位地圖與預測系統

**Phase**: 1 (Design)
**Date**: 2025-11-01
**Status**: Complete

## Overview

本文件提供開發環境快速設置指南，讓團隊成員能在 30 分鐘內完成本地環境建置並執行專案。

## Prerequisites

### Required Tools

| Tool | Version | Installation | Verification |
|------|---------|--------------|--------------|
| Python | 3.12+ | `brew install python@3.12` (macOS) | `python3 --version` |
| Node.js | 20+ | `brew install node@20` (macOS) | `node --version` |
| PostgreSQL | 15+ | `brew install postgresql@15` (macOS) | `psql --version` |
| Docker | 24+ | [Docker Desktop](https://www.docker.com/products/docker-desktop) | `docker --version` |
| Git | 2.40+ | `brew install git` (macOS) | `git --version` |

### Optional Tools

- **Redis** (optional for caching): `brew install redis`
- **pgAdmin** (GUI for PostgreSQL): [Download](https://www.pgadmin.org/)

---

## Quick Setup (Docker Compose)

### 1. Clone Repository

```bash
git clone https://github.com/your-org/tpml-seat-tracker.git
cd tpml-seat-tracker
```

### 2. Start Services with Docker Compose

```bash
docker-compose up -d
```

這會啟動：
- PostgreSQL (port 5432)
- Backend (port 8000)
- Frontend (port 5173)

### 3. Verify Services

```bash
# Backend health check
curl http://localhost:8000/api/v1/health

# Frontend
open http://localhost:5173
```

---

## Manual Setup (Without Docker)

### Step 1: Database Setup

#### 1.1 Start PostgreSQL

```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

#### 1.2 Create Database

```bash
psql postgres -c "CREATE DATABASE tpml_seat_tracker;"
psql postgres -c "CREATE USER tpml_user WITH PASSWORD 'dev_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE tpml_seat_tracker TO tpml_user;"
```

#### 1.3 Enable Extensions

```bash
psql tpml_seat_tracker -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql tpml_seat_tracker -c "CREATE EXTENSION IF NOT EXISTS \"earthdistance\" CASCADE;"
```

---

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows
```

#### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

```bash
cp .env.example .env
```

編輯 `.env`:

```env
# Database
DATABASE_URL=postgresql://tpml_user:dev_password@localhost:5432/tpml_seat_tracker

# External API (需向圖書館 IT 取得)
LIBRARY_API_BASE_URL=https://api.tpml.gov.tw
LIBRARY_API_KEY=your_api_key_here

# Scheduler
ENABLE_SCHEDULER=true

# Logging
LOG_LEVEL=INFO
```

#### 2.4 Run Database Migrations

```bash
alembic upgrade head
```

#### 2.5 (Optional) Seed Test Data

```bash
python scripts/seed_libraries.py
```

#### 2.6 Start Backend Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend 將在 `http://localhost:8000` 運行。

#### 2.7 Verify Backend

```bash
# Health check
curl http://localhost:8000/api/v1/health

# API docs
open http://localhost:8000/docs
```

---

### Step 3: Frontend Setup

#### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

#### 3.2 Configure Environment Variables

```bash
cp .env.example .env
```

編輯 `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

**取得 Mapbox Token**:
1. 註冊 [Mapbox 帳號](https://account.mapbox.com/auth/signup/)
2. 建立 Access Token（[Token 管理](https://account.mapbox.com/access-tokens/)）
3. 複製 token 至 `.env`

#### 3.3 Start Frontend Development Server

```bash
npm run dev
```

Frontend 將在 `http://localhost:5173` 運行。

#### 3.4 Verify Frontend

打開瀏覽器訪問 `http://localhost:5173`，應看到地圖載入。

---

## Running Scheduled Tasks (Development)

### Task A: 座位資料擷取（每 10 分鐘）

```bash
# 手動觸發
python scripts/run_seat_collector.py
```

### Task B: 模型訓練（每日 03:00）

```bash
# 手動觸發
python scripts/run_model_training.py
```

### Task C: 分館資料同步（每日 02:00）

```bash
# 手動觸發
python scripts/run_library_sync.py
```

### 啟用自動排程（APScheduler）

Backend 啟動時會自動啟用排程（若 `ENABLE_SCHEDULER=true`）。

查看排程狀態：

```bash
curl http://localhost:8000/api/v1/scheduler/status
```

---

## Common Development Tasks

### Run Tests

#### Backend Tests

```bash
cd backend
pytest                          # 執行所有測試
pytest tests/unit               # 僅 unit tests
pytest tests/integration        # 僅 integration tests
pytest tests/contract           # 僅 contract tests
pytest --cov=src --cov-report=html  # 產生測試覆蓋率報告
```

#### Frontend Tests

```bash
cd frontend
npm run test                    # 執行所有測試
npm run test:watch              # watch mode
npm run test:coverage           # 產生覆蓋率報告
```

### Database Migrations

#### 建立新 Migration

```bash
cd backend
alembic revision --autogenerate -m "Add new_table"
```

#### 執行 Migration

```bash
alembic upgrade head
```

#### 回退 Migration

```bash
alembic downgrade -1
```

### View API Documentation

Backend 使用 FastAPI 自動產生 API 文件：

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Code Formatting & Linting

#### Backend

```bash
cd backend
black src/                      # 格式化程式碼
ruff src/                       # Linting
mypy src/                       # 型別檢查
```

#### Frontend

```bash
cd frontend
npm run lint                    # ESLint
npm run format                  # Prettier
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Error**: `FATAL: password authentication failed for user "tpml_user"`

**Solution**:
1. 檢查 `.env` 中的 `DATABASE_URL`
2. 確認 PostgreSQL 服務已啟動：`brew services list`
3. 重建使用者：
   ```bash
   psql postgres -c "DROP USER IF EXISTS tpml_user;"
   psql postgres -c "CREATE USER tpml_user WITH PASSWORD 'dev_password';"
   ```

### Issue: Alembic Migration Failed

**Error**: `Target database is not up to date`

**Solution**:
```bash
alembic downgrade base
alembic upgrade head
```

### Issue: Frontend Cannot Connect to Backend

**Error**: `Network Error` in browser console

**Solution**:
1. 確認 backend 正在運行：`curl http://localhost:8000/api/v1/health`
2. 檢查 `.env` 中的 `VITE_API_BASE_URL`
3. 檢查 CORS 設定（backend 應允許 `http://localhost:5173`）

### Issue: Mapbox Map Not Loading

**Error**: `Error: Invalid access token`

**Solution**:
1. 確認 `VITE_MAPBOX_ACCESS_TOKEN` 已設定
2. 檢查 token 是否有效：[Mapbox Token 管理](https://account.mapbox.com/access-tokens/)
3. 確認 token 權限包含 `styles:read` 與 `tiles:read`

### Issue: Scheduled Tasks Not Running

**Solution**:
1. 檢查 `.env` 中 `ENABLE_SCHEDULER=true`
2. 查看 backend logs：`docker-compose logs backend -f`
3. 手動觸發測試：`python scripts/run_seat_collector.py`

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/add-prediction-ui
```

### 2. Make Changes

編輯程式碼，並定期提交：

```bash
git add .
git commit -m "feat(prediction): add prediction display in library detail"
```

### 3. Run Tests

```bash
cd backend && pytest
cd frontend && npm run test
```

### 4. Push and Create PR

```bash
git push origin feature/add-prediction-ui
```

在 GitHub 建立 Pull Request。

---

## Production Deployment

### Docker Build

#### Backend

```bash
cd backend
docker build -t gcr.io/your-project/tpml-backend:latest .
docker push gcr.io/your-project/tpml-backend:latest
```

#### Frontend

```bash
cd frontend
docker build -t gcr.io/your-project/tpml-frontend:latest .
docker push gcr.io/your-project/tpml-frontend:latest
```

### Deploy to GCP Cloud Run

```bash
# Backend
gcloud run deploy tpml-backend \
  --image gcr.io/your-project/tpml-backend:latest \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated

# Frontend
gcloud run deploy tpml-frontend \
  --image gcr.io/your-project/tpml-frontend:latest \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated
```

---

## Useful Resources

### Documentation

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/en/20/)
- [React Docs](https://react.dev/)
- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/15/)

### Internal Docs

- [spec.md](./spec.md) - 功能規格
- [data-model.md](./data-model.md) - 資料模型
- [contracts/](./contracts/) - API 合約
- [research.md](./research.md) - 技術選型

### Team Communication

- **Slack**: `#tpml-seat-tracker`
- **Issue Tracker**: GitHub Issues
- **API Key Management**: 聯絡 DevOps team

---

## Next Steps

1. 完成本地環境設置
2. 閱讀 [spec.md](./spec.md) 理解功能需求
3. 閱讀 [data-model.md](./data-model.md) 理解資料結構
4. 執行 `/speckit.tasks` 產生實作任務清單
5. 選擇一個 User Story 開始實作

---

## Support

如遇到問題，請：
1. 查看 [Troubleshooting](#troubleshooting) 章節
2. 搜尋 GitHub Issues
3. 在 Slack `#tpml-seat-tracker` 提問
4. 聯絡 Tech Lead: @your-tech-lead

# Cloud Run 部署快速指南

**功能**: TPML Seat Tracker 前後端應用部署至 Google Cloud Run
**預估時間**: 30-45 分鐘（首次部署）
**難度**: 中等

本指南將引導你完成從零開始部署到取得公開 URL 的完整流程。

---

## 📋 前置需求

### 1. 軟體工具
- [x] Google Cloud CLI (`gcloud`) 已安裝並認證
- [x] Docker Desktop 已安裝（用於本地測試，可選）
- [x] Git（已有專案程式碼）

### 2. Google Cloud 專案設定
- [x] 已建立 GCP 專案（例如 `three-birds-on-mountain`）
- [x] 已啟用計費（Cloud SQL 與 Cloud Run 需要）
- [x] 已啟用必要 API：
  ```bash
  gcloud services enable run.googleapis.com \
    sql-component.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com
  ```

### 3. 權限檢查
確認你的 GCP 帳號具備以下角色：
- `roles/run.admin` - Cloud Run 管理員
- `roles/cloudsql.admin` - Cloud SQL 管理員
- `roles/secretmanager.admin` - Secret Manager 管理員
- `roles/iam.serviceAccountUser` - Service Account 使用者

---

## 🚀 部署流程概覽

```
步驟 1: 建立 Cloud SQL 資料庫 (10 分鐘)
    ↓
步驟 2: 設定 Secret Manager (5 分鐘)
    ↓
步驟 3: 調整後端程式碼 (10 分鐘)
    ↓
步驟 4: 部署後端 Cloud Run (10 分鐘)
    ↓
步驟 5: 調整前端程式碼 (5 分鐘)
    ↓
步驟 6: 部署前端 Cloud Run (10 分鐘)
    ↓
步驟 7: 驗證與測試 (5 分鐘)
```

---

## 步驟 1: 建立 Cloud SQL 資料庫

### 1.1 設定環境變數

```bash
export PROJECT_ID="three-birds-on-mountain"  # 替換成你的專案 ID
export REGION="asia-east1"
export INSTANCE_NAME="tpml-seat-tracker-db"
export DB_NAME="tpml_seat_tracker"
export DB_USER="tpml_user"

gcloud config set project $PROJECT_ID
```

### 1.2 建立 Cloud SQL 實例

```bash
gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --availability-type=ZONAL \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --storage-auto-increase-limit=50 \
  --backup-start-time=03:00 \
  --retained-backups-count=7 \
  --maintenance-window-day=SUNDAY \
  --maintenance-window-hour=2 \
  --database-flags=max_connections=100,shared_buffers=32MB
```

⏱️ **預計等待時間**: 5-10 分鐘

驗證實例已建立：
```bash
gcloud sql instances describe $INSTANCE_NAME
```

### 1.3 建立資料庫

```bash
gcloud sql databases create $DB_NAME \
  --instance=$INSTANCE_NAME \
  --charset=UTF8 \
  --collation=en_US.UTF8
```

### 1.4 產生強密碼並儲存

```bash
# 產生隨機強密碼
DB_PASSWORD=$(openssl rand -base64 24)
echo "資料庫密碼（請妥善保存）: $DB_PASSWORD"
```

### 1.5 建立資料庫使用者

```bash
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password="$DB_PASSWORD"
```

### 1.6 取得連線名稱

```bash
export CONNECTION_NAME="$PROJECT_ID:$REGION:$INSTANCE_NAME"
echo "Cloud SQL 連線名稱: $CONNECTION_NAME"
```

---

## 步驟 2: 設定 Secret Manager

### 2.1 建立資料庫密碼 secret

```bash
echo -n "$DB_PASSWORD" | gcloud secrets create database-password \
  --replication-policy="automatic" \
  --data-file=-
```

### 2.2 建立 Mapbox token secret

```bash
# 替換成你的 Mapbox Public Token
export MAPBOX_TOKEN="pk.eyJ1..."

echo -n "$MAPBOX_TOKEN" | gcloud secrets create mapbox-token \
  --replication-policy="automatic" \
  --data-file=-
```

### 2.3 授予 Cloud Run Service Account 存取權限

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding database-password \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding mapbox-token \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 步驟 3: 調整後端程式碼

### 3.1 新增 Cloud SQL Connector 依賴

編輯 `backend/pyproject.toml`，在 dependencies 中新增：

```toml
[project]
dependencies = [
    # ... 現有依賴 ...
    "google-cloud-sql-connector[asyncpg]>=1.13.0",
]
```

### 3.2 調整 `backend/src/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Cloud SQL 連線參數
    cloud_sql_connection_name: str
    db_user: str
    db_password: str | None = None
    db_name: str
    enable_iam_auth: bool = False

    # API 設定
    api_base_url: str
    log_level: str = "INFO"

    # 外部 API
    external_api_url: str = "https://example.com/api/seats"

    # CORS
    cors_origins: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
    )

settings = Settings()
```

### 3.3 建立 `backend/src/database.py`（新檔案）

```python
from google.cloud.sql.connector import Connector
import sqlalchemy
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.config import settings

# 初始化 Cloud SQL Connector
connector = Connector(refresh_strategy="lazy")

def getconn():
    """建立 Cloud SQL 連線"""
    return connector.connect(
        settings.cloud_sql_connection_name,
        "asyncpg",
        user=settings.db_user,
        password=settings.db_password,
        db=settings.db_name,
        enable_iam_auth=settings.enable_iam_auth,
    )

# 建立 SQLAlchemy 引擎
engine = create_async_engine(
    "postgresql+asyncpg://",
    creator=getconn,
    echo=settings.log_level == "DEBUG",
)

# 建立 Session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db():
    """FastAPI dependency"""
    async with AsyncSessionLocal() as session:
        yield session
```

### 3.4 調整 `backend/src/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.database import engine, connector

app = FastAPI(
    title="圖書館座位追蹤系統 API",
    version="0.1.0",
)

# CORS 設定
origins = settings.cors_origins.split(",") if settings.cors_origins != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    """測試資料庫連線"""
    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sqlalchemy.text("SELECT 1")))
    print("✅ Cloud SQL 連線成功")

@app.on_event("shutdown")
async def shutdown():
    """清理連線"""
    await engine.dispose()
    connector.close()

# ... 其他路由 ...
```

### 3.5 調整 `backend/Dockerfile` 生產環境配置

確認 Dockerfile 最後的 CMD：

```dockerfile
# 生產環境：使用 2 workers
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

---

## 步驟 4: 部署後端 Cloud Run

### 4.1 建置並推送後端映像檔

```bash
cd backend

# 建置映像檔
gcloud builds submit \
  --tag asia-east1-docker.pkg.dev/$PROJECT_ID/containers/backend:latest .

cd ..
```

⏱️ **預計等待時間**: 3-5 分鐘

### 4.2 部署後端服務

```bash
gcloud run deploy tpml-backend \
  --region=$REGION \
  --image=asia-east1-docker.pkg.dev/$PROJECT_ID/containers/backend:latest \
  --set-env-vars="CLOUD_SQL_CONNECTION_NAME=$CONNECTION_NAME" \
  --set-env-vars="DB_USER=$DB_USER" \
  --set-secrets="DB_PASSWORD=database-password:latest" \
  --set-env-vars="DB_NAME=$DB_NAME" \
  --set-env-vars="API_BASE_URL=https://tpml-backend-xxx.run.app" \
  --set-env-vars="LOG_LEVEL=INFO" \
  --set-env-vars="CORS_ORIGINS=*" \
  --cpu=1 \
  --memory=1Gi \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --timeout=300 \
  --port=8000 \
  --allow-unauthenticated
```

⏱️ **預計等待時間**: 2-3 分鐘

### 4.3 取得後端 URL

```bash
BACKEND_URL=$(gcloud run services describe tpml-backend \
  --region=$REGION \
  --format="value(status.url)")

echo "後端 URL: $BACKEND_URL"
```

### 4.4 更新後端 API_BASE_URL 環境變數

```bash
gcloud run services update tpml-backend \
  --region=$REGION \
  --update-env-vars="API_BASE_URL=$BACKEND_URL"
```

### 4.5 驗證後端部署

```bash
# 測試健康檢查
curl -s "$BACKEND_URL/api/health" | jq

# 預期輸出：
# {
#   "status": "healthy",
#   "database": "connected"
# }
```

---

## 步驟 5: 調整前端程式碼

### 5.1 調整 `frontend/Dockerfile`

在 builder stage 開頭加入 ARG：

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# 建置時參數
ARG VITE_API_BASE_URL
ARG VITE_MAPBOX_TOKEN

# 轉為環境變數供 Vite 使用
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage 保持不變
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist ./
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 5.2 驗證 `frontend/docker/nginx.conf`

確認包含 SPA 路由支援：

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由支援
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 靜態資源快取
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全 Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip 壓縮
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

---

## 步驟 6: 部署前端 Cloud Run

### 6.1 建置前端映像檔（注入環境變數）

```bash
cd frontend

# 取得 Mapbox Token（從 Secret Manager）
MAPBOX_TOKEN=$(gcloud secrets versions access latest --secret=mapbox-token)

# 建置映像檔並注入 build args
gcloud builds submit \
  --config - <<EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'VITE_API_BASE_URL=$BACKEND_URL'
      - '--build-arg'
      - 'VITE_MAPBOX_TOKEN=$MAPBOX_TOKEN'
      - '-t'
      - 'asia-east1-docker.pkg.dev/$PROJECT_ID/containers/frontend:latest'
      - '.'
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'asia-east1-docker.pkg.dev/$PROJECT_ID/containers/frontend:latest']
EOF

cd ..
```

⏱️ **預計等待時間**: 3-5 分鐘

### 6.2 部署前端服務

```bash
gcloud run deploy tpml-frontend \
  --region=$REGION \
  --image=asia-east1-docker.pkg.dev/$PROJECT_ID/containers/frontend:latest \
  --cpu=0.5 \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=5 \
  --concurrency=80 \
  --timeout=60 \
  --port=80 \
  --allow-unauthenticated
```

⏱️ **預計等待時間**: 2-3 分鐘

### 6.3 取得前端 URL

```bash
FRONTEND_URL=$(gcloud run services describe tpml-frontend \
  --region=$REGION \
  --format="value(status.url)")

echo "前端 URL: $FRONTEND_URL"
```

### 6.4 更新後端 CORS 設定

```bash
gcloud run services update tpml-backend \
  --region=$REGION \
  --update-env-vars="CORS_ORIGINS=$FRONTEND_URL"
```

---

## 步驟 7: 驗證與測試

### 7.1 驗證後端 API

```bash
# 健康檢查
curl -s "$BACKEND_URL/api/health" | jq

# 測試圖書館列表 API
curl -s "$BACKEND_URL/api/libraries" | jq
```

### 7.2 驗證前端應用

在瀏覽器開啟前端 URL：
```bash
echo "請開啟: $FRONTEND_URL"
```

檢查項目：
- [ ] 頁面正常載入（無白屏或錯誤）
- [ ] 地圖正確顯示（Mapbox Token 有效）
- [ ] 座位列表顯示（API 連線正常）
- [ ] 瀏覽器 Console 無 CORS 錯誤

### 7.3 測試 SPA 路由

```bash
# 直接造訪子路由應返回 200（非 404）
curl -I "$FRONTEND_URL/library/123"
```

### 7.4 查看部署摘要

```bash
echo "=========================================="
echo "🎉 部署完成！"
echo "=========================================="
echo "前端 URL: $FRONTEND_URL"
echo "後端 URL: $BACKEND_URL"
echo "Cloud SQL 連線名稱: $CONNECTION_NAME"
echo "=========================================="
echo "月預估成本: $23-38 USD"
echo "=========================================="
```

---

## 🔄 後續更新流程

### 更新後端

```bash
cd backend
gcloud builds submit --tag asia-east1-docker.pkg.dev/$PROJECT_ID/containers/backend:latest .
gcloud run deploy tpml-backend --region=$REGION --image=asia-east1-docker.pkg.dev/$PROJECT_ID/containers/backend:latest
```

### 更新前端

```bash
cd frontend
MAPBOX_TOKEN=$(gcloud secrets versions access latest --secret=mapbox-token)
BACKEND_URL=$(gcloud run services describe tpml-backend --region=$REGION --format="value(status.url)")

gcloud builds submit --config - <<EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'VITE_API_BASE_URL=$BACKEND_URL'
      - '--build-arg'
      - 'VITE_MAPBOX_TOKEN=$MAPBOX_TOKEN'
      - '-t'
      - 'asia-east1-docker.pkg.dev/$PROJECT_ID/containers/frontend:latest'
      - '.'
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'asia-east1-docker.pkg.dev/$PROJECT_ID/containers/frontend:latest']
EOF

gcloud run deploy tpml-frontend --region=$REGION --image=asia-east1-docker.pkg.dev/$PROJECT_ID/containers/frontend:latest
```

---

## ⚠️ 常見問題排解

### 問題 1: 後端無法連線資料庫

**錯誤訊息**: `Error connecting to Cloud SQL`

**解決方案**：
1. 檢查環境變數是否正確：
   ```bash
   gcloud run services describe tpml-backend --region=$REGION --format=yaml | grep -A 20 "env:"
   ```
2. 驗證 Secret Manager 權限：
   ```bash
   gcloud secrets get-iam-policy database-password
   ```
3. 查看 Cloud Run 日誌：
   ```bash
   gcloud run services logs read tpml-backend --region=$REGION --limit=50
   ```

### 問題 2: 前端地圖無法顯示

**可能原因**: Mapbox Token 無效或有 referer 限制

**解決方案**：
1. 檢查 Token 是否為 Public Token（以 `pk.` 開頭）
2. 在 Mapbox 網站設定 URL 限制為 `*.run.app`
3. 檢查瀏覽器 Console 錯誤訊息

### 問題 3: 前端無法呼叫後端 API（CORS 錯誤）

**錯誤訊息**: `Access to fetch at '...' has been blocked by CORS policy`

**解決方案**：
1. 確認後端 CORS_ORIGINS 包含前端 URL：
   ```bash
   gcloud run services describe tpml-backend --region=$REGION --format=yaml | grep CORS_ORIGINS
   ```
2. 更新 CORS 設定：
   ```bash
   gcloud run services update tpml-backend --region=$REGION --update-env-vars="CORS_ORIGINS=$FRONTEND_URL"
   ```

### 問題 4: 部署超時或失敗

**解決方案**：
1. 檢查 Docker 映像檔大小（過大會導致部署慢）
2. 增加部署逾時時間：`--timeout=600`
3. 查看 Cloud Build 日誌：
   ```bash
   gcloud builds list --limit=5
   gcloud builds log <BUILD_ID>
   ```

---

## 📊 成本監控

### 查看目前月費用

```bash
# 需安裝 Cloud Billing API
gcloud billing accounts list
gcloud billing projects describe $PROJECT_ID --format="value(billingAccountName)"
```

### 設定預算告警

```bash
# 在 GCP Console 設定預算告警
echo "前往: https://console.cloud.google.com/billing/budgets?project=$PROJECT_ID"
```

**建議設定**：
- 預算: $50/月
- 告警閾值: 50%, 90%, 100%

---

## 📚 相關文件

- [research.md](./research.md) - 技術決策與替代方案評估
- [data-model.md](./data-model.md) - 環境變數與配置模型
- [contracts/](./contracts/) - 部署介面規格
- [Google Cloud Run 文件](https://cloud.google.com/run/docs)
- [Cloud SQL Python Connector](https://github.com/GoogleCloudPlatform/cloud-sql-python-connector)

---

**最後更新**: 2025-11-07
**版本**: 1.0

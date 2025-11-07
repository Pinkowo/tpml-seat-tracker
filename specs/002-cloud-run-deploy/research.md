# 技術研究與決策記錄

**功能**: Cloud Run 自動化部署
**日期**: 2025-11-07
**狀態**: 完成

本文件記錄 Cloud Run 部署功能的技術研究、評估過程與最終決策。

---

## 研究主題 1: 資料庫連線方式

### 問題
Cloud Run 後端如何安全且高效地連線至 Cloud SQL PostgreSQL？

### 評估選項

#### 選項 A: Cloud SQL Python Connector ✅ **已採用**
**原理**：使用 Google 官方函式庫 `google-cloud-sql-connector`，自動處理連線、認證與加密。

**優點**：
- ✅ 自動處理 TLS 1.3 加密（無需手動管理憑證）
- ✅ 支援 IAM 資料庫認證（可完全移除密碼）
- ✅ 內建連線池管理
- ✅ `refresh_strategy="lazy"` 適配 Cloud Run 環境（避免 CPU throttling 問題）
- ✅ 無需額外 Proxy 容器或 sidecar

**缺點**：
- ⚠️ 需新增依賴項 `google-cloud-sql-connector`
- ⚠️ 需修改 `backend/src/config.py` 的資料庫連線邏輯

**範例程式碼**：
```python
from google.cloud.sql.connector import Connector
import sqlalchemy

connector = Connector(refresh_strategy="lazy")

def getconn():
    return connector.connect(
        "three-birds-on-mountain:asia-east1:tpml-db",
        "asyncpg",
        user="tpml_user",
        password="password",  # 或使用 IAM Auth 移除密碼
        db="tpml_seat_tracker",
        ip_type="public"  # 使用 Public IP
    )

engine = sqlalchemy.create_engine(
    "postgresql+asyncpg://",
    creator=getconn,
)
```

**Context7 參考**：來自 `/googlecloudplatform/cloud-sql-python-connector`

---

#### 選項 B: Unix Socket（透過 Cloud SQL Proxy）
**原理**：在 Cloud Run 服務配置中設定 `--add-cloudsql-instances`，透過 Unix socket `/cloudsql/PROJECT:REGION:INSTANCE` 連線。

**優點**：
- ✅ 無需修改程式碼（只需調整連線字串）
- ✅ Google Cloud 官方推薦方式之一

**缺點**：
- ❌ 需在 Cloud Run 部署時明確指定 `--add-cloudsql-instances`
- ❌ 連線字串較複雜（`?host=/cloudsql/...`）
- ❌ 不支援 asyncpg（需用同步驅動如 psycopg2）
- ❌ 本專案已使用 asyncpg，切換成本高

**連線字串範例**：
```python
DATABASE_URL = "postgresql+psycopg2://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE"
```

---

#### 選項 C: 直接 TCP 連線（Public IP）
**原理**：使用標準 TCP 連線至 Cloud SQL 的 Public IP。

**優點**：
- ✅ 最簡單（無需額外函式庫）

**缺點**：
- ❌ 需要授權 Cloud Run 的出口 IP（但 Cloud Run 出口 IP 不固定）
- ❌ 無內建 TLS 加密（需手動配置）
- ❌ 無 IAM 認證支援
- ❌ **安全性風險高，不建議**

---

### 決策：選項 A（Cloud SQL Python Connector）

**理由**：
1. 安全性最佳（自動 TLS + IAM 認證）
2. 適配 Cloud Run 環境（lazy refresh 避免 CPU throttling）
3. 支援現有 asyncpg 驅動
4. Google Cloud 最佳實踐

**替代方案拒絕原因**：
- 選項 B：不支援 asyncpg，需重構現有資料庫層
- 選項 C：安全性不足，不符合生產環境標準

---

## 研究主題 2: Cloud SQL IP 類型選擇

### 問題
Cloud SQL 應使用 Public IP 還是 Private IP？是否需要 VPC Connector？

### 評估選項

#### 選項 A: Public IP + Cloud SQL Connector（無需 VPC）✅ **已採用**
**配置**：
- Cloud SQL 配置 Public IP
- Cloud Run 透過 Cloud SQL Python Connector 連線
- 連線自動加密（TLS 1.3）

**成本**：
- Cloud SQL (db-f1-micro): ~$15-20/月
- Cloud Run 前端: ~$2-5/月
- Cloud Run 後端: ~$5-10/月
- **總計: ~$22-35/月**

**優點**：
- ✅ 無需 VPC Connector（省 ~$30/月）
- ✅ 部署配置最簡單
- ✅ Cloud SQL Connector 自動提供 TLS 加密
- ✅ 支援 IAM 認證（安全性高）

**缺點**：
- ⚠️ Cloud SQL 有公開 IP（但僅允許授權連線）
- ⚠️ 需管理 Cloud SQL 授權網路清單（但 Connector 自動處理）

---

#### 選項 B: Private IP + VPC Connector
**配置**：
- Cloud SQL 配置 Private IP（僅在 VPC 內可見）
- 建立 Serverless VPC Access Connector
- Cloud Run 配置 `--vpc-egress=all --vpc-connector=CONNECTOR_NAME`

**成本**：
- Cloud SQL (db-g1-small): ~$25-30/月
- VPC Connector: ~$30-35/月（2x e2-micro instances + 流量費）
- Cloud Run: ~$7-15/月
- **總計: ~$62-80/月**

**優點**：
- ✅ 資料庫完全不暴露公開 IP
- ✅ 可連線其他 VPC 資源（例如 Redis, Memcached）

**缺點**：
- ❌ 成本高約 2-3 倍
- ❌ 配置複雜（需建立 VPC、Subnet、Connector）
- ❌ VPC Connector 可能成為效能瓶頸（需監控）

---

### 決策：選項 A（Public IP + Cloud SQL Connector）

**理由**：
1. 成本優化：月費用節省 ~$40 USD
2. 架構簡化：無需管理 VPC 網路
3. 安全性足夠：Cloud SQL Connector 提供 TLS 加密 + IAM 認證
4. 適合初期部署：可在未來需求增加時升級至 Private IP

**替代方案拒絕原因**：
- 選項 B：成本高 2-3 倍，目前不需要 VPC 內其他資源

**升級路徑**：
當以下情況發生時，考慮升級至 Private IP + VPC：
- 需要連線 Cloud Memorystore（Redis）
- 需要更嚴格的網路隔離（例如金融或醫療應用）
- 預算允許額外 $40-50/月支出

---

## 研究主題 3: 環境變數管理策略

### 問題
如何安全地管理與注入敏感環境變數（例如資料庫密碼、Mapbox Token）？

### 評估選項

#### 選項 A: Google Secret Manager ✅ **已採用**
**原理**：將敏感資訊儲存在 Secret Manager，Cloud Run 部署時透過 `--set-secrets` 參數注入。

**優點**：
- ✅ 符合安全最佳實踐（密碼不出現在程式碼或配置檔）
- ✅ 支援版本管理（可回滾至舊版密碼）
- ✅ IAM 存取控制（精細權限管理）
- ✅ 審計日誌（記錄誰何時存取密碼）
- ✅ 自動輪替密碼（透過 Secret Manager Rotation）

**成本**：
- 前 6 個 secret versions: 免費
- 每月每個 active secret: $0.06
- 每 10,000 次存取: $0.03
- **預估成本: < $1/月**

**使用方式**：
```bash
# 建立 secret
echo -n "postgresql+asyncpg://..." | gcloud secrets create database-url --data-file=-
echo -n "pk.ey..." | gcloud secrets create mapbox-token --data-file=-

# Cloud Run 部署時引用
gcloud run deploy backend \
  --set-secrets DATABASE_URL=database-url:latest

gcloud run deploy frontend \
  --set-secrets VITE_MAPBOX_TOKEN=mapbox-token:latest
```

**缺點**：
- ⚠️ 需額外步驟建立 secrets（但只需執行一次）
- ⚠️ 本地開發需從 Secret Manager 讀取或使用 `.env`

---

#### 選項 B: 直接透過 `--set-env-vars` 設定
**原理**：部署時直接傳遞環境變數值。

**優點**：
- ✅ 最簡單（無需額外服務）

**缺點**：
- ❌ **安全性風險**：密碼出現在 shell history
- ❌ **安全性風險**：密碼出現在 Cloud Run 配置中（可被有權限者查看）
- ❌ 不符合安全最佳實踐
- ❌ 無版本管理與審計日誌

**範例**（不建議）：
```bash
gcloud run deploy backend \
  --set-env-vars DATABASE_URL="postgresql://user:PLAINTEXT_PASSWORD@..."
```

---

#### 選項 C: 掛載 Secret 為檔案
**原理**：將 Secret Manager 的 secret 掛載為檔案（例如 `/secrets/database-url`），應用程式從檔案讀取。

**優點**：
- ✅ 密碼不出現在環境變數（某些掃描工具會檢查 env vars）
- ✅ 支援複雜格式（例如 JSON 配置檔）

**缺點**：
- ⚠️ 需修改應用程式讀取邏輯（增加複雜度）
- ⚠️ 不適合 Vite 建置時環境變數（前端需要在建置時注入）

---

### 決策：選項 A（Secret Manager）

**理由**：
1. 安全性最佳（符合 OWASP 與 Google Cloud 最佳實踐）
2. 成本極低（< $1/月）
3. 支援版本管理與審計
4. 整合簡單（`--set-secrets` 參數）

**替代方案拒絕原因**：
- 選項 B：安全性不足，不符合生產環境標準
- 選項 C：增加應用程式複雜度，前端建置時注入困難

---

## 研究主題 4: 前端環境變數注入策略

### 問題
前端 Vite 應用的環境變數（例如 `VITE_API_BASE_URL`, `VITE_MAPBOX_TOKEN`）如何在 Cloud Run 建置時注入？

### 背景知識
Vite 環境變數在**建置時**（`npm run build`）被靜態注入到 JavaScript bundle，無法在**執行時**動態改變。

### 評估選項

#### 選項 A: Dockerfile ARG + 建置時注入 ✅ **已採用**
**原理**：在 Dockerfile 中使用 `ARG` 接收建置參數，轉為 `ENV`，Vite 在建置時讀取。

**Dockerfile 修改**：
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# 接收建置參數
ARG VITE_API_BASE_URL
ARG VITE_MAPBOX_TOKEN

# 設定為環境變數供 Vite 使用
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build  # Vite 在此時讀取 VITE_* 環境變數
```

**部署指令**（透過 Cloud Run MCP）：
```bash
# 假設 MCP 工具支援傳遞 build args
# 或手動使用 Cloud Build:
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_API_URL="https://backend-xxx.run.app",_MAPBOX_TOKEN="pk.ey..."
```

**優點**：
- ✅ 符合 Vite 運作方式（建置時注入）
- ✅ 最終映像檔不包含敏感資訊（已編譯為 JS）
- ✅ 執行環境無需額外配置

**缺點**：
- ⚠️ 每次環境變數改變需重新建置映像檔
- ⚠️ Cloud Run MCP 工具需支援傳遞 build args（需驗證）

---

#### 選項 B: 執行時配置檔注入（進階）
**原理**：建置通用映像檔，執行時透過掛載 `config.json` 或環境變數替換 `index.html` 中的佔位符。

**實作方式**：
1. 建置時使用佔位符：`VITE_API_BASE_URL="__API_URL__"`
2. 執行時透過 `entrypoint.sh` 替換：
   ```bash
   sed -i "s|__API_URL__|${API_URL}|g" /usr/share/nginx/html/index.html
   ```

**優點**：
- ✅ 單一映像檔適用多環境（dev, staging, prod）
- ✅ 無需重新建置即可更新配置

**缺點**：
- ❌ 增加部署複雜度（需自訂 entrypoint）
- ❌ 不符合 Vite 標準實踐
- ❌ 敏感資訊出現在 HTML 原始碼（可被檢視）

---

### 決策：選項 A（Dockerfile ARG 建置時注入）

**理由**：
1. 符合 Vite 標準實踐
2. 實作簡單且可維護
3. 最終產物不包含明文敏感資訊

**替代方案拒絕原因**：
- 選項 B：過度工程化，增加維護成本

**重要注意事項**：
- Mapbox Token 需設定為**公開 token**（有使用限制與 referer 限制）
- **私密資訊不應注入前端**（例如資料庫密碼）

---

## 研究主題 5: Cloud Run 自動擴展配置

### 問題
如何配置 Cloud Run 的自動擴展參數以平衡成本與效能？

### 評估選項

#### 建議配置 ✅ **已採用**

**後端服務**：
```bash
gcloud run deploy backend \
  --min-instances=0 \          # 無流量時縮減至 0（節省成本）
  --max-instances=10 \         # 防止意外流量導致高額帳單
  --cpu=1 \                    # 1 vCPU
  --memory=1Gi \               # 1GB RAM
  --concurrency=80 \           # 每個 instance 處理 80 並行請求
  --timeout=300                # 5 分鐘逾時（預設 5 分鐘）
```

**前端服務**：
```bash
gcloud run deploy frontend \
  --min-instances=0 \          # 無流量時縮減至 0
  --max-instances=5 \          # 前端靜態資源較輕量
  --cpu=0.5 \                  # 0.5 vCPU（靜態檔案夠用）
  --memory=512Mi \             # 512MB RAM
  --concurrency=80 \           # Nginx 可處理高並行
  --timeout=60                 # 1 分鐘逾時
```

**理由**：
- `min-instances=0`：節省成本，適合低流量應用
- `concurrency=80`：Cloud Run 預設，適合大多數 Web 應用
- `max-instances=5-10`：防止成本失控（可依需求調整）

---

#### 替代配置：生產環境高可用

**配置**：
```bash
--min-instances=1 \   # 至少 1 個 instance 保持溫暖（減少冷啟動）
--max-instances=50    # 更高上限支援流量尖峰
```

**成本影響**：
- `min-instances=1` 會產生**持續成本**（約 $10-20/月）
- 適合需要低延遲的生產環境

---

### 決策：初期使用 min-instances=0

**理由**：
1. 成本優化：無流量時不收費
2. 流量低：預期初期 < 1000 使用者/月
3. 可接受冷啟動：首次請求延遲 1-3 秒可接受

**升級路徑**：
當以下情況發生時，考慮設定 `min-instances=1`：
- 使用者反應冷啟動延遲過高
- 流量穩定且持續
- 預算允許額外成本

---

## 研究主題 6: Nginx SPA 路由配置驗證

### 問題
確認現有 `frontend/docker/nginx.conf` 是否正確處理 React Router 的 SPA 路由？

### 現有配置檢查

**檔案**: `frontend/docker/nginx.conf`

**必要配置要素**：
1. ✅ `try_files $uri $uri/ /index.html;` - 將所有未匹配路徑導向 index.html
2. ✅ 正確的 MIME types - 確保 .js, .css, .svg 等檔案正確識別
3. ✅ Gzip 壓縮 - 減少傳輸大小
4. ⚠️ 需驗證是否有 security headers（例如 `X-Frame-Options`, `X-Content-Type-Options`）

**範例標準配置**：
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

### 決策：驗證並微調現有 nginx.conf

**行動**：
1. 讀取 `frontend/docker/nginx.conf`
2. 確認包含 `try_files $uri $uri/ /index.html;`
3. 建議新增安全 headers（如缺失）
4. 建議新增靜態資源快取（優化效能）

**優先級**：
- P0（必須）：SPA 路由支援
- P1（建議）：安全 headers
- P2（優化）：靜態資源快取與 Gzip

---

## 總結：技術決策矩陣

| 決策點 | 選擇方案 | 理由 | 成本影響 |
|--------|---------|------|---------|
| 資料庫連線 | Cloud SQL Python Connector | 安全性 + asyncpg 支援 | +依賴項（無成本） |
| Cloud SQL IP | Public IP | 成本優化（無需 VPC） | 節省 ~$30/月 |
| 密碼管理 | Secret Manager | 安全最佳實踐 | < $1/月 |
| 前端環境變數 | Dockerfile ARG | 符合 Vite 標準 | 無額外成本 |
| 自動擴展 | min=0, max=10 | 成本優化 | 無流量時 $0 |
| SPA 路由 | Nginx try_files | 標準實踐 | 無額外成本 |

**總預估月成本**: **~$25-35 USD**

---

## 參考資料

- [Cloud SQL Python Connector 官方文件](https://github.com/googlecloudplatform/cloud-sql-python-connector)
- [Cloud Run Samples - Database Connections](https://github.com/googlecloudplatform/cloud-run-samples)
- [Google Cloud Run 最佳實踐](https://cloud.google.com/run/docs/best-practices)
- [Secret Manager 定價](https://cloud.google.com/secret-manager/pricing)
- Context7 技術文件：`/googlecloudplatform/cloud-sql-python-connector`

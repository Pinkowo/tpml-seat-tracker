# Tasks: Cloud Run 自動化部署

**Input**: Design documents from `/specs/002-cloud-run-deploy/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

專案結構：Web 應用（`backend/` + `frontend/`）

---

## Phase 1: Setup (GCP 基礎設施初始化)

**Purpose**: 建立 Google Cloud 專案基礎設施與服務啟用

- [x] T001 驗證 GCP 專案設定與權限（檢查專案 ID、計費啟用、使用者角色）
- [x] T002 [P] 啟用必要 GCP API（Cloud Run, Cloud SQL, Secret Manager, Cloud Build）
- [x] T003 [P] 設定 gcloud CLI 預設專案與區域（asia-east1）
- [x] T004 建立 Cloud SQL PostgreSQL 15 實例（db-f1-micro, Public IP, 10GB SSD）
- [x] T005 建立 Cloud SQL 資料庫 tpml_seat_tracker（UTF8, en_US.UTF8）
- [x] T006 建立 Cloud SQL 使用者 tpml_user 並產生強密碼
- [x] T007 [P] 建立 Secret Manager secret: database-password（儲存資料庫密碼）
- [x] T008 [P] 建立 Secret Manager secret: mapbox-token（儲存 Mapbox Public Token）
- [x] T009 [P] 授予 Cloud Run Service Account 存取 Secret Manager 的權限

**Checkpoint**: ✅ GCP 基礎設施就緒 - 可開始後端與前端部署準備

---

## Phase 2: 後端程式碼調整（準備 Cloud Run 部署）

**Purpose**: 調整後端程式碼以支援 Cloud SQL Connector 與生產環境配置

- [x] T010 新增 google-cloud-sql-connector 依賴至 backend/pyproject.toml（最終使用 asyncpg + Unix Socket 方案）
- [x] T011 調整 backend/src/config.py 以支援 Cloud SQL Connector 環境變數（DATABASE_URL 支援 Unix Socket）
- [x] T012 建立 backend/src/database.py（簡化版：使用直接 DATABASE_URL，支援 Unix Socket）
- [x] T013 調整 backend/src/main.py（整合 database.py, 啟動時測試連線, 關閉時清理, 設定 CORS）
- [x] T014 調整 backend/Dockerfile 生產環境配置（uvicorn 使用 2 workers, 移除 --reload）
- [x] T015 [P] 本地測試後端程式碼調整（透過 Cloud SQL Proxy 驗證連線成功）

**Checkpoint**: ✅ 後端程式碼已準備好部署至 Cloud Run（使用 Unix Socket 方案）

---

## Phase 3: User Story 1 - 後端 API 部署到 Cloud Run (Priority: P1) 🎯 MVP

**Goal**: 將 FastAPI 後端應用部署到 Google Cloud Run，提供公開可存取的 REST API

**Independent Test**: 透過 `curl https://backend-xxx.run.app/api/health` 驗證後端服務正常運作，返回 200 狀態碼與健康檢查回應

### Implementation for User Story 1

- [x] T016 [US1] 建置後端 Docker 映像檔並推送至 Artifact Registry（使用 gcloud builds submit）
- [x] T017 [US1] 部署後端 Cloud Run 服務 tpml-backend（使用 --add-cloudsql-instances + DATABASE_URL with Unix Socket）
- [x] T018 [US1] 取得後端 Cloud Run 服務 URL（https://tpml-backend-713120393046.asia-east1.run.app）
- [x] T019 [US1] 驗證後端健康檢查端點（返回 status: healthy, database: connected ✅）
- [x] T020 [US1] 驗證後端 API 端點（/api/v1/libraries 返回 69 個圖書館資料 ✅）
- [x] T021 [US1] 測試後端服務更新部署（多次部署驗證成功 ✅）

**Checkpoint**: ✅ 後端 API 已成功部署至 Cloud Run 並可公開存取，所有 API 端點正常運作
**Additional**: ✅ 已執行 Alembic migrations + seed data（69 圖書館 + 25 座位區域真實資料）

---

## Phase 4: 前端程式碼調整（準備 Cloud Run 部署）

**Purpose**: 調整前端程式碼以支援建置時環境變數注入

- [ ] T022 調整 frontend/Dockerfile（在 builder stage 新增 ARG VITE_API_BASE_URL 與 VITE_MAPBOX_TOKEN, 轉為 ENV 供 Vite 使用）
- [ ] T023 [P] 驗證 frontend/docker/nginx.conf SPA 路由配置（確認包含 try_files $uri $uri/ /index.html）
- [ ] T024 [P] 新增 security headers 至 frontend/docker/nginx.conf（X-Frame-Options, X-Content-Type-Options, X-XSS-Protection）
- [ ] T025 [P] 新增靜態資源快取設定至 frontend/docker/nginx.conf（js, css, 圖片檔案設定 expires 1y）
- [ ] T026 [P] 本地測試前端 Dockerfile 建置（使用測試環境變數建置, 驗證 dist/ 產出正確）

**Checkpoint**: 前端程式碼已準備好部署至 Cloud Run

---

## Phase 5: User Story 2 - 前端應用部署到 Cloud Run (Priority: P2)

**Goal**: 將 React + Vite 前端應用部署到 Google Cloud Run，提供公開可存取的使用者介面

**Independent Test**: 透過瀏覽器造訪 `https://frontend-xxx.run.app` 驗證前端正常載入，地圖與座位列表顯示，SPA 路由正常運作

**Dependencies**: 需要完成 User Story 1（後端部署）以取得 VITE_API_BASE_URL

### Implementation for User Story 2

- [ ] T027 [US2] 建置前端 Docker 映像檔並注入建置參數（使用 gcloud builds submit 與 Cloud Build YAML, 注入 VITE_API_BASE_URL 與 VITE_MAPBOX_TOKEN）
- [ ] T028 [US2] 部署前端 Cloud Run 服務 tpml-frontend（配置資源: 0.5 CPU, 512Mi RAM, min=0, max=5, port=80）
- [ ] T029 [US2] 取得前端 Cloud Run 服務 URL
- [ ] T030 [US2] 更新後端 CORS_ORIGINS 環境變數為前端 URL
- [ ] T031 [US2] 驗證前端頁面載入（瀏覽器開啟前端 URL, 檢查無白屏或錯誤, Console 無 CORS 錯誤）
- [ ] T032 [US2] 驗證前端地圖顯示（確認 Mapbox Token 有效, 地圖正常渲染）
- [ ] T033 [US2] 驗證前端 API 整合（座位列表顯示即時資料, 無網路錯誤）
- [ ] T034 [US2] 驗證 SPA 路由（直接造訪子路由如 /library/123, 重新整理頁面, 確認返回 200 而非 404）
- [ ] T035 [US2] 測試前端服務更新部署（修改任意程式碼, 重新建置並部署, 驗證無縫切換）

**Checkpoint**: 前端應用已成功部署至 Cloud Run，與後端 API 正確整合，使用者可正常存取完整功能

---

## Phase 6: User Story 3 - 環境變數配置優化 (Priority: P3)

**Goal**: 優化與驗證前後端環境變數配置，確保應用完整運作與安全性

**Independent Test**: 透過 `gcloud run services describe` 檢視環境變數設定，驗證所有必要變數已正確配置，應用讀取變數無誤

**Dependencies**: 需要完成 User Story 1 和 2（前後端已部署）

### Implementation for User Story 3

- [x] T036 [US3] 驗證後端必要環境變數（DATABASE_URL 使用 Unix Socket 方式配置 ✅）
- [x] T037 [US3] 驗證後端 secrets 配置（DB_PASSWORD 透過 DATABASE_URL 直接配置 ✅）
- [ ] T038 [US3] 驗證前端建置時環境變數（需要前端部署後驗證）
- [x] T039 [US3] 測試資料庫連線（health check 返回 database: connected ✅）
- [ ] T040 [US3] 測試 CORS 配置（需要前端部署後驗證）
- [ ] T041 [US3] 測試 Mapbox Token 限制（需要前端部署後驗證）
- [ ] T042 [US3] 文件化環境變數更新流程（已在 cloud-run-deployment-guide.md 詳細記錄 ✅）

**Checkpoint**: 後端環境變數已正確配置並驗證，前端相關驗證待 Phase 5 完成後執行

---

## Phase 7: Polish & 驗證

**Purpose**: 最終驗證與文件化

- [ ] T043 [P] 執行完整整合測試（前端 → 後端 → Cloud SQL 完整流程, 模擬真實使用者操作）
- [ ] T044 [P] 驗證部署效能指標（後端回應時間 < 1 秒, 前端首次載入 < 3 秒）
- [ ] T045 [P] 驗證自動擴展配置（模擬流量尖峰, 確認 Cloud Run 自動擴展至多個 instances）
- [x] T046 [P] 檢查 Cloud Run 日誌（後端日誌確認無異常錯誤 ✅）
- [x] T047 [P] 驗證 Cloud SQL 連線池（連線池正常運作，health check 驗證通過 ✅）
- [ ] T048 設定成本預算告警（GCP Console 建立預算 $50/月, 告警閾值 50%, 90%, 100%）
- [x] T049 [P] 更新專案文件（已建立 docs/cloud-run-deployment-guide.md 663行完整部署指南 ✅）
- [x] T050 [P] 建立部署後檢查清單（已在 deployment guide 中文件化驗證步驟 ✅）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無依賴 - 可立即開始
- **後端調整 (Phase 2)**: 依賴 Setup 完成（需要 Cloud SQL 實例資訊）
- **User Story 1 (Phase 3)**: 依賴後端調整完成 - 後端可獨立部署
- **前端調整 (Phase 4)**: 可與 Phase 3 平行進行（但需要 US1 的後端 URL）
- **User Story 2 (Phase 5)**: 依賴 US1 完成（需要後端 URL）與前端調整完成
- **User Story 3 (Phase 6)**: 依賴 US1 和 US2 完成（驗證整合）
- **Polish (Phase 7)**: 依賴所有 User Stories 完成

### User Story Dependencies

- **User Story 1 (P1 - 後端部署)**:
  - 依賴：Phase 1 (Setup) + Phase 2 (後端調整)
  - 無其他 User Story 依賴
  - 可獨立完成並測試

- **User Story 2 (P2 - 前端部署)**:
  - 依賴：User Story 1（需要後端 URL）
  - 依賴：Phase 4 (前端調整)
  - 可獨立測試（前端功能）

- **User Story 3 (P3 - 環境變數優化)**:
  - 依賴：User Story 1 和 2（驗證整合配置）
  - 著重於優化與驗證，非新功能開發

### Parallel Opportunities

- **Phase 1 Setup**: T002, T003, T007, T008, T009 可平行執行
- **Phase 2 後端調整**: T015 可與其他任務平行（本地測試）
- **Phase 4 前端調整**: T023, T024, T025, T026 可平行執行
- **Phase 7 Polish**: T043, T044, T045, T046, T047, T049, T050 可平行執行

**關鍵依賴鏈**:
```
Setup (T001-T009)
  → 後端調整 (T010-T015)
    → US1 後端部署 (T016-T021) → 取得後端 URL
      → 前端調整 (T022-T026)
        → US2 前端部署 (T027-T035) → 取得前端 URL
          → US3 環境變數優化 (T036-T042)
            → Polish (T043-T050)
```

---

## Parallel Example: Setup Phase

```bash
# 可同時執行的任務：
Task T002: "啟用 GCP API"
Task T003: "設定 gcloud CLI"
Task T007: "建立 database-password secret"
Task T008: "建立 mapbox-token secret"
Task T009: "授予 Service Account 權限"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup（GCP 基礎設施）
2. ✅ Complete Phase 2: 後端調整（程式碼準備）
3. ✅ Complete Phase 3: User Story 1（後端部署）
4. **STOP and VALIDATE**: 測試後端 API 獨立運作
5. 可選：暫停於此，僅提供 API 服務

### Incremental Delivery

1. Setup + 後端調整 → 後端準備就緒
2. **User Story 1（後端部署）→ 獨立測試 → 部署/Demo (MVP!)**
   - 此時已有可運作的後端 API
   - 可供第三方整合或測試
3. 前端調整 + **User Story 2（前端部署）→ 獨立測試 → 部署/Demo**
   - 此時擁有完整的前後端應用
   - 使用者可透過網頁存取
4. **User Story 3（環境變數優化）→ 驗證整合 → 最終確認**
   - 確保所有配置最佳化
   - 安全性與效能驗證
5. Polish → 生產環境就緒

### Parallel Team Strategy

若有多位開發者：

1. **Developer A**: Phase 1 + Phase 2（後端準備）
2. **Developer B**: Phase 4（前端準備，可與 Phase 2 平行）
3. **Phase 1-2 完成後**:
   - Developer A: User Story 1（後端部署）
   - Developer B: 等待後端 URL，準備前端建置參數
4. **US1 完成後**:
   - Developer A: User Story 3 準備（檢查後端環境變數）
   - Developer B: User Story 2（前端部署）
5. **US2 完成後**:
   - Developer A + B: User Story 3（整合驗證）
6. **全部完成後**:
   - Developer A + B: Phase 7（Polish，可平行分工）

---

## Notes

- **[P] tasks**: 不同檔案或無依賴，可平行執行
- **[Story] label**: 標記任務屬於哪個 User Story（US1, US2, US3）
- **獨立可測試性**: 每個 User Story 應可獨立完成與驗證
- **commit 策略**: 每完成一個 phase 或 checkpoint 後 commit
- **驗證優先**: 每個 checkpoint 都應執行驗證，確保功能正常
- **成本監控**: 定期檢查 GCP 計費，確保在預算內（$25-35/月）
- **避免事項**:
  - ❌ 不要跳過 checkpoint 驗證
  - ❌ 不要在未取得後端 URL 前建置前端
  - ❌ 不要將敏感資訊注入前端環境變數
  - ❌ 不要使用 Mapbox Secret Token（必須用 Public Token）

---

## Quick Reference: 部署指令摘要

### 後端部署（User Story 1）
```bash
# 建置並推送映像檔
cd backend
gcloud builds submit --tag asia-east1-docker.pkg.dev/$PROJECT_ID/containers/backend:latest .

# 部署 Cloud Run 服務
gcloud run deploy tpml-backend \
  --region=asia-east1 \
  --image=asia-east1-docker.pkg.dev/$PROJECT_ID/containers/backend:latest \
  --set-env-vars="CLOUD_SQL_CONNECTION_NAME=$CONNECTION_NAME,DB_USER=tpml_user,DB_NAME=tpml_seat_tracker" \
  --set-secrets="DB_PASSWORD=database-password:latest" \
  --cpu=1 --memory=1Gi --min-instances=0 --max-instances=10
```

### 前端部署（User Story 2）
```bash
# 建置並注入環境變數
cd frontend
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_API_URL="$BACKEND_URL",_MAPBOX_TOKEN="$(gcloud secrets versions access latest --secret=mapbox-token)"

# 部署 Cloud Run 服務
gcloud run deploy tpml-frontend \
  --region=asia-east1 \
  --image=asia-east1-docker.pkg.dev/$PROJECT_ID/containers/frontend:latest \
  --cpu=0.5 --memory=512Mi --min-instances=0 --max-instances=5 --port=80
```

### 驗證
```bash
# 後端健康檢查
curl https://tpml-backend-xxx.run.app/api/health

# 前端載入測試
curl -I https://tpml-frontend-xxx.run.app
```

---

**總任務數**: 50
**User Story 1 任務數**: 6
**User Story 2 任務數**: 9
**User Story 3 任務數**: 7
**建議 MVP 範疇**: Phase 1 + Phase 2 + User Story 1（後端 API 部署）
**預估完成時間**:
- MVP（US1）: 2-3 小時
- 完整版（US1+US2+US3）: 4-6 小時
- 包含 Polish: 6-8 小時

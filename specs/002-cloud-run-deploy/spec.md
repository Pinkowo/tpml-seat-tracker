# Feature Specification: Cloud Run 自動化部署

**Feature Branch**: `002-cloud-run-deploy`
**Created**: 2025-11-07
**Status**: Draft
**Input**: User description: "新的需求是我需要把前後端的專案透過 cloud run mcp 部署到 google cloud run"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 後端 API 部署到 Cloud Run (Priority: P1)

開發者需要將 FastAPI 後端應用程式部署到 Google Cloud Run，讓線上環境的使用者能夠存取即時座位資料 API。

**Why this priority**: 後端 API 是系統核心，前端仰賴後端提供資料，必須優先部署。沒有後端 API，前端無法正常運作。

**Independent Test**: 可透過直接呼叫已部署的 Cloud Run 服務 URL（例如 `https://backend-xxx.run.app/api/health`）來驗證後端服務是否正常運作，獨立於前端應用。

**Acceptance Scenarios**:

1. **Given** 後端程式碼已準備就緒，**When** 開發者透過 Cloud Run MCP 工具執行部署指令，**Then** 後端應用成功部署到 Cloud Run 並返回公開的服務 URL
2. **Given** 後端服務已部署，**When** 開發者呼叫健康檢查端點（`/api/health`），**Then** 系統返回 200 狀態碼與正常回應
3. **Given** 後端服務運行中，**When** 使用者透過公開 URL 呼叫任一 API 端點（例如 `/api/libraries`），**Then** 系統正確返回 JSON 資料
4. **Given** 後端需要更新，**When** 開發者重新執行部署指令，**Then** 舊版本無縫切換至新版本，不影響線上服務

---

### User Story 2 - 前端應用部署到 Cloud Run (Priority: P2)

開發者需要將 React + Vite 前端應用部署到 Google Cloud Run，讓使用者能夠透過公開網址存取圖書館座位查詢介面。

**Why this priority**: 前端是使用者介面，依賴後端 API。在後端穩定運作後部署前端，確保完整的使用者體驗。

**Independent Test**: 可透過瀏覽器直接造訪已部署的前端 Cloud Run URL（例如 `https://frontend-xxx.run.app`），驗證前端靜態資源是否正確載入、SPA 路由是否正常運作，獨立於後端測試。

**Acceptance Scenarios**:

1. **Given** 前端程式碼已建置完成，**When** 開發者透過 Cloud Run MCP 工具執行部署指令，**Then** 前端應用成功部署到 Cloud Run 並返回公開的服務 URL
2. **Given** 前端服務已部署，**When** 使用者透過瀏覽器造訪服務 URL，**Then** 頁面正確顯示，地圖與座位列表正常載入
3. **Given** 前端使用 SPA 路由，**When** 使用者直接造訪子路由（例如 `/library/123`）或重新整理頁面，**Then** 應用正確顯示對應頁面而非 404 錯誤
4. **Given** 前端需要更新，**When** 開發者重新執行部署指令，**Then** 新版本無縫取代舊版本

---

### User Story 3 - 環境變數配置 (Priority: P3)

開發者需要為前後端服務設定必要的環境變數（例如 Mapbox Token、資料庫連線字串、CORS 設定），讓部署的應用能夠正確運作。

**Why this priority**: 環境變數配置是讓應用完整運作的必要步驟，但可以在基本部署流程建立後再調整優化。

**Independent Test**: 可透過檢視 Cloud Run 服務的環境變數設定（透過 GCP Console 或 CLI），並驗證應用是否正確讀取這些變數（例如前端地圖是否顯示、後端是否能連線資料庫）。

**Acceptance Scenarios**:

1. **Given** 後端需要資料庫連線設定，**When** 開發者在部署時設定環境變數（例如 `DATABASE_URL`），**Then** 後端應用正確讀取並連線至資料庫
2. **Given** 前端需要 Mapbox Token，**When** 開發者在部署時設定 `VITE_MAPBOX_TOKEN` 環境變數，**Then** 前端地圖正確顯示而非顯示錯誤訊息
3. **Given** 前端需要呼叫後端 API，**When** 開發者設定 `VITE_API_BASE_URL` 為後端 Cloud Run URL，**Then** 前端成功呼叫後端 API 並顯示即時資料
4. **Given** 後端需要允許前端跨域請求，**When** 開發者設定 CORS 相關環境變數，**Then** 前端能夠正常呼叫後端 API 而不被瀏覽器阻擋

---

### Edge Cases

- 當部署過程中網路連線中斷或逾時，系統應提供清楚的錯誤訊息，並允許開發者重試
- 當 Cloud Run 配額不足或專案權限不足，系統應明確告知錯誤原因與解決方式
- 當前端建置失敗（例如 TypeScript 編譯錯誤），部署流程應中止並返回錯誤訊息
- 當後端啟動失敗（例如環境變數缺失、資料庫連線失敗），Cloud Run 健康檢查應標記服務為不健康
- 當開發者更新環境變數，應用需要重新啟動才能讀取新值
- 當前端 SPA 路由使用 History API，Nginx 或 Cloud Run 需要正確配置，將所有路由導向 `index.html`

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統必須能夠將後端 FastAPI 應用部署到 Google Cloud Run
- **FR-002**: 系統必須能夠將前端 React 應用建置後部署到 Google Cloud Run
- **FR-003**: 後端部署必須包含正確的 Python 執行環境與依賴套件
- **FR-004**: 前端部署必須包含建置後的靜態檔案，並透過 Web 伺服器提供服務
- **FR-005**: 系統必須支援設定環境變數給已部署的 Cloud Run 服務
- **FR-006**: 後端服務必須提供健康檢查端點供 Cloud Run 監控
- **FR-007**: 前端服務必須正確處理 SPA 路由，確保所有路徑都導向 `index.html`
- **FR-008**: 部署流程必須返回已部署服務的公開 URL
- **FR-009**: 系統必須支援重新部署來更新已存在的服務
- **FR-010**: 後端服務必須正確配置 CORS，允許前端跨域請求
- **FR-011**: 部署流程發生錯誤時，必須提供清楚的錯誤訊息與建議解決方式

### Key Entities

- **後端服務（Backend Service）**: FastAPI 應用，提供 REST API 端點供前端呼叫，包含健康檢查、圖書館資料、即時座位狀態等功能
- **前端服務（Frontend Service）**: React SPA 應用，提供使用者介面，包含地圖、座位列表、篩選器等互動元素
- **環境變數（Environment Variables）**: 應用運作所需的配置參數，例如 API URL、第三方服務金鑰、資料庫連線字串等
- **Cloud Run 服務（Cloud Run Service）**: Google Cloud 提供的無伺服器容器運行平台，自動處理擴展、負載平衡與 HTTPS

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 開發者能夠在 5 分鐘內完成單次部署流程（從執行指令到取得服務 URL）
- **SC-002**: 已部署的後端服務在 95% 的情況下回應時間低於 1 秒
- **SC-003**: 已部署的前端服務能夠在 3 秒內完成首次載入
- **SC-004**: 部署成功率達 98%（排除網路或配額問題）
- **SC-005**: 前端與後端服務之間的整合測試成功率達 100%（所有 API 呼叫正常運作）
- **SC-006**: 服務更新部署過程中，停機時間不超過 10 秒
- **SC-007**: 開發者能夠在部署後立即透過公開 URL 存取並驗證服務正常運作

## Assumptions *(optional)*

- 開發者已安裝並設定好 Google Cloud CLI，並具備專案的部署權限
- 專案已啟用 Cloud Run API 與相關計費設定
- 使用者了解基本的 Docker 與容器化概念
- 前端建置產出為靜態檔案，可透過標準 Web 伺服器（如 Nginx）提供服務
- 後端使用 uvicorn 或類似 ASGI 伺服器運行 FastAPI 應用
- 環境變數敏感資料（例如資料庫密碼）將透過 Google Secret Manager 或其他安全方式管理
- Cloud Run 自動處理 HTTPS 憑證與負載平衡，無需額外配置

## Dependencies *(optional)*

- Google Cloud Run API 必須已啟用
- Google Cloud CLI 或 Cloud Run MCP 工具必須可用
- 前端專案需要 Dockerfile 或建置腳本來產生可部署的容器映像
- 後端專案需要 Dockerfile 或建置腳本來產生可部署的容器映像
- 若使用資料庫，需要先部署資料庫服務（例如 Cloud SQL）並取得連線資訊

## Scope Boundaries *(optional)*

### In Scope

- 使用 Cloud Run MCP 工具進行前後端部署
- 設定必要的環境變數
- 驗證部署成功與服務可存取性
- 提供基本的錯誤處理與訊息

### Out of Scope

- CI/CD 流程自動化（例如 GitHub Actions）
- 自訂網域名稱設定
- SSL 憑證進階配置（Cloud Run 預設提供）
- 監控與日誌分析工具整合
- 自動擴展策略調整
- 成本優化與配額管理
- 資料庫部署與遷移
- 備份與災難復原策略

# 後端團隊任務清單

## 團隊資訊

- **負責範圍**: FastAPI REST API、商業邏輯服務層、排程任務、API 文件
- **總任務數**: 85 個任務
- **預估工時**: 10-12 天（假設 2 位開發者平行作業）
- **技術棧**: Python 3.12, FastAPI, SQLAlchemy, APScheduler, pytest, Prophet/RandomForest/LSTM

## ⚠️ 共享任務（需協調）

- **T003**: docker-compose.yml（與資料庫團隊協調 PostgreSQL 設定）
- **T104**: README.md（與前端團隊協調整體專案說明）

## 依賴關係

### 依賴資料庫團隊
- **阻塞點**: 必須等待資料庫團隊完成 Phase 2.1（T016-T022）才能開始 Phase 2 核心架構
- **具體依賴**:
  - T021, T022（連線池與 session factory）完成後才能實作 T025（dependency injection）
  - T016-T020（migrations）完成後才能實作 Phase 3-7 的 models 與 services

### 阻塞前端團隊
- **Phase 3（US1）**: 前端需等待 T038-T040（GET /libraries, /realtime API）完成
- **Phase 4（US2）**: 前端需等待 T050-T051（排序 API）完成
- **Phase 5（US3）**: 前端需等待 T057-T059（營業時間 API）完成
- **Phase 6（US4）**: 前端需等待 T075（GET /predict API）完成

## 關鍵里程碑

1. **Milestone 1**: Phase 1 完成 → 後端專案結構與依賴項安裝完成
2. **Milestone 2**: Phase 2 完成 → 核心架構就緒，解除前端阻塞
3. **Milestone 3**: Phase 3 完成 → US1 API 就緒，前端可開始整合地圖功能
4. **Milestone 4**: Phase 4 完成 → US2 排序 API 就緒
5. **Milestone 5**: Phase 6 完成 → US4 預測 API 就緒（含排程任務）
6. **Milestone 6**: Phase 7 完成 → US5 所有排程任務就緒
7. **Milestone 7**: Phase 8 完成 → API 文件與監控完整

---

## Phase 1: 後端設置與測試基礎設施

**目標**: 建立後端專案結構、安裝依賴、設定測試環境

**預估工時**: 1 天

**⚠️ 前置**: 無依賴，可立即開始

### 1.1 專案結構與設定

- [ ] T001 [P] 建立 backend 目錄結構 (backend/src/{api,models,services,db}/) in backend/src/
  - **目錄**: api/, models/, services/, db/, tests/
  - **檔案**: __init__.py for each directory

- [ ] T004 [P] 建立 backend/.env.example，包含必要的環境變數 in backend/.env.example
  - **變數**: DATABASE_URL, API_BASE_URL, LOG_LEVEL, EXTERNAL_API_URL, MAPBOX_TOKEN (for testing)

### 1.2 Python 專案初始化

- [ ] T006 在 backend/ 使用 uv 初始化 Python 3.12 專案，包含 pyproject.toml in backend/pyproject.toml
  - **工具**: uv (package manager)
  - **命令**: `uv init` 或 `uv venv && uv pip compile pyproject.toml`
  - **Python version**: >=3.12
  - **輸出**: pyproject.toml, uv.lock（如適用）

- [ ] T007 使用 uv 在 backend/pyproject.toml 安裝 FastAPI, SQLAlchemy, Alembic, APScheduler, httpx 依賴項 in backend/pyproject.toml
  - **命令**: `uv pip install fastapi uvicorn sqlalchemy alembic apscheduler httpx pydantic-settings loguru python-dotenv` 或 `uv sync`
  - **核心**: fastapi, uvicorn, sqlalchemy, alembic, apscheduler, httpx, pydantic-settings
  - **工具**: loguru, python-dotenv
  - **輸出**: 更新 pyproject.toml 與 uv.lock

- [ ] T008 在 backend/alembic.ini 初始化 Alembic 設定 in backend/alembic.ini
  - **命令**: `alembic init alembic`
  - **設定**: sqlalchemy.url from env var

- [ ] T009 [P] 建立 backend/src/main.py，包含 FastAPI app 初始化 in backend/src/main.py
  - **內容**: FastAPI() instance, basic health check endpoint
  - **設定**: title, description, version

- [ ] T010 [P] 在 backend/pyproject.toml 設定 Ruff linter 與 formatter in backend/pyproject.toml
  - **Ruff config**: line-length = 100, select = ["E", "F", "I"]

### 1.3 測試基礎設施

- [ ] T015a [P] 在 backend/pyproject.toml 安裝 pytest 與 pytest-asyncio in backend/pyproject.toml
  - **套件**: pytest, pytest-asyncio, pytest-cov, httpx (for testing)

- [ ] T015c [P] 建立 backend/tests/ 目錄結構 (unit/, integration/, contract/, conftest.py) in backend/tests/
  - **目錄**: unit/, integration/, contract/
  - **檔案**: conftest.py, __init__.py

- [ ] T015e [P] 在 backend/ 設定 pytest.ini in backend/pytest.ini
  - **設定**: asyncio_mode = auto, testpaths = tests

---

## Phase 2: 核心架構（阻塞性任務）

**目標**: 建立 FastAPI 核心 middleware、錯誤處理、logging、設定管理

**預估工時**: 1.5-2 天

**⚠️ 依賴資料庫團隊**: T021, T022（連線池與 session）完成後才能實作 T025

**⚠️ 關鍵**: 此階段完成前，前端團隊無法開始整合 API

### 2.1 FastAPI 核心設定（可平行執行）

- [ ] T023 [P] 在 backend/src/main.py 建立 FastAPI middleware，處理 CORS 與 request logging in backend/src/main.py
  - **CORS**: 允許 frontend origin, credentials=True
  - **Request logging**: log method, path, status_code, duration

- [ ] T024 [P] 在 backend/src/api/exceptions.py 建立 HTTP 錯誤的 exception handlers in backend/src/api/exceptions.py
  - **Handlers**: 400, 404, 422, 500
  - **Response format**: {"error": str, "detail": dict}

- [ ] T025 [P] 在 backend/src/api/dependencies.py 建立資料庫 session 的 dependency injection in backend/src/api/dependencies.py
  - **⚠️ 依賴資料庫團隊**: T022 必須完成
  - **Function**: `async def get_db() -> AsyncGenerator[AsyncSession, None]`
  - **Usage**: `db: AsyncSession = Depends(get_db)`

- [ ] T026 [P] 在 backend/src/api/schemas.py 建立常用回應模式的 base Pydantic schemas in backend/src/api/schemas.py
  - **Schemas**: BaseResponse, ErrorResponse, PaginatedResponse
  - **Config**: from_attributes = True (for ORM mode)

- [ ] T027 [P] 在 backend/src/services/logger.py 使用 loguru 設定結構化日誌 in backend/src/services/logger.py
  - **設定**: JSON format, rotation, retention
  - **Levels**: DEBUG, INFO, WARNING, ERROR

- [ ] T028 [P] 在 backend/src/config.py 使用 pydantic-settings 建立環境設定 in backend/src/config.py
  - **Settings**: DATABASE_URL, API_BASE_URL, LOG_LEVEL, EXTERNAL_API_URL
  - **Validation**: Pydantic validators

**檢查點**: 核心架構完成 - 可開始實作 User Story APIs

---

## Phase 3: User Story 1 - 快速查找附近有空位的圖書館 (優先度: P1) 🎯 MVP

**目標**: 實作地圖查找所需的後端 API（圖書館列表、即時座位資料）

**預估工時**: 2-2.5 天

**⚠️ 依賴資料庫團隊**: T035, T036（Library & SeatRealtime models）必須完成

### 3.1 Services 層（可平行執行）

- [ ] T037 [P] [US1] 在 backend/src/services/distance.py 建立距離計算服務，使用 Haversine formula in backend/src/services/distance.py
  - **函式**: `def calculate_distance(lat1, lng1, lat2, lng2) -> float`
  - **回傳**: 距離（公尺）
  - **測試**: 已知座標驗證（例如：台北 101 到故宮）

### 3.2 API Endpoints（依序執行）

- [ ] T038 [US1] 在 backend/src/api/routes/libraries.py 建立 GET /api/v1/libraries endpoint，包含距離排序 in backend/src/api/routes/libraries.py
  - **⚠️ 依賴**: T037（distance service）完成
  - **Query params**: user_lat, user_lng (optional)
  - **Response**: List[LibraryResponse] with distance field
  - **排序**: 預設按距離（如果提供座標）

- [ ] T039 [US1] 在 backend/src/api/routes/realtime.py 建立 GET /api/v1/realtime endpoint，回傳所有圖書館與座位資料 in backend/src/api/routes/realtime.py
  - **Response**: List[RealtimeSeatResponse] with library info
  - **Join**: Library LEFT JOIN SeatRealtime

- [ ] T040 [US1] 在 backend/src/api/schemas.py 建立 Library 與 RealtimeSeat 回應的 Pydantic schemas in backend/src/api/schemas.py
  - **Schemas**:
    - LibraryResponse: id, name, address, latitude, longitude, distance (optional)
    - RealtimeSeatResponse: library, available_seats, total_seats, updated_at

### 3.3 測試 (US1)

- [ ] T048b [P] [US1] 在 backend/tests/contract/test_libraries_contract.py 撰寫 GET /api/v1/libraries endpoint 的 contract tests in backend/tests/contract/test_libraries_contract.py
  - **測試項目**: Response schema, status codes, query params

- [ ] T048c [P] [US1] 在 backend/tests/contract/test_realtime_contract.py 撰寫 GET /api/v1/realtime endpoint 的 contract tests in backend/tests/contract/test_realtime_contract.py
  - **測試項目**: Response schema, status codes, data freshness

- [ ] T048d [P] [US1] 在 backend/tests/unit/services/test_distance.py 撰寫 Haversine 距離計算的 unit tests in backend/tests/unit/services/test_distance.py
  - **測試案例**: 已知座標對、零距離、最大距離

**檢查點**: US1 後端 API 完成 - 前端可開始整合地圖

---

## Phase 4: User Story 2 - 透過列表排序快速比較館別 (優先度: P1)

**目標**: 增強排序功能，支援依距離或可用座位排序

**預估工時**: 1-1.5 天

**⚠️ 依賴**: Phase 3（T038-T040）完成

### 4.1 Services 層

- [ ] T049 [US2] 在 backend/src/services/library_service.py 實作排序服務 in backend/src/services/library_service.py
  - **函式**: `async def get_libraries_sorted(db, sort_by, user_lat, user_lng)`
  - **排序邏輯**:
    - sort_by="distance": 按距離遞增（需要座標）
    - sort_by="seats": 按可用座位遞減，再按距離遞增

### 4.2 API Endpoints 增強

- [ ] T050 [US2] 在 backend/src/api/routes/libraries.py 增強 GET /libraries endpoint，接受 user_lat/user_lng 查詢參數 in backend/src/api/routes/libraries.py
  - **Query params**: user_lat: float, user_lng: float (both optional)
  - **驗證**: 如果只提供其中一個，回傳 422 錯誤

- [ ] T051 [US2] 在 backend/src/api/routes/libraries.py 新增 sort_by 查詢參數（distance/seats），包含雙重排序邏輯 in backend/src/api/routes/libraries.py
  - **Query param**: sort_by: Literal["distance", "seats"] (default: "distance")
  - **邏輯**: 呼叫 T049 的 library_service

### 4.3 測試 (US2)

- [ ] T056a [P] [US2] 在 backend/tests/contract/test_libraries_sorting.py 撰寫 /libraries 排序參數的 contract tests in backend/tests/contract/test_libraries_sorting.py
  - **測試案例**: sort_by=distance, sort_by=seats, 缺少座標

- [ ] T056b [P] [US2] 在 backend/tests/unit/services/test_library_service.py 撰寫雙重排序邏輯的 unit tests in backend/tests/unit/services/test_library_service.py
  - **測試案例**: 距離排序、座位排序、次要排序

**檢查點**: US2 後端 API 完成 - 前端可實作列表排序

---

## Phase 5: User Story 3 - 查看開館倒數以規劃時間 (優先度: P2)

**目標**: 實作營業時間計算與閉館倒數邏輯

**預估工時**: 1 天

**⚠️ 依賴**: Phase 3（US1 API）完成

### 5.1 Services 層

- [ ] T057 [US3] 在 backend/src/services/opening_hours.py 建立營業時間計算服務 in backend/src/services/opening_hours.py
  - **函式**:
    - `def is_open(operating_hours: dict, current_time: datetime) -> bool`
    - `def closing_in_minutes(operating_hours: dict, current_time: datetime) -> int | None`
  - **邏輯**: 解析 operating_hours JSONB，比對當前時間

### 5.2 Schema 增強

- [ ] T058 [US3] 在 backend/src/api/schemas.py 新增 is_open 與 closing_in_minutes 欄位到 Library schema in backend/src/api/schemas.py
  - **新欄位**:
    - is_open: bool
    - closing_in_minutes: int | None (None if closed or > 120 minutes)
  - **計算**: 使用 T057 的 services

### 5.3 API Endpoints 增強

- [ ] T059 [US3] 在 backend/src/api/routes/libraries.py 增強 /libraries endpoint，包含計算後的營業狀態 in backend/src/api/routes/libraries.py
  - **邏輯**: 對每個 library 呼叫 opening_hours service
  - **回應**: 包含 is_open, closing_in_minutes

### 5.4 測試 (US3)

- [ ] T063a [P] [US3] 在 backend/tests/unit/services/test_opening_hours.py 撰寫營業時間計算的 unit tests in backend/tests/unit/services/test_opening_hours.py
  - **測試案例**:
    - 營業中（離閉館 >60 分鐘）
    - 即將閉館（≤60 分鐘）
    - 即將閉館（≤15 分鐘）
    - 已閉館
    - 跨日營業時間

**檢查點**: US3 後端 API 完成 - 前端可實作營業時間顯示

---

## Phase 6: User Story 4 - 查看座位數預測以提前規劃 (優先度: P2)

**目標**: 實作座位資料收集、預測模型訓練、預測 API

**預估工時**: 3-4 天

**⚠️ 依賴資料庫團隊**: T064-T066（SeatHistory, PredictionResult, ModelRegistry models）完成

### 6.1 資料收集 Service (Task A)

- [ ] T067 [US4] 在 backend/src/services/seat_collector.py 建立座位資料收集服務，包含外部 API client in backend/src/services/seat_collector.py
  - **函式**: `async def collect_seat_data() -> None`
  - **邏輯**:
    1. 使用 httpx 呼叫外部 API
    2. 解析回應
    3. 同步到資料庫

- [ ] T068 [US4] 在 backend/src/services/seat_collector.py 新增 batch_id 生成與雙資料表同步（realtime + history） in backend/src/services/seat_collector.py
  - **batch_id**: UUID or timestamp-based
  - **雙寫**:
    1. UPDATE seat_realtime（UPSERT）
    2. INSERT INTO seat_history

- [ ] T069 [US4] 在 backend/src/services/seat_collector.py 新增錯誤處理與重試邏輯（3 次重試，1 分鐘間隔）給外部 API in backend/src/services/seat_collector.py
  - **實作 FR-026**: 失敗時 1 分鐘間隔重試最多 3 次
  - **使用**: tenacity library 或自訂 retry decorator
  - **Logging**: 記錄每次重試與最終失敗

- [ ] T070 [US4] 在 backend/src/services/scheduler.py 建立 APScheduler job，每 10 分鐘收集座位資料 in backend/src/services/scheduler.py
  - **Job**: `interval_job(minutes=10, func=collect_seat_data)`
  - **設定**: misfire_grace_time, coalesce=True

### 6.2 預測訓練 Service (Task B)

- [ ] T071 [US4] 在 backend/src/services/prediction_trainer.py 建立預測訓練服務，使用 Prophet/RandomForest/LSTM in backend/src/services/prediction_trainer.py
  - **函式**: `async def train_prediction_models(library_id: int) -> None`
  - **模型**:
    1. Prophet（時間序列）
    2. RandomForest（特徵工程：hour, day_of_week, is_holiday）
    3. LSTM（深度學習）
  - **訓練資料**: 過去 90 天的 seat_history

- [ ] T072 [US4] 在 backend/src/services/prediction_trainer.py 實作 Champion/Challenger 比較邏輯（MAPE ≥5% 改善） in backend/src/services/prediction_trainer.py
  - **邏輯**:
    1. 取得 champion model（目前最佳）
    2. 訓練 challenger models（3 種演算法）
    3. 計算 MAPE（使用驗證集）
    4. 如果 challenger MAPE < champion MAPE * 0.95，升級為 champion
  - **更新**: model_registry 表

- [ ] T073 [US4] 在 backend/src/services/scheduler.py 建立 APScheduler job，每日 03:00 訓練 in backend/src/services/scheduler.py
  - **Job**: `cron_job(hour=3, minute=0, func=train_all_libraries)`
  - **邏輯**: 對每個 library 呼叫 train_prediction_models

- [ ] T074 [P] [US4] 在 backend/src/services/model_storage.py 建立模型持久化工具 in backend/src/services/model_storage.py
  - **函式**:
    - `async def save_model(library_id, model_type, model_obj, metrics)`
    - `async def load_model(library_id, model_type) -> model_obj`
  - **儲存**: pickle or joblib 到檔案系統或 S3

### 6.3 預測 Service

- [ ] T076 [US4] 在 backend/src/services/prediction_service.py 實作 fallback 邏輯（模型不可用時使用移動平均） in backend/src/services/prediction_service.py
  - **函式**: `async def predict_seats(library_id, horizon_minutes) -> int`
  - **邏輯**:
    1. 嘗試載入 champion model
    2. 如果失敗，使用移動平均（過去 3 個相同時段的平均）
  - **標記**: fallback 時回傳 is_fallback=True

### 6.4 API Endpoint

- [ ] T075 [US4] 在 backend/src/api/routes/predict.py 建立 GET /api/v1/predict endpoint，包含 branch_name 參數 in backend/src/api/routes/predict.py
  - **⚠️ 依賴**: T076（prediction_service）完成
  - **Query param**: branch_name: str (library name)
  - **Response**:
    ```json
    {
      "library_id": 1,
      "predictions": [
        {"horizon_minutes": 30, "predicted_seats": 50, "is_fallback": false},
        {"horizon_minutes": 60, "predicted_seats": 45, "is_fallback": false}
      ]
    }
    ```

- [ ] T077 [US4] 在 backend/src/api/schemas.py 建立預測回應的 Pydantic schema（30m/60m 預測時間點） in backend/src/api/schemas.py
  - **Schemas**:
    - PredictionItem: horizon_minutes, predicted_seats, is_fallback
    - PredictionResponse: library_id, predictions: List[PredictionItem]

### 6.5 測試 (US4)

- [ ] T081a [P] [US4] 在 backend/tests/contract/test_predict_contract.py 撰寫 GET /api/v1/predict endpoint 的 contract tests in backend/tests/contract/test_predict_contract.py
  - **測試項目**: Response schema, query params, fallback flag

- [ ] T081b [P] [US4] 在 backend/tests/unit/services/test_seat_collector.py 使用外部 API mocks 撰寫座位收集器的 unit tests in backend/tests/unit/services/test_seat_collector.py
  - **Mock**: httpx responses
  - **測試案例**: 成功、API 錯誤、重試邏輯

- [ ] T081c [P] [US4] 在 backend/tests/unit/services/test_prediction_trainer.py 撰寫預測訓練器（Champion/Challenger）的 unit tests in backend/tests/unit/services/test_prediction_trainer.py
  - **測試案例**: Champion 升級、Challenger 未達標、MAPE 計算

- [ ] T081d [P] [US4] 在 backend/tests/unit/services/test_prediction_service.py 撰寫 fallback 邏輯（移動平均）的 unit tests in backend/tests/unit/services/test_prediction_service.py
  - **測試案例**: 模型可用、模型失敗、移動平均計算

- [ ] T081e [US4] 在 backend/tests/integration/test_prediction_flow.py 撰寫預測資料流的 integration tests in backend/tests/integration/test_prediction_flow.py
  - **流程**: 收集資料 → 訓練模型 → 預測 → 驗證結果

**檢查點**: US4 後端完成 - 前端可實作預測顯示

---

## Phase 7: User Story 5 - 自動更新資料以確保資訊即時性 (優先度: P3)

**目標**: 實作所有排程任務的初始化與圖書館 metadata 同步

**預估工時**: 1-1.5 天

**⚠️ 依賴**: Phase 6（US4 排程任務）完成

### 7.1 Scheduler 初始化

- [ ] T082 [US5] 在 backend/src/main.py 的 FastAPI startup event 初始化 APScheduler in backend/src/main.py
  - **Event**: `@app.on_event("startup")`
  - **邏輯**: 啟動 scheduler, 註冊所有 jobs（T070, T073, T084）

### 7.2 Library Metadata 同步 (Task C)

- [ ] T083 [US5] 在 backend/src/services/library_sync.py 建立圖書館 metadata 同步服務（Task C） in backend/src/services/library_sync.py
  - **函式**: `async def sync_library_metadata() -> None`
  - **邏輯**:
    1. 呼叫外部 API 取得圖書館列表
    2. UPSERT library_info 表（更新現有、插入新館）
    3. 標記已移除的館別

- [ ] T084 [US5] 在 backend/src/services/scheduler.py 建立 APScheduler job，每日 02:00 同步圖書館資料 in backend/src/services/scheduler.py
  - **Job**: `cron_job(hour=2, minute=0, func=sync_library_metadata)`

### 7.3 通用重試邏輯

- [ ] T085 [P] [US5] 在 backend/src/services/retry.py 新增完整的重試邏輯，1 分鐘間隔（最多 3 次嘗試） in backend/src/services/retry.py
  - **Decorator**: `@retry(max_attempts=3, delay=60, backoff=1)`
  - **使用**: 套用到 T067, T069, T083

### 7.4 測試 (US5)

- [ ] T090c [US5] 在 backend/tests/integration/test_scheduler.py 撰寫 APScheduler jobs 的 integration tests in backend/tests/integration/test_scheduler.py
  - **測試案例**:
    - Jobs 正確註冊
    - 手動觸發 job 執行成功
    - Misfire 處理

**檢查點**: 所有排程任務運作正常

---

## Phase 8: 最佳化與跨領域關注點

**目標**: API 文件、健康檢查、錯誤監控、效能最佳化

**預估工時**: 1.5-2 天

**⚠️ 依賴**: 所有 User Story API 完成

### 8.1 API 健康檢查與文件

- [ ] T091 [P] 在 backend/src/api/routes/health.py 建立 GET /api/v1/health endpoint，包含資料庫檢查 in backend/src/api/routes/health.py
  - **Response**:
    ```json
    {
      "status": "healthy",
      "database": "connected",
      "scheduler": "running",
      "timestamp": "2025-11-01T10:00:00Z"
    }
    ```

- [ ] T092 [P] 在 backend/src/main.py 設定 FastAPI OpenAPI 文件 metadata in backend/src/main.py
  - **Metadata**: title, description, version, contact, license

- [ ] T093 [P] 在 backend/src/api/routes/ 新增 API endpoint 描述與範例 in backend/src/api/routes/
  - **每個 endpoint**: docstring, description, response_description, examples

### 8.2 錯誤監控與效能

- [ ] T094 [P] 在 backend/src/main.py 新增 request duration metrics middleware in backend/src/main.py
  - **Middleware**: 記錄每個請求的耗時
  - **Logging**: `logger.info(f"{method} {path} - {duration}ms")`

- [ ] T095 [P] 在 backend/src/services/error_tracking.py 設定錯誤追蹤整合點 in backend/src/services/error_tracking.py
  - **整合**: Sentry or custom error logger
  - **Capture**: 所有 unhandled exceptions

### 8.3 部署

- [ ] T101 [P] 在 backend/Dockerfile 建立 backend 的 Dockerfile，使用 multi-stage build in backend/Dockerfile
  - **Stage 1**: Build dependencies
  - **Stage 2**: Runtime (slim image)
  - **ENTRYPOINT**: `uvicorn src.main:app --host 0.0.0.0 --port 8000`

- [ ] T103 [P] 在 backend/Dockerfile 使用 layer caching 最佳化 Docker image in backend/Dockerfile
  - **優化**: 先 COPY requirements, 再 COPY source code

- [ ] T104 [P] 在 README.md 建立完整的 README，包含快速入門指南 in README.md
  - **⚠️ 共享**: 與前端團隊協調整體專案說明
  - **內容**: 專案簡介、架構圖、API 文件連結、本地開發設定

---

## 並行執行機會

### 可同時進行的任務批次

**批次 1: Phase 1 設置（完全平行）**
```bash
同時執行:
- T001: backend 目錄結構
- T004: .env.example
- T006-T010: Python 專案初始化
- T015a, T015c, T015e: 測試設定
```

**批次 2: Phase 2 核心架構（完全平行，除了 T025）**
```bash
同時執行:
- T023: CORS middleware
- T024: Exception handlers
- T026: Base schemas
- T027: Logging
- T028: Config

等待資料庫團隊 T022 完成後:
- T025: Dependency injection
```

**批次 3: Phase 3 US1 Services（平行）**
```bash
Developer A:
- T037: Distance service
- T048d: Distance tests

Developer B（等待 T037）:
- T038-T040: API endpoints & schemas
- T048b, T048c: Contract tests
```

**批次 4: Phase 6 US4（高度平行）**
```bash
Developer A（資料收集）:
- T067-T070: Seat collector + scheduler
- T081b: Tests

Developer B（預測訓練）:
- T071-T074: Prediction trainer + model storage
- T081c: Tests

Developer A 或 B（預測 API）:
- T075-T077: Predict endpoint
- T081a, T081d: Tests

最後整合測試:
- T081e: Integration tests
```

---

## 任務統計

### 依 Phase 分布

| Phase | 任務數 | 預估工時 | 阻塞性 |
|-------|--------|----------|--------|
| Phase 1: 設置 | 10 | 1天 | ❌ |
| Phase 2: 核心架構 | 6 | 1.5-2天 | ✅ 阻塞前端 |
| Phase 3: US1 API | 7 | 2-2.5天 | ✅ 阻塞前端 US1 |
| Phase 4: US2 排序 | 5 | 1-1.5天 | ✅ 阻塞前端 US2 |
| Phase 5: US3 營業時間 | 4 | 1天 | ✅ 阻塞前端 US3 |
| Phase 6: US4 預測 | 15 | 3-4天 | ✅ 阻塞前端 US4 |
| Phase 7: US5 排程 | 4 | 1-1.5天 | ❌ |
| Phase 8: Polish | 7 | 1.5-2天 | ❌ |
| **總計** | **58** | **12-15天** | - |

### 依優先度分布

- **P0（阻塞性）**: 16 個任務（Phase 1 + Phase 2）
- **P1（MVP）**: 12 個任務（Phase 3 + Phase 4）
- **P2**: 19 個任務（Phase 5 + Phase 6）
- **P3**: 4 個任務（Phase 7）
- **Polish**: 7 個任務（Phase 8）

### 測試任務統計

- **Contract tests**: 5 個任務
- **Unit tests**: 10 個任務
- **Integration tests**: 3 個任務
- **測試覆蓋率目標**: >80%

---

## 執行建議

### 兩位開發者平行策略

**Week 1**:
- **Day 1**: 兩人一起完成 Phase 1（設置）
- **Day 2-3**: 兩人一起完成 Phase 2（核心架構，等待資料庫團隊）
- **Day 4-5**:
  - Developer A: Phase 3（US1 API）
  - Developer B: Phase 5（US3 營業時間）→ 簡單，可提前準備

**Week 2**:
- **Day 1**:
  - Developer A: Phase 4（US2 排序）
  - Developer B: 開始 Phase 6（US4 資料收集）
- **Day 2-4**:
  - Developer A: Phase 6（US4 預測訓練）
  - Developer B: Phase 6（US4 預測 API）
- **Day 5**:
  - Developer A: Phase 7（US5 排程）
  - Developer B: Phase 8（Polish）

### 驗證檢查清單

**Phase 2 完成檢查**:
- [ ] FastAPI app 啟動成功
- [ ] 可呼叫 health check endpoint
- [ ] Database dependency injection 正常運作
- [ ] CORS 設定正確（前端可呼叫）
- [ ] Logging 正常輸出

**Phase 3 完成檢查**:
- [ ] GET /api/v1/libraries 回傳所有圖書館
- [ ] 提供座標時，distance 欄位正確計算
- [ ] GET /api/v1/realtime 回傳即時座位資料
- [ ] Contract tests 全部通過

**Phase 6 完成檢查**:
- [ ] Seat collector 每 10 分鐘執行一次
- [ ] seat_realtime 與 seat_history 正確同步
- [ ] Prediction trainer 每日 03:00 執行
- [ ] GET /api/v1/predict 回傳預測結果
- [ ] Fallback 邏輯正確運作

---

## 與其他團隊的交接點

### 交付給前端團隊

1. **Phase 2 完成後**:
   - 提供 API base URL 與 CORS 設定
   - 提供 OpenAPI 文件 URL（/docs）

2. **Phase 3 完成後**:
   - 通知前端可開始整合地圖功能
   - 提供 API endpoint 範例與 response schema
   - 提供測試資料庫的連線資訊（for mock data）

3. **Phase 4 完成後**:
   - 通知前端可實作列表排序
   - 說明 sort_by 參數使用方式

4. **Phase 6 完成後**:
   - 通知前端可實作預測顯示
   - 說明 fallback 機制與「估」badge 的顯示時機

### 需要前端團隊配合

1. **API 測試**:
   - 前端協助測試 API 在不同瀏覽器的相容性
   - 回報 API response 格式問題

2. **效能監控**:
   - 前端回報 API 回應時間異常

3. **錯誤回報**:
   - 前端回報未處理的 error cases

---

## 風險與應對

### 風險 1: 外部 API 不穩定
**情境**: 座位資料 API 經常失敗或回應慢
**應對**:
- 實作 T069（重試邏輯）
- 實作 T076（fallback 機制）
- 考慮增加 cache layer（Redis）

### 風險 2: 預測模型訓練耗時過長
**情境**: 單次訓練超過 1 小時
**應對**:
- 調整訓練資料範圍（從 90 天減少到 30 天）
- 使用較簡單的模型（例如：只用 Prophet）
- 將訓練改為背景任務（Celery）

### 風險 3: 資料庫連線池耗盡
**情境**: 高併發時連線數不足
**應對**:
- 調整 connection pool size（T021）
- 實作 connection timeout 與 retry
- 監控資料庫連線數

### 風險 4: Scheduler 任務互相干擾
**情境**: 多個排程任務同時執行，影響效能
**應對**:
- 設定不同的執行時間（02:00 library sync, 03:00 training）
- 使用 APScheduler 的 `max_instances=1` 防止重複執行
- 監控任務執行時間

---

## 備註

- **API 版本控制**: 使用 `/api/v1/` prefix，未來升級時保持向後相容
- **錯誤處理**: 統一使用 HTTPException，status code 符合 RESTful 慣例
- **日誌**: 所有外部 API 呼叫都記錄 request/response
- **測試**: 優先撰寫 contract tests，確保 API 合約穩定
- **文件**: 使用 FastAPI 自動生成的 OpenAPI 文件（/docs）

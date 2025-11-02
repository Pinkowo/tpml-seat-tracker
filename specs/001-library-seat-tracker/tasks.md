# 任務清單：圖書館座位地圖與預測系統

**輸入**: 來自 `/specs/001-library-seat-tracker/` 的設計文件
**前置條件**: plan.md, spec.md, research.md, data-model.md, contracts/

**組織方式**: 任務依 User Story 分組，讓每個 Story 都能獨立實作與測試。

## 格式: `[ID] [P?] [Story] 描述`

- **[P]**: 可平行執行（不同檔案、無依賴關係）
- **[Story]**: 此任務屬於哪個 User Story（例如 US1, US2, US3）
- 描述中包含確切的檔案路徑

## 路徑慣例

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- **Tests**: `backend/tests/`, `frontend/tests/`

---

## Phase 1: 專案設置（共享基礎設施）

**目的**: 專案初始化與基本結構

### 1.1 儲存庫結構

- [ ] T001 [P] 建立 backend 目錄結構 (backend/src/{api,models,services,db}/)
- [ ] T002 [P] 建立 frontend 目錄結構 (frontend/src/{components,pages,store,services,hooks,types}/)
- [ ] T003 [P] 建立 docker-compose.yml，包含 PostgreSQL 15 服務定義
- [ ] T004 [P] 建立 backend/.env.example，包含必要的環境變數
- [ ] T005 [P] 建立 frontend/.env.example，包含 Mapbox token 佔位符

### 1.2 Backend 初始化

- [ ] T006 在 backend/ 使用 uv 初始化 Python 3.12 專案，包含 pyproject.toml
- [ ] T007 使用 uv 在 backend/pyproject.toml 安裝 FastAPI, SQLAlchemy, Alembic, APScheduler, httpx 依賴項
- [ ] T008 在 backend/alembic.ini 初始化 Alembic 設定
- [ ] T009 [P] 建立 backend/src/main.py，包含 FastAPI app 初始化
- [ ] T010 [P] 在 backend/pyproject.toml 設定 Ruff linter 與 formatter

### 1.3 Frontend 初始化

- [ ] T011 在 frontend/ 初始化 Vite + React + TypeScript 專案
- [ ] T012 在 frontend/package.json 安裝依賴項: Mapbox GL JS, React Query, @reduxjs/toolkit react-redux, Tailwind CSS
- [ ] T012a [P] 在 frontend/src/index.html 引入 Town Pass 設計系統
  - **設計規範**: 引入 `specs/design/design-tokens.css` 到專案
  - **用途**: 提供完整的 Town Pass 色彩系統、字體、間距等 CSS 變數
  - **文件**: 參考 `specs/design/README.md` 了解如何使用設計變數
- [ ] T013 [P] 在 frontend/tailwind.config.js 設定 Tailwind CSS
  - **設計規範**: 擴展 Tailwind 設定以使用 Town Pass 色彩系統
  - **主色**: Primary `#5AB4C5`, Secondary `#F5BA4B`
  - **座位狀態色**: Available `#76A732`, Full `#ADB8BE`
- [ ] T014 [P] 在 frontend/tsconfig.json 設定 TypeScript strict mode
- [ ] T015 [P] 在 frontend/ 設定 ESLint 與 Prettier

### 1.4 測試基礎設施

- [ ] T015a [P] 在 backend/pyproject.toml 安裝 pytest 與 pytest-asyncio
- [ ] T015b [P] 在 frontend/package.json 安裝 Vitest 與 @testing-library/react
- [ ] T015c [P] 建立 backend/tests/ 目錄結構 (unit/, integration/, contract/, conftest.py)
- [ ] T015d [P] 建立 frontend/tests/ 目錄結構 (unit/, integration/, setup.ts)
- [ ] T015e [P] 在 backend/ 設定 pytest.ini
- [ ] T015f [P] 在 frontend/ 設定 vitest.config.ts

---

## Phase 2: 基礎建設（阻塞性前置條件）

**目的**: 核心基礎設施，必須在任何 User Story 實作前完成

**⚠️ 關鍵**: 此階段完成前，無法開始任何 User Story 工作

### 2.1 資料庫層

- [ ] T016 在 backend/alembic/versions/001_create_library_info.py 建立 library_info 資料表的 migration script
- [ ] T017 在 backend/alembic/versions/002_create_seat_realtime.py 建立 seat_realtime 資料表的 migration script
- [ ] T018 在 backend/alembic/versions/003_create_seat_history.py 建立 seat_history 資料表的 migration script
- [ ] T019 在 backend/alembic/versions/004_create_prediction_results.py 建立 prediction_results 資料表的 migration script
- [ ] T020 在 backend/alembic/versions/005_create_model_registry.py 建立 model_registry 資料表的 migration script
- [ ] T021 在 backend/src/db/connection.py 建立資料庫連線池設定
- [ ] T022 在 backend/src/db/session.py 建立 async session factory，包含 context manager

### 2.2 Backend 核心架構

- [ ] T023 [P] 在 backend/src/main.py 建立 FastAPI middleware，處理 CORS 與 request logging
- [ ] T024 [P] 在 backend/src/api/exceptions.py 建立 HTTP 錯誤的 exception handlers
- [ ] T025 [P] 在 backend/src/api/dependencies.py 建立資料庫 session 的 dependency injection
- [ ] T026 [P] 在 backend/src/api/schemas.py 建立常用回應模式的 base Pydantic schemas
- [ ] T027 [P] 在 backend/src/services/logger.py 使用 loguru 設定結構化日誌
- [ ] T028 [P] 在 backend/src/config.py 使用 pydantic-settings 建立環境設定

### 2.3 Frontend 核心架構

- [ ] T029 [P] 在 frontend/src/App.tsx 建立 App.tsx，包含 React Router 設定
- [ ] T030 [P] 在 frontend/src/store/index.ts 使用 Redux Toolkit 建立 Redux store 設定
- [ ] T031 [P] 在 frontend/src/main.tsx 建立 React Query provider 設定
- [ ] T032 [P] 在 frontend/src/services/api.ts 建立 axios instance，包含 base URL 設定
- [ ] T033 [P] 在 frontend/src/types/api.ts 建立 API 回應的 TypeScript types
- [ ] T034 [P] 在 frontend/src/components/ErrorBoundary.tsx 建立 error boundary component

**檢查點**: 基礎建設完成 - 現在可以開始平行實作 User Story

---

## Phase 3: User Story 1 - 快速查找附近有空位的圖書館 (優先度: P1) 🎯 MVP

**目標**: 使用者能在地圖上查看所有圖書館標記，點擊標記查看詳細資訊並取得導航連結

**獨立測試**: 使用者打開應用程式，查看地圖上各館別的座位狀態標記，選擇最近的有空位館別並取得導航資訊。這個流程本身就能提供完整的使用者價值。

### 3.1 Backend - Library 與 Realtime 資料

- [ ] T035 [P] [US1] 在 backend/src/models/library.py 建立 Library SQLAlchemy model
- [ ] T036 [P] [US1] 在 backend/src/models/seat.py 建立 SeatRealtime SQLAlchemy model
- [ ] T037 [P] [US1] 在 backend/src/services/distance.py 建立距離計算服務，使用 Haversine formula
- [ ] T038 [US1] 在 backend/src/api/routes/libraries.py 建立 GET /api/v1/libraries endpoint，包含距離排序
- [ ] T039 [US1] 在 backend/src/api/routes/realtime.py 建立 GET /api/v1/realtime endpoint，回傳所有圖書館與座位資料
- [ ] T040 [US1] 在 backend/src/api/schemas.py 建立 Library 與 RealtimeSeat 回應的 Pydantic schemas

### 3.2 Frontend - 地圖元件

- [ ] T041 [P] [US1] 在 frontend/src/hooks/useGeolocation.ts 建立 useGeolocation hook，取得使用者位置
- [ ] T042 [P] [US1] 在 frontend/src/types/library.ts 建立 Library 與 SeatStatus 的 TypeScript types
- [ ] T043 [US1] 在 frontend/src/components/map/MapView.tsx 建立 Mapbox 地圖初始化元件
  - **設計規範**: 參考 `specs/design/components.md` - 地圖區域規格
- [ ] T044 [US1] 在 frontend/src/components/map/MarkerLayer.tsx 建立標記渲染，包含顏色邏輯（綠/灰/白）
  - **設計規範**: 參考 `specs/design/components.md` - 地圖標記 (Map Marker)
  - **顏色**: 有空位 `#76A732` (Green/500) / 座位已滿 `#ADB8BE` (Grey/300) / 無資料 `#FFFFFF` + 邊框 `#91A0A8` (Grey/400)
  - **尺寸**: 40x40px，Active 狀態 48x48px，完全圓形
  - **陰影**: `0 4px 12px rgba(0, 0, 0, 0.15)`
  - **互動**: 點擊時 `scale(1.2)`，觸覺回饋
- [ ] T045 [P] [US1] 在 frontend/src/components/info-footer/InfoFooter.tsx 建立資訊頁尾元件，包含圖例
  - **設計規範**: 參考 `specs/design/README.md` - 底部滑動面板規格
- [ ] T046 [US1] 在 frontend/src/components/library-detail/LibraryDetail.tsx 建立圖書館詳細資訊 modal，包含座位資訊與導航
  - **設計規範**: 參考 `specs/design/components.md` - 詳細資訊頁面 (Detail Page)
  - **頂部**: 彩色頂部區塊使用主色 `#5AB4C5` (Primary/500)
  - **座位卡片**: 浮起效果，超大字體 48px/Bold 顯示座位數
  - **按鈕**: 導航按鈕使用 `specs/design/components.md` - 導航按鈕規格
- [ ] T047 [P] [US1] 在 frontend/src/hooks/useLibraryData.ts 使用 React Query 建立 useLibraryData hook
- [ ] T048 [US1] 在 frontend/src/pages/HomePage.tsx 整合地圖與資訊頁尾

### 3.3 測試 (US1)

- [ ] T048a [P] [US1] 在 backend/tests/conftest.py 建立資料庫 session 的 pytest fixtures
- [ ] T048b [P] [US1] 在 backend/tests/contract/test_libraries_contract.py 撰寫 GET /api/v1/libraries endpoint 的 contract tests
- [ ] T048c [P] [US1] 在 backend/tests/contract/test_realtime_contract.py 撰寫 GET /api/v1/realtime endpoint 的 contract tests
- [ ] T048d [P] [US1] 在 backend/tests/unit/services/test_distance.py 撰寫 Haversine 距離計算的 unit tests
- [ ] T048e [P] [US1] 在 frontend/tests/integration/test_map_markers.test.ts 使用 mock API 撰寫地圖標記渲染的 integration tests
- [ ] T048f [P] [US1] 在 frontend/tests/unit/hooks/test_useGeolocation.test.ts 撰寫 useGeolocation hook 的 unit tests

**檢查點**: 此時 User Story 1 應該完全可以獨立運作與測試

---

## Phase 4: User Story 2 - 透過列表排序快速比較館別 (優先度: P1)

**目標**: 使用者能透過右上角列表視窗快速比較所有圖書館，依距離或可用座位排序

**獨立測試**: 使用者開啟右上角列表視窗，切換「依距離」或「依可用座位」排序，點擊列項查看詳細資訊。測試完成後可驗證排序邏輯是否正確且資訊準確。

### 4.1 Backend - 增強排序功能

- [ ] T049 [US2] 在 backend/src/services/library_service.py 實作排序服務
- [ ] T050 [US2] 在 backend/src/api/routes/libraries.py 增強 GET /libraries endpoint，接受 user_lat/user_lng 查詢參數
- [ ] T051 [US2] 在 backend/src/api/routes/libraries.py 新增 sort_by 查詢參數（distance/seats），包含雙重排序邏輯

### 4.2 Frontend - 圖書館列表元件

- [ ] T052 [P] [US2] 在 frontend/src/components/library-list/LibraryList.tsx 建立可收合的圖書館列表容器
  - **設計規範**: 參考 `specs/design/components.md` - 底部滑動面板 (Bottom Sheet)
  - **狀態**: 收合 (120px) / 展開 (80vh) / 隱藏
  - **圓角**: 頂部圓角 24px (`border-radius: 24px 24px 0 0`)
  - **陰影**: `0 -4px 24px rgba(11, 13, 14, 0.12)`
  - **手勢**: 點擊手柄切換、上滑/下滑展開/收合、拖曳跟隨
- [ ] T052a [P] [US2] 在 frontend/src/components/library-list/LibraryCard.tsx 建立圖書館卡片元件
  - **設計規範**: 參考 `specs/design/components.md` - 圖書館卡片 (Library Card)
  - **圓角**: 16px
  - **內距**: 20px
  - **間距**: 卡片間 16px
  - **座位數字**: 可用座位 28px/Semibold，顏色 `#76A732` (有空位) 或 `#ADB8BE` (已滿)
  - **狀態標籤**: 圓角 12px，有空位用 `rgba(118, 167, 50, 0.1)` 背景
  - **Active 狀態**: `scale(0.98)`，背景 `#F1F3F4`
- [ ] T053 [P] [US2] 在 frontend/src/components/library-list/SortToggle.tsx 建立排序切換按鈕元件
  - **設計規範**: 參考 `specs/design/components.md` - 按鈕元件規格
  - **尺寸**: 最小觸控 48x48px
  - **顏色**: 使用主色 `#5AB4C5` (Primary/500)
- [ ] T054 [P] [US2] 在 frontend/src/components/library-list/LocationPrompt.tsx 建立位置權限提示 UI
  - **設計規範**: 參考 `specs/design/design-tokens.css` - 提醒色 `#FD853A` (Orange/500)
- [ ] T055 [P] [US2] 在 frontend/src/utils/format.ts 建立距離格式化工具（m vs km，1000m 臨界值）
- [ ] T056 [US2] 在 frontend/src/pages/HomePage.tsx 整合圖書館列表與地圖狀態同步

### 4.3 測試 (US2)

- [ ] T056a [P] [US2] 在 backend/tests/contract/test_libraries_sorting.py 撰寫 /libraries 排序參數的 contract tests
- [ ] T056b [P] [US2] 在 backend/tests/unit/services/test_library_service.py 撰寫雙重排序邏輯的 unit tests
- [ ] T056c [P] [US2] 在 frontend/tests/integration/test_library_list.test.ts 撰寫列表排序行為的 integration tests

**檢查點**: 此時 User Story 1 與 2 應該都能獨立運作

---

## Phase 5: User Story 3 - 查看開館倒數以規劃時間 (優先度: P2)

**目標**: 使用者能查看圖書館營業時間與閉館倒數，以規劃讀書時間

**獨立測試**: 使用者查看詳細視窗中的營業時間與倒數提示，驗證剩餘時間計算正確，且在 ≤60 分鐘與 ≤15 分鐘時顯示明顯提示。

### 5.1 Backend - 營業時間邏輯

- [ ] T057 [US3] 在 backend/src/services/opening_hours.py 建立營業時間計算服務
- [ ] T058 [US3] 在 backend/src/api/schemas.py 新增 is_open 與 closing_in_minutes 欄位到 Library schema
- [ ] T059 [US3] 在 backend/src/api/routes/libraries.py 增強 /libraries endpoint，包含計算後的營業狀態

### 5.2 Frontend - 營業時間顯示與倒數

- [ ] T060 [P] [US3] 在 frontend/src/components/library-detail/OpeningHours.tsx 建立營業時間顯示元件
  - **設計規範**: 參考 `specs/design/components.md` - 詳細資訊頁面的資訊列表
  - **圖示**: 使用 clock icon (24x24px)，顏色 `#5AB4C5` (Primary/500)
  - **字體**: 標籤 12px/Regular，內容 16px/Regular
- [ ] T061 [P] [US3] 在 frontend/src/components/library-detail/ClosingWarning.tsx 建立倒數警告元件（60min/15min 臨界值）
  - **設計規範**: 參考 `specs/design/design-tokens.css` - 語意化顏色
  - **60min警告**: 提醒色 `#FD853A` (Orange/500 - Reminder)
  - **15min警告**: 警告色 `#D45251` (Red/500 - Alarm)
  - **圓角**: 12px
  - **內距**: 12px 16px
- [ ] T062 [P] [US3] 在 frontend/src/components/library-detail/LibraryDetail.tsx 新增閉館狀態樣式（灰色背景）
  - **設計規範**: 閉館時使用禁用色 `#E3E7E9` (Grey/100 - Disable)
- [ ] T063 [US3] 在 frontend/src/components/library-detail/LibraryDetail.tsx 整合營業時間區塊到圖書館詳細資訊 modal

### 5.3 測試 (US3)

- [ ] T063a [P] [US3] 在 backend/tests/unit/services/test_opening_hours.py 撰寫營業時間計算的 unit tests
- [ ] T063b [P] [US3] 在 frontend/tests/integration/test_closing_warning.test.ts 撰寫倒數警告顯示的 integration tests

**檢查點**: User Story 1、2 與 3 現在應該都能獨立運作

---

## Phase 6: User Story 4 - 查看座位數預測以提前規劃 (優先度: P2)

**目標**: 使用者能查看未來 30 分鐘與 1 小時的座位預測，提前規劃

**獨立測試**: 系統定期擷取座位資料並訓練預測模型，前端呼叫 /predict API 取得未來 30 分鐘與 1 小時的預測座位數，驗證預測結果是否合理。

### 6.1 Backend - 預測資料模型

- [ ] T064 [P] [US4] 在 backend/src/models/seat.py 建立 SeatHistory SQLAlchemy model
- [ ] T065 [P] [US4] 在 backend/src/models/prediction.py 建立 PredictionResult SQLAlchemy model
- [ ] T066 [P] [US4] 在 backend/src/models/model_registry.py 建立 ModelRegistry SQLAlchemy model

### 6.2 Backend - 資料收集 (Task A)

- [ ] T067 [US4] 在 backend/src/services/seat_collector.py 建立座位資料收集服務，包含外部 API client
- [ ] T068 [US4] 在 backend/src/services/seat_collector.py 新增 batch_id 生成與雙資料表同步（realtime + history）
- [ ] T069 [US4] 在 backend/src/services/seat_collector.py 新增錯誤處理與重試邏輯（3 次重試，1 分鐘間隔）給外部 API（實作 FR-026：失敗時 1 分鐘間隔重試最多 3 次）
- [ ] T070 [US4] 在 backend/src/services/scheduler.py 建立 APScheduler job，每 10 分鐘收集座位資料

### 6.3 Backend - 預測訓練 (Task B)

- [ ] T071 [US4] 在 backend/src/services/prediction_trainer.py 建立預測訓練服務，使用 Prophet/RandomForest/LSTM
- [ ] T072 [US4] 在 backend/src/services/prediction_trainer.py 實作 Champion/Challenger 比較邏輯（MAPE ≥5% 改善）
- [ ] T073 [US4] 在 backend/src/services/scheduler.py 建立 APScheduler job，每日 03:00 訓練
- [ ] T074 [P] [US4] 在 backend/src/services/model_storage.py 建立模型持久化工具

### 6.4 Backend - 預測 Endpoint

- [ ] T075 [US4] 在 backend/src/api/routes/predict.py 建立 GET /api/v1/predict endpoint，包含 branch_name 參數
- [ ] T076 [US4] 在 backend/src/services/prediction_service.py 實作 fallback 邏輯（模型不可用時使用移動平均）
- [ ] T077 [US4] 在 backend/src/api/schemas.py 建立預測回應的 Pydantic schema（30m/60m 預測時間點）

### 6.5 Frontend - 預測顯示

- [ ] T078 [P] [US4] 在 frontend/src/components/library-detail/PredictionSection.tsx 建立圖書館詳細資訊 modal 的預測顯示區塊
  - **設計規範**: 參考 `specs/design/components.md` - 詳細資訊頁面的資訊卡片樣式
  - **標題**: 使用 H2 (24px/Semibold)
  - **預測數字**: 18px/Semibold，顏色依座位狀態 (`#76A732` 或 `#ADB8BE`)
  - **卡片**: 圓角 16px，內距 20px，陰影 `0 2px 8px rgba(11, 13, 14, 0.08)`
- [ ] T079 [P] [US4] 在 frontend/src/components/library-detail/FallbackBadge.tsx 建立 fallback「估」badge 元件
  - **設計規範**: 參考 `specs/design/components.md` - 狀態標籤
  - **背景**: 次要色淡化 `rgba(245, 186, 75, 0.1)` (Secondary/500 alpha 0.1)
  - **文字**: 次要色 `#F5BA4B` (Secondary/500)
  - **圓角**: 12px
  - **內距**: 4px 12px
  - **字體**: 12px/Semibold
- [ ] T080 [P] [US4] 在 frontend/src/hooks/usePredictions.ts 使用 React Query 建立 usePredictions hook
- [ ] T081 [P] [US4] 在 frontend/src/types/prediction.ts 新增預測的 TypeScript types

### 6.6 測試 (US4)

- [ ] T081a [P] [US4] 在 backend/tests/contract/test_predict_contract.py 撰寫 GET /api/v1/predict endpoint 的 contract tests
- [ ] T081b [P] [US4] 在 backend/tests/unit/services/test_seat_collector.py 使用外部 API mocks 撰寫座位收集器的 unit tests
- [ ] T081c [P] [US4] 在 backend/tests/unit/services/test_prediction_trainer.py 撰寫預測訓練器（Champion/Challenger）的 unit tests
- [ ] T081d [P] [US4] 在 backend/tests/unit/services/test_prediction_service.py 撰寫 fallback 邏輯（移動平均）的 unit tests
- [ ] T081e [US4] 在 backend/tests/integration/test_prediction_flow.py 撰寫預測資料流的 integration tests

**檢查點**: User Story 1-4 現在應該都能獨立運作

---

## Phase 7: User Story 5 - 自動更新資料以確保資訊即時性 (優先度: P3)

**目標**: 系統定期更新座位資料，確保使用者看到的資訊不超過 10 分鐘

**獨立測試**: 驗證伺服器端每 10 分鐘擷取外部 API，前端每 10 分鐘重新拉取 /realtime 與 /predict，資料時間戳正確更新。

### 7.1 Backend - 排程任務

- [ ] T082 [US5] 在 backend/src/main.py 的 FastAPI startup event 初始化 APScheduler
- [ ] T083 [US5] 在 backend/src/services/library_sync.py 建立圖書館 metadata 同步服務（Task C）
- [ ] T084 [US5] 在 backend/src/services/scheduler.py 建立 APScheduler job，每日 02:00 同步圖書館資料
- [ ] T085 [P] [US5] 在 backend/src/services/retry.py 新增完整的重試邏輯，1 分鐘間隔（最多 3 次嘗試）

### 7.2 Frontend - 輪詢與刷新邏輯

- [ ] T086 [P] [US5] 在 frontend/src/main.tsx 設定 React Query，10 分鐘重新拉取間隔
- [ ] T087 [P] [US5] 在 frontend/src/hooks/useVisibilityRefresh.ts 實作 Page Visibility API 整合，當頁面隱藏時暫停輪詢
- [ ] T088 [P] [US5] 在 frontend/src/components/RefreshButton.tsx 建立手動刷新按鈕元件
  - **設計規範**: 參考 `specs/design/components.md` - 按鈕元件
  - **尺寸**: 48x48px 圓形按鈕
  - **背景**: 主色 `#5AB4C5` (Primary/500)
  - **圖示**: 刷新 icon，白色
  - **Active 狀態**: `scale(0.92)`，背景變深 `#468D9B` (Primary/600)
- [ ] T089 [P] [US5] 在 frontend/src/components/StaleDataWarning.tsx 建立過期資料警告（15min 臨界值）（實作 FR-032：資料過期提示）
  - **設計規範**: 參考 `specs/design/design-tokens.css` - 提醒色
  - **背景**: 提醒色淡化 `rgba(253, 133, 58, 0.1)` (Orange/500 alpha 0.1)
  - **文字**: 提醒色 `#FD853A` (Orange/500)
  - **圓角**: 12px
  - **內距**: 12px 16px
- [ ] T090 [US5] 在 frontend/src/components/library-list/LibraryList.tsx 新增載入狀態與樂觀更新到圖書館列表

### 7.3 測試 (US5)

- [ ] T090a [P] [US5] 在 frontend/tests/integration/test_polling.test.ts 撰寫 10 分鐘輪詢行為的 integration tests
- [ ] T090b [P] [US5] 在 frontend/tests/unit/hooks/test_useVisibilityRefresh.test.ts 撰寫 Page Visibility API 整合的 unit tests
- [ ] T090c [US5] 在 backend/tests/integration/test_scheduler.py 撰寫 APScheduler jobs 的 integration tests

**檢查點**: 所有 User Story 現在應該都能獨立運作

---

## Phase 8: 最佳化與跨領域關注點

**目的**: 影響多個 User Story 的改進

### 8.1 API 健康檢查與文件

- [ ] T091 [P] 在 backend/src/api/routes/health.py 建立 GET /api/v1/health endpoint，包含資料庫檢查
- [ ] T092 [P] 在 backend/src/main.py 設定 FastAPI OpenAPI 文件 metadata
- [ ] T093 [P] 在 backend/src/api/routes/ 新增 API endpoint 描述與範例

### 8.2 錯誤監控與效能

- [ ] T094 [P] 在 backend/src/main.py 新增 request duration metrics middleware
- [ ] T095 [P] 在 backend/src/services/error_tracking.py 設定錯誤追蹤整合點
- [ ] T096 [P] 在 backend/alembic/versions/006_add_indexes.py 新增資料庫查詢最佳化索引
- [ ] T097 [P] 在 frontend/src/services/errorLogger.ts 實作前端錯誤日誌服務

### 8.3 測試與驗證

- [ ] T098 [P] 在 frontend/src/components/map/ 新增 ARIA labels 到地圖標記與互動元素
- [ ] T099 [P] 在 frontend/src/components/ 新增鍵盤導航支援（Tab 順序，Enter 觸發）
- [ ] T100 [P] 在 frontend/src/components/map/MarkerLayer.tsx 驗證色盲友善設計（綠/灰/白組合）

### 8.4 部署與文件

- [ ] T101 [P] 在 backend/Dockerfile 建立 backend 的 Dockerfile，使用 multi-stage build
- [ ] T102 [P] 在 frontend/Dockerfile 建立 frontend 的 Dockerfile，使用 nginx
- [ ] T103 [P] 在 backend/Dockerfile 與 frontend/Dockerfile 使用 layer caching 最佳化 Docker images
- [ ] T104 [P] 在 README.md 建立完整的 README，包含快速入門指南
- [ ] T105 [P] 在 specs/001-library-seat-tracker/quickstart.md 驗證 quickstart.md 設置說明

---

## 依賴關係與執行順序

### Phase 依賴關係

- **Setup (Phase 1)**: 無依賴 - 可立即開始
- **Foundational (Phase 2)**: 依賴 Setup 完成 - 阻塞所有 User Story
- **User Stories (Phase 3-7)**: 全部依賴 Foundational phase 完成
  - User Story 之後可以平行進行（如果有人力）
  - 或按優先順序依序進行（P1 → P1 → P2 → P2 → P3）
- **Polish (Phase 8)**: 依賴所有想要的 User Story 完成

### User Story 依賴關係

- **User Story 1 (P1)**: 可在 Foundational (Phase 2) 後開始 - 不依賴其他 Story
- **User Story 2 (P1)**: 可在 US1 backend endpoints (T038-T040) 後開始 - 增強 /libraries endpoint
- **User Story 3 (P2)**: 可在 US1 後開始 - 增強圖書館詳細資訊 modal
- **User Story 4 (P2)**: 可在 Foundational (Phase 2) 後開始 - 獨立於 US1-US3，需要所有資料表
- **User Story 5 (P3)**: 可在 US4 後開始 - 依賴所有 backend 服務（Task A/B/C）已實作

### 每個 User Story 內部

- Models 在 services 之前
- Services 在 endpoints 之前
- Backend endpoints 在 frontend components 之前
- 核心元件在整合之前
- Story 完成後再移到下個優先度

### 平行執行機會

- 所有標記 [P] 的 Setup 任務可以平行執行
- 所有標記 [P] 的 Foundational 任務可以平行執行（在 Phase 2 內）
- Foundational phase 完成後，US1 與 US4 可以平行開始（獨立的資料模型）
- US1 backend 完成後，US2 與 US3 可以平行開始
- User Story 的所有標記 [P] 的測試可以平行執行
- Story 內標記 [P] 的 models 可以平行執行
- 不同 User Story 可以由不同團隊成員平行進行

---

## 平行執行範例：User Story 1

```bash
# Backend: 一起啟動所有 models:
Task: T035 "建立 Library model"
Task: T036 "建立 SeatRealtime model"
Task: T037 "建立距離服務"

# Frontend: 一起啟動 hooks 與 types:
Task: T041 "建立 useGeolocation hook"
Task: T042 "建立 TypeScript types"

# Frontend: 一起啟動 UI 元件:
Task: T045 "建立資訊頁尾元件"
Task: T047 "建立 useLibraryData hook"
```

---

## 實作策略

### 優先 MVP（僅 User Story 1 + 2）

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（關鍵 - 阻塞所有 Story）
3. 完成 Phase 3: User Story 1
4. 完成 Phase 4: User Story 2
5. **停止並驗證**: 獨立測試 US1 與 US2
6. 部署/展示 MVP，包含核心地圖 + 列表功能

**MVP 範圍**: 地圖顯示座位狀態 + 列表排序比較 = 核心價值

### 漸進式交付

1. 完成 Setup + Foundational → 基礎建設完成
2. 新增 User Story 1 → 獨立測試 → 部署（地圖查找）
3. 新增 User Story 2 → 獨立測試 → 部署（列表排序）
4. 新增 User Story 3 → 獨立測試 → 部署（開館倒數）
5. 新增 User Story 4 → 獨立測試 → 部署（座位預測）
6. 新增 User Story 5 → 獨立測試 → 部署（自動更新）
7. 每個 Story 都增加價值，不會破壞先前的 Story

### 平行團隊策略

多位開發者的情況：

1. 團隊一起完成 Setup + Foundational
2. Foundational 完成後：
   - **Developer A**: User Story 1 (P1 - 地圖)
   - **Developer B**: User Story 4 (P2 - 預測) - 獨立資料模型，可平行開發
   - **Developer C**: User Story 2 (P1 - 列表) - 等 A 完成 US1 backend
3. US1/US2 完成後：
   - **Developer A**: User Story 3 (P2 - 倒數)
   - **Developer B**: User Story 5 (P3 - 輪詢)
4. Story 完成並獨立整合

---

## 備註

- **[P] 任務**: 不同檔案、無依賴 - 可以平行執行
- **[Story] 標籤**: 將任務對應到特定 User Story，以便追蹤
- **檔案路徑**: 所有路徑都相對於儲存庫根目錄
- **預估總數**: 8 個 phases 共 130 個任務
- **關鍵阻塞**: Phase 2 必須在任何 User Story 實作前完成
- **MVP 定義**: Phase 3 + Phase 4 完成 = 最小可部署產品（地圖 + 列表）
- **檢查點策略**: 每個 User Story phase 後停下來獨立驗證
- **避免**: 模糊的任務、相同檔案衝突、破壞獨立性的跨 Story 依賴
- **Commit 策略**: 每個任務或邏輯群組後 commit
- **Rollback 策略**: 每個 phase 都透過 Alembic migrations 有獨立的 rollback 點

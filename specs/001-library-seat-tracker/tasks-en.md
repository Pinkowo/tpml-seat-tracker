# Tasks: 圖書館座位地圖與預測系統

**Input**: Design documents from `/specs/001-library-seat-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- **Tests**: `backend/tests/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

### 1.1 Repository Structure

- [ ] T001 [P] Create backend directory structure (backend/src/{api,models,services,db}/)
- [ ] T002 [P] Create frontend directory structure (frontend/src/{components,pages,store,services,hooks,types}/)
- [ ] T003 [P] Create docker-compose.yml with PostgreSQL 15 service definition
- [ ] T004 [P] Create backend/.env.example with required environment variables
- [ ] T005 [P] Create frontend/.env.example with Mapbox token placeholder

### 1.2 Backend Initialization

- [ ] T006 Initialize Python 3.12 project with pyproject.toml in backend/
- [ ] T007 Install FastAPI, SQLAlchemy, Alembic, APScheduler, httpx dependencies in backend/pyproject.toml
- [ ] T008 Initialize Alembic configuration in backend/alembic.ini
- [ ] T009 [P] Create backend/src/main.py with FastAPI app initialization
- [ ] T010 [P] Configure Ruff linter and formatter in backend/pyproject.toml

### 1.3 Frontend Initialization

- [ ] T011 Initialize Vite + React + TypeScript project in frontend/
- [ ] T012 Install dependencies: Mapbox GL JS, React Query, @reduxjs/toolkit react-redux, Tailwind CSS in frontend/package.json
- [ ] T013 [P] Configure Tailwind CSS in frontend/tailwind.config.js
- [ ] T014 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [ ] T015 [P] Configure ESLint and Prettier in frontend/

### 1.4 Testing Infrastructure

- [ ] T015a [P] Install pytest and pytest-asyncio in backend/pyproject.toml
- [ ] T015b [P] Install Vitest and @testing-library/react in frontend/package.json
- [ ] T015c [P] Create backend/tests/ directory structure (unit/, integration/, contract/, conftest.py)
- [ ] T015d [P] Create frontend/tests/ directory structure (unit/, integration/, setup.ts)
- [ ] T015e [P] Configure pytest.ini in backend/
- [ ] T015f [P] Configure vitest.config.ts in frontend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 2.1 Database Layer

- [ ] T016 Create migration script for library_info table in backend/alembic/versions/001_create_library_info.py
- [ ] T017 Create migration script for seat_realtime table in backend/alembic/versions/002_create_seat_realtime.py
- [ ] T018 Create migration script for seat_history table in backend/alembic/versions/003_create_seat_history.py
- [ ] T019 Create migration script for prediction_results table in backend/alembic/versions/004_create_prediction_results.py
- [ ] T020 Create migration script for model_registry table in backend/alembic/versions/005_create_model_registry.py
- [ ] T021 Create database connection pool configuration in backend/src/db/connection.py
- [ ] T022 Create async session factory with context manager in backend/src/db/session.py

### 2.2 Backend Core Structure

- [ ] T023 [P] Create FastAPI middleware for CORS and request logging in backend/src/main.py
- [ ] T024 [P] Create exception handlers for HTTP errors in backend/src/api/exceptions.py
- [ ] T025 [P] Create dependency injection for database sessions in backend/src/api/dependencies.py
- [ ] T026 [P] Create base Pydantic schemas for common response patterns in backend/src/api/schemas.py
- [ ] T027 [P] Configure structured logging with loguru in backend/src/services/logger.py
- [ ] T028 [P] Create environment configuration with pydantic-settings in backend/src/config.py

### 2.3 Frontend Core Structure

- [ ] T029 [P] Create App.tsx with React Router setup in frontend/src/App.tsx
- [ ] T030 [P] Create Redux store configuration with Redux Toolkit in frontend/src/store/index.ts
- [ ] T031 [P] Create React Query provider configuration in frontend/src/main.tsx
- [ ] T032 [P] Create axios instance with base URL configuration in frontend/src/services/api.ts
- [ ] T033 [P] Create TypeScript types for API responses in frontend/src/types/api.ts
- [ ] T034 [P] Create error boundary component in frontend/src/components/ErrorBoundary.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 快速查找附近有空位的圖書館 (Priority: P1) 🎯 MVP

**Goal**: 使用者能在地圖上查看所有圖書館標記，點擊標記查看詳細資訊並取得導航連結

**Independent Test**: 使用者打開應用程式，查看地圖上各館別的座位狀態標記，選擇最近的有空位館別並取得導航資訊。這個流程本身就能提供完整的使用者價值。

### 3.1 Backend - Library & Realtime Data

- [ ] T035 [P] [US1] Create Library SQLAlchemy model in backend/src/models/library.py
- [ ] T036 [P] [US1] Create SeatRealtime SQLAlchemy model in backend/src/models/seat.py
- [ ] T037 [P] [US1] Create distance calculation service with Haversine formula in backend/src/services/distance.py
- [ ] T038 [US1] Create GET /api/v1/libraries endpoint with distance sorting in backend/src/api/routes/libraries.py
- [ ] T039 [US1] Create GET /api/v1/realtime endpoint returning all libraries with seat data in backend/src/api/routes/realtime.py
- [ ] T040 [US1] Create Pydantic schemas for Library and RealtimeSeat responses in backend/src/api/schemas.py

### 3.2 Frontend - Map Component

- [ ] T041 [P] [US1] Create useGeolocation hook for user location in frontend/src/hooks/useGeolocation.ts
- [ ] T042 [P] [US1] Create TypeScript types for Library and SeatStatus in frontend/src/types/library.ts
- [ ] T043 [US1] Create Mapbox map initialization component in frontend/src/components/map/MapView.tsx
- [ ] T044 [US1] Create marker rendering with color logic (green/yellow/gray/white) in frontend/src/components/map/MarkerLayer.tsx
- [ ] T045 [P] [US1] Create info footer component with legend in frontend/src/components/info-footer/InfoFooter.tsx
- [ ] T046 [US1] Create library detail modal with seat info and navigation in frontend/src/components/library-detail/LibraryDetail.tsx
- [ ] T047 [P] [US1] Create useLibraryData hook with React Query in frontend/src/hooks/useLibraryData.ts
- [ ] T048 [US1] Integrate map and info footer in HomePage.tsx in frontend/src/pages/HomePage.tsx

### 3.3 Testing (US1)

- [ ] T048a [P] [US1] Create pytest fixtures for database session in backend/tests/conftest.py
- [ ] T048b [P] [US1] Write contract tests for GET /api/v1/libraries endpoint in backend/tests/contract/test_libraries_contract.py
- [ ] T048c [P] [US1] Write contract tests for GET /api/v1/realtime endpoint in backend/tests/contract/test_realtime_contract.py
- [ ] T048d [P] [US1] Write unit tests for Haversine distance calculation in backend/tests/unit/services/test_distance.py
- [ ] T048e [P] [US1] Write integration tests for map marker rendering with mock API in frontend/tests/integration/test_map_markers.test.ts
- [ ] T048f [P] [US1] Write unit tests for useGeolocation hook in frontend/tests/unit/hooks/test_useGeolocation.test.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 透過列表排序快速比較館別 (Priority: P1)

**Goal**: 使用者能透過右上角列表視窗快速比較所有圖書館，依距離或可用座位排序

**Independent Test**: 使用者開啟右上角列表視窗，切換「依距離」或「依可用座位」排序，點擊列項查看詳細資訊。測試完成後可驗證排序邏輯是否正確且資訊準確。

### 4.1 Backend - Enhanced Sorting

- [ ] T049 [US2] Implement sorting service in backend/src/services/library_service.py
- [ ] T050 [US2] Enhance GET /libraries endpoint to accept user_lat/user_lng query parameters in backend/src/api/routes/libraries.py
- [ ] T051 [US2] Add sort_by query parameter (distance/seats) with dual sorting logic in backend/src/api/routes/libraries.py

### 4.2 Frontend - Library List Component

- [ ] T052 [P] [US2] Create collapsible library list container in frontend/src/components/library-list/LibraryList.tsx
- [ ] T053 [P] [US2] Create sort toggle button component in frontend/src/components/library-list/SortToggle.tsx
- [ ] T054 [P] [US2] Create location permission prompt UI in frontend/src/components/library-list/LocationPrompt.tsx
- [ ] T055 [P] [US2] Create distance formatting utility (m vs km, 1000m threshold) in frontend/src/utils/format.ts
- [ ] T056 [US2] Integrate library list with map state sync in frontend/src/pages/HomePage.tsx

### 4.3 Testing (US2)

- [ ] T056a [P] [US2] Write contract tests for /libraries sorting parameters in backend/tests/contract/test_libraries_sorting.py
- [ ] T056b [P] [US2] Write unit tests for dual sorting logic in backend/tests/unit/services/test_library_service.py
- [ ] T056c [P] [US2] Write integration tests for list sorting behavior in frontend/tests/integration/test_library_list.test.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 查看開館倒數以規劃時間 (Priority: P2)

**Goal**: 使用者能查看圖書館營業時間與閉館倒數，以規劃讀書時間

**Independent Test**: 使用者查看詳細視窗中的營業時間與倒數提示，驗證剩餘時間計算正確，且在 ≤60 分鐘與 ≤15 分鐘時顯示明顯提示。

### 5.1 Backend - Opening Hours Logic

- [ ] T057 [US3] Create opening hours calculation service in backend/src/services/opening_hours.py
- [ ] T058 [US3] Add is_open and closing_in_minutes fields to Library schema in backend/src/api/schemas.py
- [ ] T059 [US3] Enhance /libraries endpoint to include calculated opening status in backend/src/api/routes/libraries.py

### 5.2 Frontend - Hours Display & Countdown

- [ ] T060 [P] [US3] Create opening hours display component in frontend/src/components/library-detail/OpeningHours.tsx
- [ ] T061 [P] [US3] Create countdown warning component (60min/15min thresholds) in frontend/src/components/library-detail/ClosingWarning.tsx
- [ ] T062 [P] [US3] Add closed state styling (gray background) in frontend/src/components/library-detail/LibraryDetail.tsx
- [ ] T063 [US3] Integrate opening hours section in library detail modal in frontend/src/components/library-detail/LibraryDetail.tsx

### 5.3 Testing (US3)

- [ ] T063a [P] [US3] Write unit tests for opening hours calculation in backend/tests/unit/services/test_opening_hours.py
- [ ] T063b [P] [US3] Write integration tests for countdown warning display in frontend/tests/integration/test_closing_warning.test.ts

**Checkpoint**: User Stories 1, 2, AND 3 should all be independently functional

---

## Phase 6: User Story 4 - 查看座位數預測以提前規劃 (Priority: P2)

**Goal**: 使用者能查看未來 30 分鐘與 1 小時的座位預測，提前規劃

**Independent Test**: 系統定期擷取座位資料並訓練預測模型，前端呼叫 /predict API 取得未來 30 分鐘與 1 小時的預測座位數，驗證預測結果是否合理。

### 6.1 Backend - Prediction Data Models

- [ ] T064 [P] [US4] Create SeatHistory SQLAlchemy model in backend/src/models/seat.py
- [ ] T065 [P] [US4] Create PredictionResult SQLAlchemy model in backend/src/models/prediction.py
- [ ] T066 [P] [US4] Create ModelRegistry SQLAlchemy model in backend/src/models/model_registry.py

### 6.2 Backend - Data Collection (Task A)

- [ ] T067 [US4] Create seat data collector service with external API client in backend/src/services/seat_collector.py
- [ ] T068 [US4] Add batch_id generation and dual-table sync (realtime + history) in backend/src/services/seat_collector.py
- [ ] T069 [US4] Add error handling and retry logic (3 retries, 1min interval) for external API in backend/src/services/seat_collector.py（實作 FR-026：失敗時 1 分鐘間隔重試最多 3 次）
- [ ] T070 [US4] Create APScheduler job for 10-minute seat collection in backend/src/services/scheduler.py

### 6.3 Backend - Prediction Training (Task B)

- [ ] T071 [US4] Create prediction trainer service with Prophet/RandomForest/LSTM in backend/src/services/prediction_trainer.py
- [ ] T072 [US4] Implement Champion/Challenger comparison logic (MAPE ≥5% improvement) in backend/src/services/prediction_trainer.py
- [ ] T073 [US4] Create APScheduler job for daily training at 03:00 in backend/src/services/scheduler.py
- [ ] T074 [P] [US4] Create model persistence utilities in backend/src/services/model_storage.py

### 6.4 Backend - Prediction Endpoint

- [ ] T075 [US4] Create GET /api/v1/predict endpoint with branch_name parameter in backend/src/api/routes/predict.py
- [ ] T076 [US4] Implement fallback logic (moving average) when model unavailable in backend/src/services/prediction_service.py
- [ ] T077 [US4] Create Pydantic schema for prediction response (30m/60m horizons) in backend/src/api/schemas.py

### 6.5 Frontend - Prediction Display

- [ ] T078 [P] [US4] Create prediction display section in library detail modal in frontend/src/components/library-detail/PredictionSection.tsx
- [ ] T079 [P] [US4] Create fallback "估" badge component in frontend/src/components/library-detail/FallbackBadge.tsx
- [ ] T080 [P] [US4] Create usePredictions hook with React Query in frontend/src/hooks/usePredictions.ts
- [ ] T081 [P] [US4] Add prediction TypeScript types in frontend/src/types/prediction.ts

### 6.6 Testing (US4)

- [ ] T081a [P] [US4] Write contract tests for GET /api/v1/predict endpoint in backend/tests/contract/test_predict_contract.py
- [ ] T081b [P] [US4] Write unit tests for seat collector with external API mocks in backend/tests/unit/services/test_seat_collector.py
- [ ] T081c [P] [US4] Write unit tests for prediction trainer (Champion/Challenger) in backend/tests/unit/services/test_prediction_trainer.py
- [ ] T081d [P] [US4] Write unit tests for fallback logic (moving average) in backend/tests/unit/services/test_prediction_service.py
- [ ] T081e [US4] Write integration tests for prediction data flow in backend/tests/integration/test_prediction_flow.py

**Checkpoint**: User Stories 1-4 should all be independently functional

---

## Phase 7: User Story 5 - 自動更新資料以確保資訊即時性 (Priority: P3)

**Goal**: 系統定期更新座位資料，確保使用者看到的資訊不超過 10 分鐘

**Independent Test**: 驗證伺服器端每 10 分鐘擷取外部 API，前端每 10 分鐘重新拉取 /realtime 與 /predict，資料時間戳正確更新。

### 7.1 Backend - Scheduled Tasks

- [ ] T082 [US5] Initialize APScheduler in FastAPI startup event in backend/src/main.py
- [ ] T083 [US5] Create library metadata sync service (Task C) in backend/src/services/library_sync.py
- [ ] T084 [US5] Create APScheduler job for daily library sync at 02:00 in backend/src/services/scheduler.py
- [ ] T085 [P] [US5] Add comprehensive retry logic with 1-minute interval (max 3 attempts) in backend/src/services/retry.py

### 7.2 Frontend - Polling & Refresh Logic

- [ ] T086 [P] [US5] Configure React Query with 10-minute refetch interval in frontend/src/main.tsx
- [ ] T087 [P] [US5] Implement Page Visibility API integration to pause polling when hidden in frontend/src/hooks/useVisibilityRefresh.ts
- [ ] T088 [P] [US5] Create manual refresh button component in frontend/src/components/RefreshButton.tsx
- [ ] T089 [P] [US5] Create stale data warning (15min threshold) in frontend/src/components/StaleDataWarning.tsx（實作 FR-032：資料過期提示）
- [ ] T090 [US5] Add loading states and optimistic updates to library list in frontend/src/components/library-list/LibraryList.tsx

### 7.3 Testing (US5)

- [ ] T090a [P] [US5] Write integration tests for 10-minute polling behavior in frontend/tests/integration/test_polling.test.ts
- [ ] T090b [P] [US5] Write unit tests for Page Visibility API integration in frontend/tests/unit/hooks/test_useVisibilityRefresh.test.ts
- [ ] T090c [US5] Write integration tests for APScheduler jobs in backend/tests/integration/test_scheduler.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### 8.1 API Health & Documentation

- [ ] T091 [P] Create GET /api/v1/health endpoint with database check in backend/src/api/routes/health.py
- [ ] T092 [P] Configure FastAPI OpenAPI documentation metadata in backend/src/main.py
- [ ] T093 [P] Add API endpoint descriptions and examples in backend/src/api/routes/

### 8.2 Error Monitoring & Performance

- [ ] T094 [P] Add request duration metrics middleware in backend/src/main.py
- [ ] T095 [P] Configure error tracking integration points in backend/src/services/error_tracking.py
- [ ] T096 [P] Add database query optimization indexes in backend/alembic/versions/006_add_indexes.py
- [ ] T097 [P] Implement frontend error logging service in frontend/src/services/errorLogger.ts

### 8.3 Testing & Validation

- [ ] T098 [P] Add ARIA labels to map markers and interactive elements in frontend/src/components/map/
- [ ] T099 [P] Add keyboard navigation support (Tab order, Enter triggers) in frontend/src/components/
- [ ] T100 [P] Validate color-blind friendly design (green/gray/white combinations) in frontend/src/components/map/MarkerLayer.tsx

### 8.4 Deployment & Documentation

- [ ] T101 [P] Create Dockerfile for backend with multi-stage build in backend/Dockerfile
- [ ] T102 [P] Create Dockerfile for frontend with nginx in frontend/Dockerfile
- [ ] T103 [P] Optimize Docker images with layer caching in backend/Dockerfile and frontend/Dockerfile
- [ ] T104 [P] Create comprehensive README with quickstart guide in README.md
- [ ] T105 [P] Validate quickstart.md setup instructions in specs/001-library-seat-tracker/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after US1 backend endpoints (T038-T040) - Enhances /libraries endpoint
- **User Story 3 (P2)**: Can start after US1 - Enhances library detail modal
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent of US1-US3, requires all tables
- **User Story 5 (P3)**: Can start after US4 - Depends on all backend services (Task A/B/C) being implemented

### Within Each User Story

- Models before services
- Services before endpoints
- Backend endpoints before frontend components
- Core components before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1 and US4 can start in parallel (independent data models)
- US2 and US3 can start in parallel after US1 backend is complete
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Backend: Launch all models together:
Task: T035 "Create Library model"
Task: T036 "Create SeatRealtime model"
Task: T037 "Create distance service"

# Frontend: Launch hooks and types together:
Task: T041 "Create useGeolocation hook"
Task: T042 "Create TypeScript types"

# Frontend: Launch UI components together:
Task: T045 "Create info footer component"
Task: T047 "Create useLibraryData hook"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo MVP with core map + list functionality

**MVP Scope**: 地圖顯示座位狀態 + 列表排序比較 = 核心價值

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (地圖查找)
3. Add User Story 2 → Test independently → Deploy (列表排序)
4. Add User Story 3 → Test independently → Deploy (開館倒數)
5. Add User Story 4 → Test independently → Deploy (座位預測)
6. Add User Story 5 → Test independently → Deploy (自動更新)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (P1 - 地圖)
   - **Developer B**: User Story 4 (P2 - 預測) - 獨立資料模型，可平行開發
   - **Developer C**: User Story 2 (P1 - 列表) - 等 A 完成 US1 backend
3. After US1/US2 complete:
   - **Developer A**: User Story 3 (P2 - 倒數)
   - **Developer B**: User Story 5 (P3 - 輪詢)
4. Stories complete and integrate independently

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **File paths**: All paths are relative to repository root
- **Estimated Total**: 130 tasks across 8 phases
- **Critical Blocker**: Phase 2 MUST complete before any user story implementation
- **MVP Definition**: Phase 3 + Phase 4 completion = minimum deployable product (map + list)
- **Checkpoint Strategy**: Stop after each user story phase to validate independently
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence
- **Commit Strategy**: Commit after each task or logical group
- **Rollback Strategy**: Each phase has independent rollback points via Alembic migrations

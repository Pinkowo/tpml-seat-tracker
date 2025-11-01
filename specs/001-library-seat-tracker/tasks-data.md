# 資料庫團隊任務清單

## 團隊資訊

- **負責範圍**: PostgreSQL 資料庫架構、migration scripts、ORM 模型、資料表索引
- **總任務數**: 15 個任務
- **預估工時**: 3-4 天（假設 1 位開發者）
- **技術棧**: PostgreSQL 15, SQLAlchemy, Alembic, Python 3.12

## ⚠️ 共享任務（需協調）

- **T003**: docker-compose.yml（需與後端團隊協調 PostgreSQL 服務定義）

## 依賴關係

### 阻塞其他團隊
- **阻塞後端團隊**: Phase 2.1（T016-T022）必須完成後，後端團隊才能開始實作 models 與 services
- **阻塞前端團隊**: 間接阻塞，前端需要後端 API，後端需要資料庫層

### 依賴其他團隊
- **依賴後端團隊**: T003 docker-compose.yml 需與後端協調
- **Phase 1 前置**: 需要 T008（Alembic 初始化）完成後才能建立 migration scripts

## 關鍵里程碑

1. **Milestone 1**: Phase 1 完成 → 資料庫容器啟動，Alembic 設定完成
2. **Milestone 2**: Phase 2.1 完成 → 所有資料表 migrations 建立完成（解除阻塞）
3. **Milestone 3**: Phase 3 完成 → US1 資料模型完成
4. **Milestone 4**: Phase 4 完成 → US4 預測相關資料模型完成
5. **Milestone 5**: Phase 5 完成 → 資料庫索引最佳化完成

---

## Phase 1: 資料庫設置（阻塞性任務）

**目標**: 建立 PostgreSQL 容器與 Alembic migration 基礎架構

**預估工時**: 2-3 小時

**⚠️ 關鍵**: 此階段必須完成，才能開始建立 migration scripts

### 任務清單

- [ ] T003 [P] 建立 docker-compose.yml，包含 PostgreSQL 15 服務定義 in docker-compose.yml
  - **協調**: 需與後端團隊確認服務名稱、port、環境變數
  - **檢查項目**:
    - PostgreSQL 15 image
    - 環境變數: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
    - Volume 掛載: ./postgres-data:/var/lib/postgresql/data
    - Port mapping: 5432:5432

---

## Phase 2: 資料庫層 - Migration Scripts（阻塞性任務）

**目標**: 建立所有資料表的 Alembic migration scripts 與資料庫連線設定

**預估工時**: 1-1.5 天

**⚠️ 關鍵**: 此階段完成前，後端團隊無法開始實作 SQLAlchemy models

**依賴**: T008（Alembic 初始化）必須由後端團隊完成

### 2.1 Migration Scripts（可平行執行）

- [ ] T016 建立 library_info 資料表的 migration script in backend/alembic/versions/001_create_library_info.py
  - **欄位**: library_id (PK), name, address, latitude, longitude, operating_hours (JSONB), created_at, updated_at
  - **索引**: PRIMARY KEY (library_id)

- [ ] T017 建立 seat_realtime 資料表的 migration script in backend/alembic/versions/002_create_seat_realtime.py
  - **欄位**: id (PK), library_id (FK), available_seats, total_seats, updated_at, batch_id
  - **索引**: PRIMARY KEY (id), FOREIGN KEY (library_id) REFERENCES library_info(library_id)
  - **約束**: UNIQUE (library_id)（每個圖書館只有一筆即時資料）

- [ ] T018 建立 seat_history 資料表的 migration script in backend/alembic/versions/003_create_seat_history.py
  - **欄位**: id (PK), library_id (FK), available_seats, total_seats, recorded_at, batch_id
  - **索引**: PRIMARY KEY (id), FOREIGN KEY (library_id) REFERENCES library_info(library_id), INDEX (library_id, recorded_at)

- [ ] T019 建立 prediction_results 資料表的 migration script in backend/alembic/versions/004_create_prediction_results.py
  - **欄位**: id (PK), library_id (FK), prediction_time, predicted_seats, horizon_minutes (30 or 60), model_version, created_at
  - **索引**: PRIMARY KEY (id), FOREIGN KEY (library_id) REFERENCES library_info(library_id), INDEX (library_id, prediction_time)

- [ ] T020 建立 model_registry 資料表的 migration script in backend/alembic/versions/005_create_model_registry.py
  - **欄位**: id (PK), library_id (FK), model_type (Prophet/RandomForest/LSTM), version, status (champion/challenger/archived), mape, created_at, activated_at
  - **索引**: PRIMARY KEY (id), FOREIGN KEY (library_id) REFERENCES library_info(library_id), INDEX (library_id, status)

### 2.2 連線池設定

- [ ] T021 建立資料庫連線池設定 in backend/src/db/connection.py
  - **設定項目**:
    - Connection pool size: 5-20
    - Max overflow: 10
    - Pool timeout: 30 seconds
    - Pool recycle: 3600 seconds
  - **環境變數**: DATABASE_URL

- [ ] T022 建立 async session factory，包含 context manager in backend/src/db/session.py
  - **實作**: AsyncSession with async context manager
  - **使用方式**: `async with get_db_session() as session:`

---

## Phase 3: 資料模型 - User Story 1

**目標**: 建立 US1（地圖查找）所需的 SQLAlchemy ORM 模型

**預估工時**: 4-6 小時

**⚠️ 依賴**: Phase 2.1（T016-T020 migration scripts）必須完成

### 任務清單（可平行執行）

- [ ] T035 [P] [US1] 建立 Library SQLAlchemy model in backend/src/models/library.py
  - **對應資料表**: library_info
  - **欄位映射**: 對應 T016 建立的 library_info 資料表
  - **關聯**: relationship to SeatRealtime (one-to-one)
  - **方法**: `to_dict()` for serialization

- [ ] T036 [P] [US1] 建立 SeatRealtime SQLAlchemy model in backend/src/models/seat.py
  - **對應資料表**: seat_realtime
  - **欄位映射**: 對應 T017 建立的 seat_realtime 資料表
  - **關聯**: relationship to Library (many-to-one)
  - **方法**: `to_dict()` for serialization

---

## Phase 4: 資料模型 - User Story 4

**目標**: 建立 US4（座位預測）所需的 SQLAlchemy ORM 模型

**預估工時**: 4-6 小時

**⚠️ 依賴**: Phase 2.1（T018-T020 migration scripts）必須完成

### 任務清單（可平行執行）

- [ ] T064 [P] [US4] 建立 SeatHistory SQLAlchemy model in backend/src/models/seat.py
  - **對應資料表**: seat_history
  - **欄位映射**: 對應 T018 建立的 seat_history 資料表
  - **關聯**: relationship to Library (many-to-one)
  - **查詢方法**: `get_history_by_library(library_id, start_time, end_time)`

- [ ] T065 [P] [US4] 建立 PredictionResult SQLAlchemy model in backend/src/models/prediction.py
  - **對應資料表**: prediction_results
  - **欄位映射**: 對應 T019 建立的 prediction_results 資料表
  - **關聯**: relationship to Library (many-to-one)
  - **查詢方法**: `get_latest_prediction(library_id, horizon_minutes)`

- [ ] T066 [P] [US4] 建立 ModelRegistry SQLAlchemy model in backend/src/models/model_registry.py
  - **對應資料表**: model_registry
  - **欄位映射**: 對應 T020 建立的 model_registry 資料表
  - **關聯**: relationship to Library (many-to-one)
  - **查詢方法**: `get_champion_model(library_id)`, `promote_to_champion(model_id)`

---

## Phase 5: 資料庫最佳化

**目標**: 新增索引以提升查詢效能

**預估工時**: 2-3 小時

**⚠️ 依賴**: Phase 3 與 Phase 4 完成後，根據實際查詢模式新增索引

### 任務清單

- [ ] T096 [P] 新增資料庫查詢最佳化索引 in backend/alembic/versions/006_add_indexes.py
  - **seat_history**:
    - INDEX (library_id, recorded_at DESC) - 用於時間範圍查詢
    - INDEX (batch_id) - 用於批次查詢
  - **prediction_results**:
    - INDEX (library_id, prediction_time DESC, horizon_minutes) - 用於最新預測查詢
  - **model_registry**:
    - INDEX (library_id, status, mape) - 用於 Champion model 查詢
  - **seat_realtime**:
    - INDEX (updated_at DESC) - 用於檢查資料新鮮度

---

## Phase 6: 測試基礎設施

**目標**: 建立資料庫測試的 fixtures 與工具

**預估工時**: 3-4 小時

**⚠️ 依賴**: 所有 models（Phase 3 & 4）完成

### 任務清單

- [ ] T048a [P] [US1] 建立資料庫 session 的 pytest fixtures in backend/tests/conftest.py
  - **Fixtures**:
    - `test_db_engine`: 建立測試用 PostgreSQL engine
    - `test_db_session`: 提供測試用 async session
    - `clean_db`: 每次測試前清空資料表
  - **測試資料庫**: 使用獨立的測試資料庫（test_tpml_seat_tracker）
  - **Migration**: 測試前自動執行 Alembic migrations

---

## 並行執行機會

### 可同時進行的任務批次

**批次 1: Phase 2.1 Migration Scripts（可完全平行）**
```bash
同時執行:
- T016: library_info migration
- T017: seat_realtime migration
- T018: seat_history migration
- T019: prediction_results migration
- T020: model_registry migration
```

**批次 2: Phase 3 US1 Models（可完全平行）**
```bash
同時執行:
- T035: Library model
- T036: SeatRealtime model
```

**批次 3: Phase 4 US4 Models（可完全平行）**
```bash
同時執行:
- T064: SeatHistory model
- T065: PredictionResult model
- T066: ModelRegistry model
```

---

## 任務統計

### 依 Phase 分布

| Phase | 任務數 | 預估工時 | 阻塞性 |
|-------|--------|----------|--------|
| Phase 1: 設置 | 1 | 2-3h | ✅ 阻塞 |
| Phase 2: Migration Scripts | 7 | 1-1.5天 | ✅ 阻塞 |
| Phase 3: US1 Models | 2 | 4-6h | ❌ |
| Phase 4: US4 Models | 3 | 4-6h | ❌ |
| Phase 5: 最佳化 | 1 | 2-3h | ❌ |
| Phase 6: 測試 | 1 | 3-4h | ❌ |
| **總計** | **15** | **3-4天** | - |

### 依優先度分布

- **P0（阻塞性）**: 8 個任務（Phase 1 + Phase 2）
- **P1（US1 相關）**: 2 個任務（Phase 3）
- **P2（US4 相關）**: 3 個任務（Phase 4）
- **P3（最佳化）**: 2 個任務（Phase 5 + Phase 6）

---

## 執行建議

### 優先順序策略

1. **Week 1, Day 1-2**: 完成 Phase 1 & Phase 2（阻塞性任務）
   - 目標: 解除後端團隊的阻塞
   - 檢查點: 執行 `alembic upgrade head` 成功建立所有資料表

2. **Week 1, Day 3**: 完成 Phase 3（US1 models）
   - 目標: 支援後端團隊實作 US1 services 與 endpoints
   - 檢查點: 可成功 import 與查詢 Library 與 SeatRealtime models

3. **Week 1, Day 4**: 完成 Phase 4（US4 models）
   - 目標: 支援後端團隊實作 US4 預測相關功能
   - 檢查點: 可成功 import 與查詢所有預測相關 models

4. **Week 2, Day 1**: 完成 Phase 5 & Phase 6（最佳化與測試）
   - 目標: 提升效能與測試覆蓋率
   - 檢查點: 查詢效能提升，測試 fixtures 可正常使用

### 驗證檢查清單

每個 Phase 完成後執行以下檢查:

**Phase 1 完成檢查**:
- [ ] `docker-compose up -d` 成功啟動 PostgreSQL
- [ ] 可使用 psql 連線到資料庫
- [ ] Alembic 設定檔正確指向資料庫

**Phase 2 完成檢查**:
- [ ] `alembic upgrade head` 執行成功
- [ ] 使用 `\dt` 確認所有 5 個資料表存在
- [ ] 使用 `\d table_name` 確認欄位與索引正確
- [ ] Connection pool 可正常取得 session

**Phase 3 完成檢查**:
- [ ] 可 import Library 與 SeatRealtime models
- [ ] 可執行簡單的 CRUD 操作
- [ ] Relationship (Library ↔ SeatRealtime) 正常運作

**Phase 4 完成檢查**:
- [ ] 可 import 所有預測相關 models
- [ ] 可執行查詢方法（get_history_by_library, get_latest_prediction, etc.）
- [ ] Relationships 正常運作

**Phase 5 完成檢查**:
- [ ] 使用 `EXPLAIN ANALYZE` 確認索引被使用
- [ ] 查詢效能測試通過（例如：1000 筆歷史資料查詢 < 100ms）

**Phase 6 完成檢查**:
- [ ] pytest fixtures 可正常提供測試 session
- [ ] 測試前後資料庫正確清空
- [ ] 後端團隊可使用 fixtures 撰寫測試

---

## 與其他團隊的交接點

### 交付給後端團隊

1. **Phase 2.1 完成後**:
   - 通知後端團隊可開始實作 SQLAlchemy models
   - 提供 migration scripts 說明文件
   - 提供資料表 schema 文件

2. **Phase 2.2 完成後**:
   - 提供 connection pool 與 session factory 使用範例
   - 協助後端整合 dependency injection

3. **Phase 3 完成後**:
   - 提供 Library 與 SeatRealtime models 的使用範例
   - 協助後端實作第一個使用 ORM 的 endpoint

4. **Phase 4 完成後**:
   - 提供預測相關 models 的使用範例
   - 協助後端實作預測訓練與查詢邏輯

5. **Phase 6 完成後**:
   - 提供測試 fixtures 使用文件
   - 協助後端撰寫第一個資料庫測試

### 需要後端團隊配合

1. **T003 docker-compose.yml**:
   - 確認後端服務名稱與環境變數命名
   - 確認 PostgreSQL 與後端服務的網路設定

2. **T008 Alembic 初始化**:
   - 後端團隊必須先完成，資料庫團隊才能建立 migrations

3. **Models 驗證**:
   - 後端團隊實作 services 時，回報 models 是否符合需求
   - 需要調整時，資料庫團隊建立新的 migration

---

## 風險與應對

### 風險 1: Migration script 衝突
**情境**: 多人同時建立 migration scripts，版本號衝突
**應對**:
- 使用 sequential naming (001, 002, 003...)
- 一次只有一人建立 migration
- 完成後立即 commit 並通知團隊

### 風險 2: 資料表 schema 需求變更
**情境**: 後端實作時發現 schema 不符需求
**應對**:
- 建立新的 migration script（不要修改已執行的 migration）
- 使用 `alembic revision` 建立變更
- 更新對應的 SQLAlchemy model

### 風險 3: 效能問題
**情境**: 查詢效能不如預期
**應對**:
- 使用 `EXPLAIN ANALYZE` 分析查詢計畫
- 在 Phase 5 新增額外索引
- 考慮使用 materialized views（如果需要）

### 風險 4: 測試資料庫隔離問題
**情境**: 測試間互相影響
**應對**:
- 確保 `clean_db` fixture 正確清空資料
- 使用 transaction rollback 策略
- 考慮使用 Docker container per test（如果需要）

---

## 備註

- **命名慣例**: 資料表使用 snake_case，model 類別使用 PascalCase
- **時區**: 所有時間欄位使用 UTC，在應用層轉換時區
- **Soft Delete**: 如果需要，在 Phase 5 新增 deleted_at 欄位
- **Audit Trail**: 考慮使用 SQLAlchemy events 自動更新 updated_at
- **文件**: 每個 model 都應有 docstring 說明用途與關聯

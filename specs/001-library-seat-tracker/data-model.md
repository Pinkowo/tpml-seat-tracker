# Data Model: 圖書館座位地圖與預測系統

**Phase**: 1 (Design)
**Date**: 2025-11-01
**Status**: Complete

## Overview

本文件定義系統的資料模型，包含資料庫 schema、實體關聯、索引策略，以及與規格中 Key Entities 的對應關係。

## Entity-to-Table Mapping

| Spec Entity | Database Table | Purpose |
|-------------|---------------|---------|
| Library（圖書館分館） | `library_info` | 儲存分館基本資料（地址、電話、經緯度、營業時間） |
| RealtimeSeatStatus（即時座位狀態） | `seat_realtime` | 儲存各館最新的座位快照，供前端查詢即時資訊 |
| HistorySeatStatus（歷史座位狀態） | `seat_history` | 儲存所有座位快照的歷史記錄，供預測模型訓練使用 |
| PredictionResult（預測結果） | `prediction_results` | 儲存未來 30/60 分鐘的座位預測 |
| ModelRegistry（模型註冊表） | `model_registry` | 追蹤 Champion/Challenger 模型版本與評估指標 |

## Database Schema

### 1. library_info（分館主檔）

```sql
CREATE TABLE library_info (
    id SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) UNIQUE NOT NULL,  -- 分館名稱（唯一識別）
    address TEXT NOT NULL,                      -- 地址
    phone VARCHAR(20),                          -- 電話
    latitude DECIMAL(9, 6) NOT NULL,            -- 緯度（-90 ~ 90）
    longitude DECIMAL(9, 6) NOT NULL,           -- 經度（-180 ~ 180）
    open_hours JSONB NOT NULL,                  -- 營業時間（結構見下方）
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_library_location ON library_info USING GIST (
    ll_to_earth(latitude, longitude)
);  -- 地理空間索引（需要 earthdistance extension）

-- open_hours JSONB 結構範例
{
  "monday": {"open": "08:30", "close": "21:00"},
  "tuesday": {"open": "08:30", "close": "21:00"},
  "wednesday": {"open": "08:30", "close": "21:00"},
  "thursday": {"open": "08:30", "close": "21:00"},
  "friday": {"open": "08:30", "close": "21:00"},
  "saturday": {"open": "09:00", "close": "17:00"},
  "sunday": {"open": "09:00", "close": "17:00"}
}
```

**Business Rules**:
- `branch_name` 必須唯一（用於關聯其他表）
- `open_hours` 若缺少某天，表示該日不營業
- MVP 不處理例假日，UI 註記「特殊時段請以官網為準」

---

### 2. seat_history（座位歷史快照）

```sql
CREATE TABLE seat_history (
    id BIGSERIAL PRIMARY KEY,
    batch_id UUID NOT NULL,                     -- 同一輪擷取的批次 ID
    branch_name VARCHAR(100) NOT NULL,
    floor_name VARCHAR(50),                     -- 樓層（如「2F」）
    area_name VARCHAR(100),                     -- 區域（如「自習室 A」）
    area_id VARCHAR(100),                       -- 外部 API 提供的區域識別碼
    free_count INT NOT NULL CHECK (free_count >= 0),
    total_count INT NOT NULL CHECK (total_count > 0),
    collected_at TIMESTAMP NOT NULL,            -- 資料擷取時間（系統時間）
    source_updated_at TIMESTAMP,                -- 外部 API 回傳的資料時間（若有）
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (branch_name) REFERENCES library_info(branch_name) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_history_branch_time ON seat_history (branch_name, collected_at DESC);
CREATE INDEX idx_history_batch ON seat_history (batch_id);
CREATE INDEX idx_history_collected ON seat_history (collected_at DESC);  -- 模型訓練用

-- 資料保留政策：保留最近 30 天（Task B 訓練需求）
-- 使用 pg_cron 或 APScheduler 定期清理
```

**Business Rules**:
- `batch_id`: 同一次 API 呼叫的所有區域共用同一個 UUID，便於追蹤資料一致性
- `collected_at`: 系統時間（統一時區 UTC+8）
- `free_count <= total_count`（透過 CHECK constraint 強制）
- 只增不改（INSERT-only），便於時序分析

---

### 3. seat_realtime（即時座位狀態）

```sql
CREATE TABLE seat_realtime (
    id SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) UNIQUE NOT NULL,   -- 每館僅一筆（聚合）
    total_free_count INT NOT NULL CHECK (total_free_count >= 0),
    total_seat_count INT NOT NULL CHECK (total_seat_count > 0),
    last_updated TIMESTAMP NOT NULL,            -- 最後更新時間
    batch_id UUID NOT NULL,                     -- 對應 seat_history.batch_id

    FOREIGN KEY (branch_name) REFERENCES library_info(branch_name) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_realtime_updated ON seat_realtime (last_updated DESC);
```

**Business Rules**:
- 每館僅一筆記錄（UPSERT 更新）
- `total_free_count` = 該館所有區域 `free_count` 加總
- `total_seat_count` = 該館所有區域 `total_count` 加總
- Task A 執行時：先插入 `seat_history`，再聚合更新 `seat_realtime`

---

### 4. prediction_results（預測結果）

```sql
CREATE TABLE prediction_results (
    id BIGSERIAL PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    horizon VARCHAR(10) NOT NULL,               -- '30m' or '60m'
    predicted_free_count INT NOT NULL CHECK (predicted_free_count >= 0),
    confidence_lower INT,                       -- 信賴區間下界（可選）
    confidence_upper INT,                       -- 信賴區間上界（可選）
    model_id INT NOT NULL,                      -- 對應 model_registry.id
    generated_at TIMESTAMP NOT NULL,            -- 預測產生時間
    valid_for TIMESTAMP NOT NULL,               -- 預測對應時間（generated_at + 30m/60m）

    FOREIGN KEY (branch_name) REFERENCES library_info(branch_name) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES model_registry(id) ON DELETE RESTRICT,
    UNIQUE (branch_name, horizon, valid_for)    -- 避免重複預測
);

-- 索引
CREATE INDEX idx_prediction_branch_valid ON prediction_results (branch_name, valid_for DESC);
CREATE INDEX idx_prediction_generated ON prediction_results (generated_at DESC);
```

**Business Rules**:
- `horizon`: 固定為 '30m' 或 '60m'
- `valid_for`: 預測目標時間（如 13:00 產生 → 13:30 和 14:00 兩筆）
- Task B 執行後更新（每日 03:00）
- 保留 7 天資料，定期清理過期預測

---

### 5. model_registry（模型註冊表）

```sql
CREATE TABLE model_registry (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(50) NOT NULL,            -- 'prophet' | 'random_forest' | 'lstm'
    version VARCHAR(20) NOT NULL,               -- 版本號（如 'v1.2.3'）
    role VARCHAR(20) NOT NULL,                  -- 'champion' | 'challenger'
    mape DECIMAL(5, 2),                         -- 平均絕對百分比誤差（%）
    rmse DECIMAL(5, 2),                         -- 均方根誤差（座位數）
    trained_at TIMESTAMP NOT NULL,              -- 訓練完成時間
    training_data_start DATE NOT NULL,          -- 訓練資料起始日期
    training_data_end DATE NOT NULL,            -- 訓練資料結束日期
    artifact_path TEXT,                         -- 模型檔案路徑（如 GCS URI）
    is_active BOOLEAN DEFAULT TRUE,             -- 是否啟用
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (model_name, version)
);

-- 索引
CREATE INDEX idx_model_active_role ON model_registry (is_active, role);
```

**Business Rules**:
- `role = 'champion'`: 目前生產環境使用的模型
- `role = 'challenger'`: 新訓練的候選模型
- Champion/Challenger 策略：
  1. Task B 訓練新模型 → 標記為 'challenger'
  2. 驗證 MAPE，若改善 ≥5% → 更新為 'champion'，舊 champion 改為 'challenger' 或 `is_active = FALSE`
- 保留所有歷史版本供追溯（不刪除）

---

## Data Flow

### Task A: 每 10 分鐘擷取座位資料

```
外部 API
  ↓ (每 10 分鐘)
生成 batch_id (UUID)
  ↓
INSERT INTO seat_history (所有區域明細)
  ↓
聚合計算每館 total_free_count, total_seat_count
  ↓
UPSERT seat_realtime (ON CONFLICT branch_name DO UPDATE)
```

**SQL Example**:
```sql
-- 聚合並更新 realtime
INSERT INTO seat_realtime (branch_name, total_free_count, total_seat_count, last_updated, batch_id)
SELECT
    branch_name,
    SUM(free_count) AS total_free_count,
    SUM(total_count) AS total_seat_count,
    NOW() AS last_updated,
    :batch_id
FROM seat_history
WHERE batch_id = :batch_id
GROUP BY branch_name
ON CONFLICT (branch_name) DO UPDATE SET
    total_free_count = EXCLUDED.total_free_count,
    total_seat_count = EXCLUDED.total_seat_count,
    last_updated = EXCLUDED.last_updated,
    batch_id = EXCLUDED.batch_id;
```

---

### Task B: 每日模型訓練與預測

```
查詢 seat_history (最近 30 天)
  ↓
特徵工程（hour, weekday, usage_rate, delta_free）
  ↓
訓練 Prophet/RF/LSTM
  ↓
驗證 MAPE (最近 7 天)
  ↓
若 MAPE 改善 ≥5%
  ↓
INSERT INTO model_registry (role='challenger')
  ↓
UPDATE model_registry SET role='champion' WHERE id = new_model_id
  ↓
對每館產生 30m/60m 預測
  ↓
INSERT INTO prediction_results
```

---

### Task C: 每日分館主檔同步

```
外部 API（分館清單）
  ↓
UPSERT library_info (ON CONFLICT branch_name DO UPDATE)
  ↓
更新 address, phone, latitude, longitude, open_hours
```

---

## Data Validation Rules

### Constraint Level

| Table | Constraint | Rule |
|-------|-----------|------|
| seat_history | `free_count >= 0` | 可用座位不得為負 |
| seat_history | `total_count > 0` | 總座位必須 > 0 |
| seat_realtime | `total_free_count <= total_seat_count` | 可用座位不得超過總座位（應用層檢查） |
| prediction_results | `predicted_free_count >= 0` | 預測值不得為負 |
| library_info | `latitude BETWEEN -90 AND 90` | 緯度範圍檢查 |
| library_info | `longitude BETWEEN -180 AND 180` | 經度範圍檢查 |

### Application Level (Pydantic)

```python
from pydantic import BaseModel, Field, validator

class SeatStatusCreate(BaseModel):
    free_count: int = Field(ge=0)
    total_count: int = Field(gt=0)

    @validator('free_count')
    def free_not_exceed_total(cls, v, values):
        if 'total_count' in values and v > values['total_count']:
            raise ValueError('free_count cannot exceed total_count')
        return v
```

---

## Migration Strategy

### Initial Setup

1. 建立資料庫：`createdb tpml_seat_tracker`
2. 啟用 extensions：
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID 生成
   CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;  -- 地理距離計算
   ```
3. 執行 Alembic migration：
   ```bash
   alembic init migrations
   alembic revision --autogenerate -m "Initial schema"
   alembic upgrade head
   ```

### Data Seeding (Development)

```python
# seeds/libraries.py
LIBRARIES = [
    {
        "branch_name": "總館",
        "address": "臺北市建國南路二段125號",
        "phone": "02-2755-2823",
        "latitude": 25.0265,
        "longitude": 121.5378,
        "open_hours": {
            "monday": {"open": "08:30", "close": "21:00"},
            # ... 其他天
        }
    },
    # ... 其他分館
]
```

---

## Performance Considerations

### Indexing Strategy

| Index | Purpose | Impact |
|-------|---------|--------|
| `idx_history_branch_time` | 快速查詢特定館別的歷史資料（模型訓練） | 減少 30 天資料掃描時間 |
| `idx_history_collected` | 按時間排序查詢（最新快照） | 支援 ORDER BY collected_at DESC |
| `idx_realtime_updated` | 檢測過期資料（10 分鐘未更新） | 前端輪詢警示 |
| `idx_library_location` | 地理空間查詢（最近館別） | 使用 GIST 索引加速距離計算 |

### Query Optimization

**Bad** (全表掃描):
```sql
SELECT * FROM seat_history WHERE branch_name = '總館';
```

**Good** (使用索引 + 限制時間範圍):
```sql
SELECT * FROM seat_history
WHERE branch_name = '總館'
  AND collected_at >= NOW() - INTERVAL '30 days'
ORDER BY collected_at DESC;
```

---

## Data Retention Policy

| Table | Retention | Reason |
|-------|-----------|--------|
| `seat_history` | 30 天 | 模型訓練需求 |
| `seat_realtime` | 永久（更新） | 僅保留最新狀態 |
| `prediction_results` | 7 天 | 過期預測無意義 |
| `model_registry` | 永久 | 追溯模型演進歷史 |
| `library_info` | 永久（更新） | 基本資料 |

**Cleanup Job** (每日 01:00):
```sql
-- 刪除 30 天前的歷史資料
DELETE FROM seat_history WHERE collected_at < NOW() - INTERVAL '30 days';

-- 刪除過期預測
DELETE FROM prediction_results WHERE valid_for < NOW() - INTERVAL '7 days';
```

---

## Next Steps

1. 閱讀 contracts/*.md（API 規格）
2. 閱讀 quickstart.md（開發環境設置）
3. 執行 `/speckit.tasks` 產生實作任務清單

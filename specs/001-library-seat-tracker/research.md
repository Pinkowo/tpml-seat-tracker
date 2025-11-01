# Research: 圖書館座位地圖與預測系統

**Phase**: 0 (Research & Technology Selection)
**Date**: 2025-11-01
**Status**: Complete

## Purpose

本文件記錄技術選型決策、最佳實踐研究，以及針對規格中 NEEDS CLARIFICATION 標記的解決方案。

## Technology Decisions

### Backend Framework: FastAPI

**Decision**: 使用 FastAPI + Python 3.12

**Rationale**:
- 原生支援 async/await，適合 I/O 密集的資料擷取與 API 查詢
- 自動產生 OpenAPI 文件，符合 API contract 管理需求
- Pydantic 提供強型別驗證，減少資料錯誤
- 效能優於傳統 Flask/Django，符合 <200ms p95 回應時間需求
- 生態系完整：SQLAlchemy 2.x（ORM）、Alembic（migration）、pytest（testing）

**Alternatives Considered**:
- Django REST Framework: 過於重量，不需要完整的 admin 後台
- Flask: 缺乏原生 async 支援與型別驗證

### Database: PostgreSQL 15

**Decision**: 使用 PostgreSQL 15 搭配 TimescaleDB extension（可選）

**Rationale**:
- 原生支援 JSONB（儲存 open_hours 結構）
- 強大的索引能力（B-tree for timestamp, GiST for location）
- 支援 time-series 查詢（適合座位歷史資料）
- 成熟的 Python 生態系（psycopg3, SQLAlchemy）

**Schema Design**:
- 雙表設計：`seat_realtime`（快速查詢）+ `seat_history`（時序分析）
- 避免單表巨量資料導致查詢變慢
- 使用 `batch_id` 追蹤同一輪擷取，便於一致性檢查

**Alternatives Considered**:
- MySQL: JSONB 支援較弱，時序查詢效能不如 PostgreSQL
- MongoDB: 不需要靈活 schema，關聯查詢需求較多（library ↔ seat ↔ prediction）

### Frontend Framework: React + Vite

**Decision**: React 18 + Vite + TypeScript

**Rationale**:
- Vite 提供極快的開發體驗（HMR < 100ms）
- React 生態系完整：Redux Toolkit（狀態管理）、React Query（資料快取）
- TypeScript 提供型別安全，避免前後端資料結構不一致
- 易於整合 Mapbox GL JS（官方 React wrapper 可用）

**State Management**: Redux Toolkit
- 集中管理複雜狀態（地圖縮放、選中館別、排序模式、定位權限狀態）
- 支援 middleware（如 10 分鐘輪詢邏輯）

**Alternatives Considered**:
- Vue.js: 團隊熟悉度較低
- Next.js: 不需要 SSR（資料即時性要求高，不適合靜態生成）

### Map Library: Mapbox GL JS v2.16+

**Decision**: Mapbox GL JS v2.16+（非 Maplibre，除非授權成本過高）

**Rationale**:
- 高效能向量地圖渲染（50+ markers 流暢）
- 支援自訂標記樣式（綠/黃/灰點）
- 內建地理計算工具（距離、邊界）
- 完整的 React 整合（react-map-gl）

**Fallback**: 若 Mapbox 授權成本過高，改用 Maplibre GL JS（開源版本，API 相容）

**Alternatives Considered**:
- Google Maps: 授權成本高，樣式客製化受限
- Leaflet: 傳統 tile-based，效能不如向量地圖

### Prediction Model Strategy

**Decision**: Champion/Challenger with three model options

**Models**:
1. **Prophet** (Meta): 適合有明確季節性的時序資料（週間/週末差異）
2. **Random Forest Regressor**: 適合加入外部特徵（天氣、節假日）
3. **LSTM**: 適合複雜時序依賴（需較大資料量）

**Training Pipeline**:
- 每日 03:00 觸發訓練（使用最近 30 天資料）
- 驗證集：最近 7 天
- 評估指標：MAPE（平均絕對百分比誤差）< 20%、RMSE < 5 seats
- Champion/Challenger: 新模型 MAPE 改善 ≥5% 才替換 Champion

**Fallback Strategy**:
- 若所有模型 MAPE > 30%，改用移動平均（過去 3 個同時段平均值）
- UI 顯示「估」標示，降低使用者期待

**Alternatives Considered**:
- 僅使用移動平均: 無法捕捉趨勢變化（如連假前夕座位緊張）
- 即時訓練: 延遲過高，不符合 10 分鐘更新需求

### Scheduled Tasks: APScheduler

**Decision**: 使用 APScheduler（Advanced Python Scheduler）

**Tasks**:
- **Task A**: `*/10 * * * *` - 座位資料擷取與同步
  - 呼叫外部 API → 插入 `seat_history` → upsert `seat_realtime`
  - 失敗重試 3 次（間隔 1 分鐘）
  - 標記 `batch_id`（UUID），便於追蹤同一輪擷取

- **Task B**: `0 3 * * *` - 模型訓練
  - 查詢最近 30 天 `seat_history`
  - 訓練 Prophet/RF/LSTM
  - 評估 MAPE，若改善則更新 `model_registry.champion_id`

- **Task C**: `0 2 * * *` - 分館主檔同步
  - 呼叫外部 API 取得最新館別資訊（地址、電話、經緯度、營業時間）
  - upsert `library_info`

**Alternatives Considered**:
- Celery: 過於重量，需要額外 Redis/RabbitMQ
- Cron + 獨立腳本: 難以與 FastAPI 共享 ORM 與設定

### Deployment: Docker + GCP

**Decision**: Multi-stage Dockerfile + Cloud Run

**Rationale**:
- Cloud Run 自動擴展（符合成本效益）
- 支援私有容器映像（GCP Artifact Registry）
- 內建 HTTPS 與 load balancing

**CI/CD**:
- GitHub Actions → build Docker image → push to Artifact Registry → deploy to Cloud Run
- 環境變數管理：Secret Manager

**Alternatives Considered**:
- GKE: 過度工程（不需要複雜 orchestration）
- Compute Engine: 需要手動管理 scaling 與 monitoring

## Best Practices Research

### Distance Calculation

**Method**: Haversine formula（球面距離）

**Implementation**:
```python
from math import radians, sin, cos, sqrt, atan2

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # 地球半徑（公里）
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c
```

**Why Not Other Methods**:
- Vincenty: 精度更高但計算複雜（城市範圍內 Haversine 誤差 <0.5%）
- Manhattan distance: 不符合實際地理距離

### Geolocation API (Frontend)

**Browser API**: `navigator.geolocation.getCurrentPosition()`

**Error Handling**:
- `PERMISSION_DENIED` (1): 顯示「請開啟定位」提示 + 跳轉系統設定按鈕
- `POSITION_UNAVAILABLE` (2): 降級至座位排序
- `TIMEOUT` (3): 重試 1 次（timeout 5s），失敗則降級

**Permission Detection**:
```typescript
const checkPermission = async () => {
  const result = await navigator.permissions.query({ name: 'geolocation' });
  return result.state; // 'granted' | 'denied' | 'prompt'
}
```

### API Caching Strategy

**Cache Layers**:
1. **Backend Cache** (Redis, optional):
   - `/realtime`: 60s TTL（10 分鐘更新頻率，允許 1 分鐘延遲）
   - `/libraries`: 24h TTL（基本資料變動少）
   - `/predict`: 10min TTL（與模型執行週期對齊）

2. **Frontend Cache** (React Query):
   - `staleTime`: 5min（避免過度請求）
   - `cacheTime`: 10min（保留切換頁面時的快取）

**Why Redis is Optional**:
- MVP 階段流量低（<100 req/s），FastAPI 記憶體快取足夠
- Phase 2 可加入 Redis 應對擴展需求

### Data Validation

**Backend** (Pydantic):
```python
class SeatStatus(BaseModel):
    free_count: int = Field(ge=0)  # 必須 ≥0
    total_count: int = Field(gt=0)  # 必須 >0

    @validator('free_count')
    def free_not_exceed_total(cls, v, values):
        if 'total_count' in values and v > values['total_count']:
            raise ValueError('free_count cannot exceed total_count')
        return v
```

**Frontend** (TypeScript):
```typescript
interface LibrarySeat {
  freeCount: number;  // 嚴格型別，避免字串混入
  totalCount: number;
}
```

### Error Monitoring

**Recommended**: Sentry（Python + React SDKs）

**Key Metrics**:
- API error rate (4xx/5xx)
- 外部 API 失敗率（Task A）
- 模型預測 MAPE（Task B）
- 前端 crash rate

## Clarifications Resolved

所有規格中的需求已明確，無 NEEDS CLARIFICATION 標記需要解決。

## Open Questions for Implementation Phase

1. **外部 API Endpoint**: 座位資料來源的實際 URL 與認證方式（需要與圖書館 IT 確認）
2. **Mapbox Access Token**: 是否已申請？使用免費方案（50k requests/month）或付費方案？
3. **GCP Project Setup**: 是否已建立 GCP project 與 service account？
4. **CI/CD Repository**: 使用 GitHub/GitLab/Bitbucket？

## Next Steps

1. 閱讀 data-model.md（Phase 1）
2. 閱讀 contracts/*.md（API 規格）
3. 閱讀 quickstart.md（開發環境設置）
4. 執行 `/speckit.tasks` 產生實作任務清單

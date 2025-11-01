# GET /api/v1/realtime

**Purpose**: 查詢圖書館即時座位資訊（對應規格 FR-040）

## Endpoint

```
GET /api/v1/realtime
```

## Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `branch_name` | string | No | 篩選特定館別（若不提供則回傳全部） | `總館` |

## Request Example

### 查詢所有館別

```bash
curl -X GET "http://localhost:8000/api/v1/realtime"
```

### 查詢特定館別

```bash
curl -X GET "http://localhost:8000/api/v1/realtime?branch_name=總館"
```

## Response

### Success (200 OK)

#### 查詢所有館別

```json
{
  "data": [
    {
      "branch_name": "總館",
      "total_free_count": 85,
      "total_seat_count": 300,
      "usage_rate": 0.717,
      "last_updated": "2025-11-01T13:00:00+08:00",
      "batch_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "branch_name": "大安分館",
      "total_free_count": 12,
      "total_seat_count": 50,
      "usage_rate": 0.76,
      "last_updated": "2025-11-01T13:00:00+08:00",
      "batch_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "meta": {
    "timestamp": "2025-11-01T13:01:23+08:00",
    "version": "v1",
    "total_count": 50
  }
}
```

#### 查詢特定館別

```json
{
  "data": {
    "branch_name": "總館",
    "total_free_count": 85,
    "total_seat_count": 300,
    "usage_rate": 0.717,
    "last_updated": "2025-11-01T13:00:00+08:00",
    "batch_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "meta": {
    "timestamp": "2025-11-01T13:01:23+08:00",
    "version": "v1"
  }
}
```

### Error Responses

#### 404 Not Found (館別不存在)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Library '不存在的分館' not found"
  },
  "meta": {
    "timestamp": "2025-11-01T13:01:23+08:00",
    "version": "v1"
  }
}
```

#### 503 Service Unavailable (資料延遲)

當 `last_updated` 超過 15 分鐘（正常應每 10 分鐘更新），回傳 warning：

```json
{
  "data": [ ... ],
  "meta": {
    "timestamp": "2025-11-01T13:01:23+08:00",
    "version": "v1",
    "warnings": [
      {
        "code": "DATA_DELAYED",
        "message": "Seat data may be outdated (last updated 16 minutes ago)"
      }
    ]
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `branch_name` | string | 分館名稱 |
| `total_free_count` | integer | 可用座位總數（所有區域加總） |
| `total_seat_count` | integer | 總座位數 |
| `usage_rate` | float | 使用率（0.0 ~ 1.0），計算公式：`1 - (total_free_count / total_seat_count)` |
| `last_updated` | string (ISO 8601) | 最後更新時間（UTC+8） |
| `batch_id` | string (UUID) | 資料批次 ID（同一輪擷取的所有館別共用） |

## Business Rules

1. **資料新鮮度**: `last_updated` 應在 10 分鐘內，超過 15 分鐘需發出 warning
2. **空館處理**: 若館別存在但無座位資料（`total_seat_count = 0`），回傳 `null`
3. **排序**: 查詢所有館別時，依 `branch_name` 字母順序排序（前端自行排序距離/座位）

## Cache Strategy

- **Backend**: Redis 快取 60 秒（可選，MVP 可省略）
- **Frontend**: React Query `staleTime: 5 * 60 * 1000` (5 分鐘)
- **HTTP Header**: `Cache-Control: max-age=60`

## Related Requirements

- FR-001: 地圖標記顏色反映即時座位狀態
- FR-005: 底部資訊框顯示館名與座位數
- FR-015: 列表顯示「現有/總座位」
- FR-024: 每 10 分鐘自動更新

## Frontend Integration Example

```typescript
// services/api.ts
import axios from 'axios';

interface RealtimeSeat {
  branch_name: string;
  total_free_count: number;
  total_seat_count: number;
  usage_rate: number;
  last_updated: string;
  batch_id: string;
}

export const getRealtimeSeats = async (branchName?: string): Promise<RealtimeSeat[]> => {
  const params = branchName ? { branch_name: branchName } : {};
  const response = await axios.get('/api/v1/realtime', { params });
  return response.data.data;
};
```

## Testing

### Contract Test (pytest + Tavern)

```yaml
# tests/contract/test_realtime.tavern.yaml
test_name: Test GET /api/v1/realtime

stages:
  - name: Get all libraries realtime data
    request:
      url: http://localhost:8000/api/v1/realtime
      method: GET
    response:
      status_code: 200
      json:
        data:
          - branch_name: !anystr
            total_free_count: !anyint
            total_seat_count: !anyint
            usage_rate: !anyfloat
            last_updated: !anystr
            batch_id: !anystr
```

## Known Issues / Limitations

- MVP 不支援區域層級查詢（僅館別聚合）
- 無認證機制，所有請求公開
- Rate limiting: 100 requests/min per IP（GCP Cloud Armor）

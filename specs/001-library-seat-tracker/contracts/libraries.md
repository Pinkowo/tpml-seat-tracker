# GET /api/v1/libraries

**Purpose**: 查詢圖書館基本資料（地址、電話、經緯度、營業時間，對應規格 FR-042）

## Endpoint

```
GET /api/v1/libraries
```

## Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `branch_name` | string | No | 篩選特定館別（若不提供則回傳全部） | `總館` |
| `user_lat` | float | No | 使用者緯度（用於排序距離） | `25.0330` |
| `user_lng` | float | No | 使用者經度（用於排序距離） | `121.5654` |
| `sort_by` | string | No | 排序方式：`distance`（依距離）或 `seats`（依可用座位），需搭配 `user_lat`/`user_lng` 使用 | `distance` |

## Request Examples

### 查詢所有館別（不排序）

```bash
curl -X GET "http://localhost:8000/api/v1/libraries"
```

### 查詢特定館別

```bash
curl -X GET "http://localhost:8000/api/v1/libraries?branch_name=總館"
```

### 依距離排序（需提供使用者座標）

```bash
curl -X GET "http://localhost:8000/api/v1/libraries?user_lat=25.0330&user_lng=121.5654&sort_by=distance"
```

### 依可用座位排序

```bash
curl -X GET "http://localhost:8000/api/v1/libraries?sort_by=seats"
```

## Response

### Success (200 OK)

#### 查詢所有館別（無排序）

```json
{
  "data": [
    {
      "branch_name": "總館",
      "address": "臺北市建國南路二段125號",
      "phone": "02-2755-2823",
      "latitude": 25.0265,
      "longitude": 121.5378,
      "open_hours": {
        "monday": {"open": "08:30", "close": "21:00"},
        "tuesday": {"open": "08:30", "close": "21:00"},
        "wednesday": {"open": "08:30", "close": "21:00"},
        "thursday": {"open": "08:30", "close": "21:00"},
        "friday": {"open": "08:30", "close": "21:00"},
        "saturday": {"open": "09:00", "close": "17:00"},
        "sunday": {"open": "09:00", "close": "17:00"}
      },
      "is_open": true,
      "closing_in_minutes": 480,
      "distance_km": null,
      "current_seats": {
        "free": 85,
        "total": 300
      }
    },
    {
      "branch_name": "大安分館",
      "address": "臺北市大安區辛亥路三段223號5樓",
      "phone": "02-2733-6900",
      "latitude": 25.0189,
      "longitude": 121.5431,
      "open_hours": {
        "monday": {"open": "08:30", "close": "21:00"},
        "tuesday": {"open": "08:30", "close": "21:00"},
        "wednesday": {"open": "08:30", "close": "21:00"},
        "thursday": {"open": "08:30", "close": "21:00"},
        "friday": {"open": "08:30", "close": "21:00"},
        "saturday": {"open": "09:00", "close": "17:00"},
        "sunday": null
      },
      "is_open": true,
      "closing_in_minutes": 480,
      "distance_km": null,
      "current_seats": {
        "free": 12,
        "total": 50
      }
    }
  ],
  "meta": {
    "timestamp": "2025-11-01T13:00:00+08:00",
    "version": "v1",
    "total_count": 50
  }
}
```

#### 依距離排序

```json
{
  "data": [
    {
      "branch_name": "大安分館",
      "address": "臺北市大安區辛亥路三段223號5樓",
      "phone": "02-2733-6900",
      "latitude": 25.0189,
      "longitude": 121.5431,
      "open_hours": { ... },
      "is_open": true,
      "closing_in_minutes": 480,
      "distance_km": 0.85,
      "current_seats": {
        "free": 12,
        "total": 50
      }
    },
    {
      "branch_name": "總館",
      "address": "臺北市建國南路二段125號",
      "phone": "02-2755-2823",
      "latitude": 25.0265,
      "longitude": 121.5378,
      "open_hours": { ... },
      "is_open": true,
      "closing_in_minutes": 480,
      "distance_km": 1.2,
      "current_seats": {
        "free": 85,
        "total": 300
      }
    }
  ],
  "meta": {
    "timestamp": "2025-11-01T13:00:00+08:00",
    "version": "v1",
    "total_count": 50,
    "sort": {
      "by": "distance",
      "user_location": {
        "lat": 25.0330,
        "lng": 121.5654
      }
    }
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
    "timestamp": "2025-11-01T13:00:00+08:00",
    "version": "v1"
  }
}
```

#### 400 Bad Request (排序參數錯誤)

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "sort_by='distance' requires user_lat and user_lng"
  },
  "meta": {
    "timestamp": "2025-11-01T13:00:00+08:00",
    "version": "v1"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `branch_name` | string | 分館名稱 |
| `address` | string | 地址 |
| `phone` | string | 電話 |
| `latitude` | float | 緯度（-90 ~ 90） |
| `longitude` | float | 經度（-180 ~ 180） |
| `open_hours` | object | 營業時間（星期為 key，`null` 表示休館） |
| `open_hours[day].open` | string | 開館時間（HH:MM） |
| `open_hours[day].close` | string | 閉館時間（HH:MM） |
| `is_open` | boolean | 目前是否開館 |
| `closing_in_minutes` | integer \| null | 距離閉館剩餘分鐘數（閉館時為 `null`） |
| `distance_km` | float \| null | 與使用者距離（公里），未提供座標時為 `null` |
| `current_seats` | object | 即時座位資訊（從 `seat_realtime` JOIN） |
| `current_seats.free` | integer | 可用座位數 |
| `current_seats.total` | integer | 總座位數 |

## Business Rules

1. **營業時間判斷**:
   - 使用系統當前時間（UTC+8）與 `open_hours` 比較
   - 若 `open_hours[today]` 為 `null`，表示今日休館
   - 註記「特殊時段請以官網為準」（MVP 不整合節假日 API）

2. **閉館倒數**:
   - `closing_in_minutes` = 閉館時間 - 當前時間
   - 若 `closing_in_minutes <= 60`，前端顯示「即將閉館」
   - 若 `closing_in_minutes <= 15`，前端紅色警示

3. **距離計算**:
   - 使用 Haversine formula（球面距離）
   - 前端顯示規則：< 1000m 顯示「xxx 公尺」，≥ 1000m 顯示「x.x 公里」

4. **排序規則**:
   - `sort_by=distance`: 近→遠
   - `sort_by=seats`: 可用座位多→少，同分時以距離次排序（需提供 `user_lat`/`user_lng`）
   - 未提供 `sort_by`: 依 `branch_name` 字母順序（前端自行排序）

## Cache Strategy

- **Backend**: Redis 快取 24 小時（基本資料變動少）
- **Frontend**: React Query `staleTime: 60 * 60 * 1000` (1 小時)
- **HTTP Header**: `Cache-Control: max-age=86400`

## Related Requirements

- FR-003: 地圖顯示圖書館標記
- FR-008: 詳細視窗顯示地址、電話、營業時間
- FR-009: 地址含 Google 導航連結
- FR-010: 電話可撥號
- FR-014: 依距離排序（近→遠）
- FR-015: 列表顯示館名與座位數
- FR-019: 顯示開館倒數
- FR-020: 剩餘 ≤60 分鐘顯示「即將閉館」
- FR-021: 剩餘 ≤15 分鐘紅色警示

## Frontend Integration Example

```typescript
// services/api.ts
interface OpenHours {
  [day: string]: { open: string; close: string } | null;
}

interface Library {
  branch_name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  open_hours: OpenHours;
  is_open: boolean;
  closing_in_minutes: number | null;
  distance_km: number | null;
  current_seats: {
    free: number;
    total: number;
  };
}

export const getLibraries = async (params?: {
  branch_name?: string;
  user_lat?: number;
  user_lng?: number;
  sort_by?: 'distance' | 'seats';
}): Promise<Library[]> => {
  const response = await axios.get('/api/v1/libraries', { params });
  return response.data.data;
};
```

### Usage in Component

```typescript
// components/library-list/LibraryList.tsx
const { data: libraries } = useQuery(
  ['libraries', sortBy, userLocation],
  () => getLibraries({
    user_lat: userLocation?.lat,
    user_lng: userLocation?.lng,
    sort_by: sortBy,
  }),
  {
    staleTime: 60 * 60 * 1000, // 1 小時
  }
);

// 顯示距離
const formatDistance = (distanceKm: number | null) => {
  if (distanceKm === null) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} 公尺`;
  return `${distanceKm.toFixed(1)} 公里`;
};

// 導航連結
const getGoogleMapsUrl = (library: Library) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${library.latitude},${library.longitude}`;
};

// 撥號連結
const getPhoneUrl = (phone: string) => {
  return `tel:${phone.replace(/[^0-9]/g, '')}`;
};
```

## Testing

### Contract Test (pytest + Tavern)

```yaml
# tests/contract/test_libraries.tavern.yaml
test_name: Test GET /api/v1/libraries

stages:
  - name: Get all libraries
    request:
      url: http://localhost:8000/api/v1/libraries
      method: GET
    response:
      status_code: 200
      json:
        data:
          - branch_name: !anystr
            address: !anystr
            phone: !anystr
            latitude: !anyfloat
            longitude: !anyfloat
            open_hours: !anydict
            is_open: !anybool
```

### Unit Test (pytest)

```python
# tests/unit/test_library_service.py
def test_calculate_distance():
    """測試 Haversine 距離計算"""
    lat1, lng1 = 25.0330, 121.5654
    lat2, lng2 = 25.0265, 121.5378
    distance = haversine_distance(lat1, lng1, lat2, lng2)
    assert 1.0 < distance < 2.0  # 預期約 1.2 公里

def test_is_open_during_hours():
    """測試營業時間判斷"""
    library = get_library("總館")
    now = datetime(2025, 11, 3, 10, 0)  # 週一 10:00
    assert is_library_open(library, now) is True

def test_is_closed_outside_hours():
    """測試閉館時間判斷"""
    library = get_library("總館")
    now = datetime(2025, 11, 3, 22, 0)  # 週一 22:00
    assert is_library_open(library, now) is False
```

## Known Issues / Limitations

- MVP 不整合節假日/臨時公告 API（UI 註記「請以官網為準」）
- 營業時間不支援分段營業（如午休時段）
- 距離計算基於球面距離，不考慮實際路徑
- 閉館倒數不考慮臨時提早閉館

## Monitoring Metrics

- `library_request_count`: API 呼叫次數
- `library_latency_p95`: 回應時間（p95）
- `distance_calculation_time`: 距離計算耗時（應 < 10ms）

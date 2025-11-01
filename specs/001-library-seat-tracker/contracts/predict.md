# GET /api/v1/predict

**Purpose**: 查詢圖書館未來座位可用性預測（30 分鐘與 1 小時，對應規格 FR-041）

## Endpoint

```
GET /api/v1/predict
```

## Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `branch_name` | string | **Yes** | 館別名稱 | `總館` |

## Request Example

```bash
curl -X GET "http://localhost:8000/api/v1/predict?branch_name=總館"
```

## Response

### Success (200 OK)

```json
{
  "data": {
    "branch_name": "總館",
    "predictions": [
      {
        "horizon": "30m",
        "predicted_free_count": 78,
        "confidence_lower": 65,
        "confidence_upper": 91,
        "valid_for": "2025-11-01T13:30:00+08:00",
        "model_name": "prophet",
        "model_version": "v1.2.0"
      },
      {
        "horizon": "60m",
        "predicted_free_count": 62,
        "confidence_lower": 48,
        "confidence_upper": 76,
        "valid_for": "2025-11-01T14:00:00+08:00",
        "model_name": "prophet",
        "model_version": "v1.2.0"
      }
    ],
    "fallback_used": false,
    "generated_at": "2025-11-01T13:00:00+08:00"
  },
  "meta": {
    "timestamp": "2025-11-01T13:05:12+08:00",
    "version": "v1"
  }
}
```

### Fallback Response (使用移動平均)

當模型不可用或 MAPE > 30% 時，啟用 fallback：

```json
{
  "data": {
    "branch_name": "總館",
    "predictions": [
      {
        "horizon": "30m",
        "predicted_free_count": 80,
        "confidence_lower": null,
        "confidence_upper": null,
        "valid_for": "2025-11-01T13:30:00+08:00",
        "model_name": "moving_average",
        "model_version": "fallback"
      },
      {
        "horizon": "60m",
        "predicted_free_count": 75,
        "confidence_lower": null,
        "confidence_upper": null,
        "valid_for": "2025-11-01T14:00:00+08:00",
        "model_name": "moving_average",
        "model_version": "fallback"
      }
    ],
    "fallback_used": true,
    "generated_at": "2025-11-01T13:00:00+08:00"
  },
  "meta": {
    "timestamp": "2025-11-01T13:05:12+08:00",
    "version": "v1",
    "warnings": [
      {
        "code": "FALLBACK_MODEL",
        "message": "Using moving average due to insufficient model accuracy"
      }
    ]
  }
}
```

### Error Responses

#### 400 Bad Request (缺少 branch_name)

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "branch_name is required"
  },
  "meta": {
    "timestamp": "2025-11-01T13:05:12+08:00",
    "version": "v1"
  }
}
```

#### 404 Not Found (館別不存在)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Library '不存在的分館' not found"
  },
  "meta": {
    "timestamp": "2025-11-01T13:05:12+08:00",
    "version": "v1"
  }
}
```

#### 503 Service Unavailable (預測服務異常)

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Prediction service temporarily unavailable"
  },
  "meta": {
    "timestamp": "2025-11-01T13:05:12+08:00",
    "version": "v1"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `branch_name` | string | 分館名稱 |
| `predictions` | array | 預測結果陣列（30m + 60m） |
| `predictions[].horizon` | string | 預測時距（`"30m"` 或 `"60m"`） |
| `predictions[].predicted_free_count` | integer | 預測可用座位數 |
| `predictions[].confidence_lower` | integer \| null | 信賴區間下界（95% CI），fallback 時為 null |
| `predictions[].confidence_upper` | integer \| null | 信賴區間上界（95% CI），fallback 時為 null |
| `predictions[].valid_for` | string (ISO 8601) | 預測對應時間 |
| `predictions[].model_name` | string | 模型名稱（`prophet`/`random_forest`/`lstm`/`moving_average`） |
| `predictions[].model_version` | string | 模型版本號 |
| `fallback_used` | boolean | 是否使用 fallback 策略 |
| `generated_at` | string (ISO 8601) | 預測產生時間 |

## Business Rules

1. **預測時效**: `generated_at` 應在 10 分鐘內（與 Task B 執行週期對齊）
2. **信賴區間**: 僅在 Champion 模型使用時提供，fallback 時為 `null`
3. **負值處理**: `predicted_free_count` 不得為負，模型輸出 < 0 時 clip 為 0
4. **超過總座位**: 若 `predicted_free_count > total_seat_count`，clip 為 `total_seat_count`

## Cache Strategy

- **Backend**: Redis 快取 10 分鐘（與 Task B 執行週期對齊）
- **Frontend**: React Query `staleTime: 10 * 60 * 1000` (10 分鐘)
- **HTTP Header**: `Cache-Control: max-age=600`

## Related Requirements

- FR-035: 顯示未來 30 分鐘與 1 小時的預測座位數
- FR-037: 預測失敗時使用移動平均並標示「估」
- FR-038: 每日重新訓練模型並評估 MAPE

## Frontend Integration Example

```typescript
// services/api.ts
interface PredictionHorizon {
  horizon: '30m' | '60m';
  predicted_free_count: number;
  confidence_lower: number | null;
  confidence_upper: number | null;
  valid_for: string;
  model_name: string;
  model_version: string;
}

interface PredictionResponse {
  branch_name: string;
  predictions: PredictionHorizon[];
  fallback_used: boolean;
  generated_at: string;
}

export const getPrediction = async (branchName: string): Promise<PredictionResponse> => {
  const response = await axios.get('/api/v1/predict', {
    params: { branch_name: branchName }
  });
  return response.data.data;
};
```

### Usage in Component

```typescript
// components/library-detail/PredictionSection.tsx
const { data: prediction, isLoading } = useQuery(
  ['prediction', branchName],
  () => getPrediction(branchName),
  {
    staleTime: 10 * 60 * 1000, // 10 分鐘
    cacheTime: 15 * 60 * 1000, // 15 分鐘
  }
);

if (prediction?.fallback_used) {
  // 顯示「估」標示
  return <Badge>估</Badge>;
}
```

## Testing

### Contract Test (pytest + Tavern)

```yaml
# tests/contract/test_predict.tavern.yaml
test_name: Test GET /api/v1/predict

stages:
  - name: Get prediction for valid library
    request:
      url: http://localhost:8000/api/v1/predict
      method: GET
      params:
        branch_name: "總館"
    response:
      status_code: 200
      json:
        data:
          branch_name: "總館"
          predictions:
            - horizon: "30m"
              predicted_free_count: !anyint
              valid_for: !anystr
          fallback_used: !anybool
```

### Unit Test (pytest)

```python
# tests/unit/test_prediction_service.py
def test_clip_negative_prediction():
    """預測值為負時應 clip 為 0"""
    result = predict_seats(branch_name="總館", horizon="30m")
    assert result['predicted_free_count'] >= 0

def test_clip_exceed_total_seats():
    """預測值超過總座位時應 clip"""
    result = predict_seats(branch_name="總館", horizon="30m")
    library = get_library("總館")
    assert result['predicted_free_count'] <= library.total_seat_count
```

## Known Issues / Limitations

- MVP 不支援自訂時距（僅固定 30m/60m）
- 預測未考慮天氣、節假日等外部因素（Phase 2 可擴充）
- 信賴區間僅為統計意義，不保證實際座位數在此範圍內
- 閉館時段的預測值無意義（前端應判斷營業時間後隱藏預測）

## Monitoring Metrics

- `prediction_request_count`: 預測 API 呼叫次數
- `prediction_latency_p95`: 回應時間（p95）
- `fallback_usage_rate`: Fallback 使用率（應 < 10%）
- `prediction_accuracy_mape`: 實際 MAPE（與驗證集比較）

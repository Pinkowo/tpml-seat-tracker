# GET /api/v1/health

**Purpose**: 健康檢查端點（用於監控與負載均衡器）

## Endpoint

```
GET /api/v1/health
```

## Query Parameters

None

## Request Example

```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

## Response

### Success (200 OK)

```json
{
  "status": "healthy",
  "timestamp": "2025-11-01T13:00:00+08:00",
  "version": "v1.0.0",
  "checks": {
    "database": "ok",
    "external_api": "ok"
  }
}
```

### Degraded (200 OK with warnings)

當部分依賴異常但核心功能可用時：

```json
{
  "status": "degraded",
  "timestamp": "2025-11-01T13:00:00+08:00",
  "version": "v1.0.0",
  "checks": {
    "database": "ok",
    "external_api": "error"
  },
  "warnings": [
    "External API unavailable - using cached data"
  ]
}
```

### Unhealthy (503 Service Unavailable)

當核心依賴（如資料庫）異常時：

```json
{
  "status": "unhealthy",
  "timestamp": "2025-11-01T13:00:00+08:00",
  "version": "v1.0.0",
  "checks": {
    "database": "error",
    "external_api": "ok"
  },
  "errors": [
    "Database connection failed"
  ]
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | 健康狀態：`healthy`（正常）/ `degraded`（降級）/ `unhealthy`（異常） |
| `timestamp` | string (ISO 8601) | 檢查時間 |
| `version` | string | API 版本號 |
| `checks` | object | 各依賴的檢查結果 |
| `checks.database` | string | 資料庫連線狀態（`ok` / `error`） |
| `checks.external_api` | string | 外部 API 可用性（`ok` / `error`） |
| `warnings` | array | 降級時的警告訊息（可選） |
| `errors` | array | 異常時的錯誤訊息（可選） |

## Business Rules

1. **Database Check**:
   - 執行簡單查詢：`SELECT 1`
   - 超時時間：2 秒
   - 失敗 → `status = "unhealthy"`

2. **External API Check**:
   - 檢查最近一次擷取時間（`seat_realtime.last_updated`）
   - 若 > 15 分鐘 → `status = "degraded"`
   - 不執行實際 API 呼叫（避免影響外部服務）

3. **HTTP Status Code**:
   - `healthy` → 200 OK
   - `degraded` → 200 OK（但包含 warnings）
   - `unhealthy` → 503 Service Unavailable

## Use Cases

### Load Balancer (GCP Cloud Run)

Cloud Run 自動呼叫此端點檢查服務健康狀態：
- 若回傳 503，停止流量導向此實例
- 若連續 3 次失敗，重啟容器

### Monitoring (Uptime Checks)

使用 GCP Uptime Checks 或第三方服務（如 UptimeRobot）：
- 每 1 分鐘檢查一次
- 若 `status != "healthy"`，發送告警至 Slack/Email

### CI/CD Pipeline

部署後執行 smoke test：
```bash
#!/bin/bash
HEALTH_URL="https://api.tpml-seat-tracker.example.com/api/v1/health"
RESPONSE=$(curl -s $HEALTH_URL)
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$STATUS" != "healthy" ]; then
  echo "Health check failed: $RESPONSE"
  exit 1
fi

echo "Health check passed"
```

## Cache Strategy

- **不快取**（每次請求重新檢查）
- **HTTP Header**: `Cache-Control: no-cache`

## Implementation Example

```python
# backend/src/api/routes/health.py
from fastapi import APIRouter, status
from sqlalchemy import text
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)):
    checks = {}
    warnings = []
    errors = []

    # Database check
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = "error"
        errors.append(f"Database connection failed: {str(e)}")

    # External API check (via last update time)
    try:
        last_update = db.query(func.max(SeatRealtime.last_updated)).scalar()
        if last_update and datetime.now() - last_update > timedelta(minutes=15):
            checks["external_api"] = "error"
            warnings.append("External API unavailable - using cached data")
        else:
            checks["external_api"] = "ok"
    except Exception as e:
        checks["external_api"] = "error"
        warnings.append(f"Cannot verify external API status: {str(e)}")

    # Determine overall status
    if errors:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        overall_status = "unhealthy"
    elif warnings:
        status_code = status.HTTP_200_OK
        overall_status = "degraded"
    else:
        status_code = status.HTTP_200_OK
        overall_status = "healthy"

    response = {
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "version": "v1.0.0",
        "checks": checks
    }

    if warnings:
        response["warnings"] = warnings
    if errors:
        response["errors"] = errors

    return JSONResponse(content=response, status_code=status_code)
```

## Testing

### Contract Test (pytest + Tavern)

```yaml
# tests/contract/test_health.tavern.yaml
test_name: Test GET /api/v1/health

stages:
  - name: Health check returns 200
    request:
      url: http://localhost:8000/api/v1/health
      method: GET
    response:
      status_code: 200
      json:
        status: !anystr
        timestamp: !anystr
        version: !anystr
        checks:
          database: !anystr
```

### Integration Test (pytest)

```python
# tests/integration/test_health.py
def test_health_check_with_db_down(client, monkeypatch):
    """資料庫異常時應回傳 503"""
    def mock_db_error(*args, **kwargs):
        raise ConnectionError("Database unavailable")

    monkeypatch.setattr("app.db.session.execute", mock_db_error)

    response = client.get("/api/v1/health")
    assert response.status_code == 503
    assert response.json()["status"] == "unhealthy"
```

## Known Issues / Limitations

- 外部 API 檢查基於最近更新時間，不執行實際呼叫
- 不檢查預測模型可用性（僅檢查核心依賴）
- 無認證機制（公開端點）

## Monitoring Metrics

- `health_check_duration`: 檢查耗時（應 < 100ms）
- `health_status`: 目前狀態（healthy/degraded/unhealthy）
- `database_check_failure_rate`: 資料庫檢查失敗率

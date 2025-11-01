# API Contracts

**Phase**: 1 (Design)
**Date**: 2025-11-01
**Status**: Complete

## Overview

本目錄定義前端與後端之間的 API 合約，對應規格中的 FR-040 ~ FR-045。

## API Endpoints

| Endpoint | Method | Purpose | Reference |
|----------|--------|---------|-----------|
| `/api/v1/realtime` | GET | 查詢即時座位資訊 | [realtime.md](./realtime.md) |
| `/api/v1/predict` | GET | 查詢座位預測（30m/60m） | [predict.md](./predict.md) |
| `/api/v1/libraries` | GET | 查詢圖書館基本資料 | [libraries.md](./libraries.md) |
| `/api/v1/health` | GET | 健康檢查 | [health.md](./health.md) |

## Common Patterns

### Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.tpml-seat-tracker.example.com`

### Response Format

所有 API 回應使用統一格式：

#### Success Response (2xx)

```json
{
  "data": { ... },       // 實際資料
  "meta": {
    "timestamp": "2025-11-01T13:00:00+08:00",
    "version": "v1"
  }
}
```

#### Error Response (4xx/5xx)

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "branch_name is required",
    "details": { ... }   // 可選：額外錯誤細節
  },
  "meta": {
    "timestamp": "2025-11-01T13:00:00+08:00",
    "version": "v1"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_PARAMETER` | 400 | 請求參數錯誤或缺失 |
| `NOT_FOUND` | 404 | 資源不存在（如館別名稱錯誤） |
| `RATE_LIMIT_EXCEEDED` | 429 | 請求頻率過高 |
| `INTERNAL_ERROR` | 500 | 伺服器內部錯誤 |
| `SERVICE_UNAVAILABLE` | 503 | 外部 API 無法連線 |

### CORS Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Cache Headers

- `/realtime`: `Cache-Control: max-age=60` (1 分鐘)
- `/predict`: `Cache-Control: max-age=600` (10 分鐘)
- `/libraries`: `Cache-Control: max-age=86400` (24 小時)

## Authentication

MVP 階段無需認證（公開查詢）。Phase 2 若需要限制存取，考慮以下方案：
- API Key（header: `X-API-Key`）
- Rate limiting by IP

## Versioning

URL 路徑包含版本號 `/api/v1/`，未來 breaking changes 時增加新版本（如 `/api/v2/`）。

## Contract Testing

使用 pytest + Tavern 進行 contract tests：

```python
# tests/contract/test_realtime_contract.py
def test_realtime_response_schema():
    response = client.get("/api/v1/realtime")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "meta" in data
    assert isinstance(data["data"], list)
```

## Next Steps

1. 閱讀各 endpoint 的詳細規格（realtime.md, predict.md, libraries.md）
2. 閱讀 quickstart.md（開發環境設置）
3. 執行 `/speckit.tasks` 產生實作任務清單

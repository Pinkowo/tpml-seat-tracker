"""
GET /api/v1/predict endpoint 的 contract tests
"""
from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


def test_get_predict_success():
    """測試 GET /api/v1/predict 成功回應"""
    response = client.get("/api/v1/predict?branch_name=總館")
    
    assert response.status_code == 200
    data = response.json()
    
    # 驗證回應結構
    assert "library_id" in data
    assert "predictions" in data
    assert isinstance(data["predictions"], list)
    assert len(data["predictions"]) == 2  # 30m 和 60m
    
    # 驗證每個預測項目
    for pred in data["predictions"]:
        assert "horizon_minutes" in pred
        assert "predicted_seats" in pred
        assert "is_fallback" in pred
        assert pred["horizon_minutes"] in [30, 60]
        assert isinstance(pred["predicted_seats"], int)
        assert isinstance(pred["is_fallback"], bool)


def test_get_predict_missing_branch_name():
    """測試缺少 branch_name 參數"""
    response = client.get("/api/v1/predict")
    
    assert response.status_code == 422  # Validation error


def test_get_predict_fallback_flag():
    """測試 fallback flag 正確標記"""
    response = client.get("/api/v1/predict?branch_name=總館")
    
    assert response.status_code == 200
    data = response.json()
    
    # 每個預測都應該有 is_fallback 標記
    for pred in data["predictions"]:
        assert "is_fallback" in pred


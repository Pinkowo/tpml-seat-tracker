"""
GET /api/v1/realtime endpoint 的 contract tests
"""
import os
import pytest
from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


@pytest.mark.skipif(
    os.getenv("TESTING") == "1",
    reason="SQLite 不支援 array_agg，跳過測試環境的測試"
)
def test_get_realtime_success():
    """測試 GET /api/v1/realtime 成功回應"""
    response = client.get("/api/v1/realtime")
    
    assert response.status_code == 200
    data = response.json()
    
    # 驗證回應結構
    assert "data" in data
    assert "meta" in data
    assert data["meta"]["version"] == "v1"
    assert isinstance(data["data"], list)


@pytest.mark.skipif(
    os.getenv("TESTING") == "1",
    reason="SQLite 不支援 array_agg，跳過測試環境的測試"
)
def test_get_realtime_with_branch_name():
    """測試依 branch_name 篩選"""
    response = client.get("/api/v1/realtime?branch_name=總館")
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data


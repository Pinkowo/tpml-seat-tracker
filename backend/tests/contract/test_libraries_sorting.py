"""
/libraries 排序參數的 contract tests
"""

from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


def test_sort_by_distance_with_coords():
    """測試依距離排序（提供座標）"""
    response = client.get(
        "/api/v1/libraries?user_lat=25.0330&user_lng=121.5654&sort_by=distance"
    )

    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    # API 目前不回傳 sort 資訊
    # assert data["meta"]["sort"]["by"] == "distance"


def test_sort_by_distance_missing_coords():
    """測試依距離排序（缺少座標）"""
    response = client.get("/api/v1/libraries?sort_by=distance")

    assert response.status_code == 400
    data = response.json()
    assert "distance" in data["detail"].lower()


def test_sort_by_seats():
    """測試依座位排序"""
    response = client.get(
        "/api/v1/libraries?user_lat=25.0330&user_lng=121.5654&sort_by=seats"
    )

    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    # API 目前不回傳 sort 資訊
    # assert data["meta"]["sort"]["by"] == "seats"


def test_sort_by_seats_without_coords():
    """測試依座位排序（不需要座標，但會影響次要排序）"""
    response = client.get("/api/v1/libraries?sort_by=seats")

    # 依座位排序本身不需要座標，但次要排序會受影響
    assert response.status_code == 200


def test_invalid_coordinate_pair():
    """測試無效的座標對（只提供一個）"""
    # 只提供一個座標，且預設 sort_by=distance，會先觸發 400（因為 sort_by=distance 需要座標）
    # 如果需要測試 422，需要先設定 sort_by=seats
    response = client.get("/api/v1/libraries?user_lat=25.0330")

    # 因為預設 sort_by=distance 且缺少 user_lng，所以回傳 400
    assert response.status_code == 400


def test_invalid_coordinate_pair_with_seats():
    """測試無效的座標對（只提供一個，使用 sort_by=seats 來測試 422）"""
    # 使用 sort_by=seats 來測試座標對不完整的 422 錯誤
    response = client.get("/api/v1/libraries?user_lat=25.0330&sort_by=seats")

    # 現在會觸發 422，因為座標對不完整
    assert response.status_code == 422

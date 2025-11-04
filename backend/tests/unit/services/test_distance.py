"""
距離計算服務的 unit tests
"""
import pytest
from src.services.distance import calculate_distance


def test_calculate_distance_taipei_101_to_palace():
    """測試台北 101 到故宮的距離（約 7.9 公里）"""
    # 台北 101
    lat1, lng1 = 25.0330, 121.5654
    # 故宮博物院
    lat2, lng2 = 25.1024, 121.5486
    
    distance = calculate_distance(lat1, lng1, lat2, lng2)
    
    # 實際距離約 7.9 公里，容許誤差 ±500 公尺
    assert 7400 < distance < 8400


def test_calculate_distance_zero():
    """測試零距離（同一點）"""
    lat, lng = 25.0330, 121.5654
    
    distance = calculate_distance(lat, lng, lat, lng)
    
    assert distance == 0.0


def test_calculate_distance_same_latitude():
    """測試相同緯度不同經度"""
    # 台北 101
    lat1, lng1 = 25.0330, 121.5654
    # 同一緯度，經度差異約 0.1 度
    lat2, lng2 = 25.0330, 121.6654
    
    distance = calculate_distance(lat1, lng1, lat2, lng2)
    
    # 預期約 10 公里，容許誤差 ±1 公里
    assert 9000 < distance < 11000


def test_calculate_distance_same_longitude():
    """測試相同經度不同緯度"""
    # 台北 101
    lat1, lng1 = 25.0330, 121.5654
    # 同一經度，緯度差異約 0.1 度
    lat2, lng2 = 25.1330, 121.5654
    
    distance = calculate_distance(lat1, lng1, lat2, lng2)
    
    # 預期約 11 公里，容許誤差 ±1 公里
    assert 10000 < distance < 12000


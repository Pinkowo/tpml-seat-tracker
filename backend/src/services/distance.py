"""
距離計算服務（使用 Haversine formula）
"""
import math


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    計算兩點之間的距離（使用 Haversine formula）
    
    Args:
        lat1: 第一個點的緯度
        lng1: 第一個點的經度
        lat2: 第二個點的緯度
        lng2: 第二個點的經度
    
    Returns:
        距離（公尺）
    """
    # 地球半徑（公尺）
    R = 6371000

    # 轉換為弧度
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    # Haversine formula
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # 距離
    distance = R * c

    return distance


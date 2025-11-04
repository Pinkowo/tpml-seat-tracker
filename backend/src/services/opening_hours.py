"""
營業時間計算服務
"""
from datetime import datetime, time
from typing import Dict, Optional


def is_open(operating_hours: Dict[str, Optional[Dict[str, str]]], current_time: datetime) -> bool:
    """
    判斷圖書館目前是否營業
    
    Args:
        operating_hours: 營業時間字典，格式如 {"monday": {"open": "08:30", "close": "21:00"}, ...}
        current_time: 當前時間（datetime 物件）
    
    Returns:
        是否營業中
    """
    # 取得今天是星期幾（monday=0, sunday=6）
    day_names = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ]
    
    today = day_names[current_time.weekday()]
    today_hours = operating_hours.get(today)
    
    # 如果今天沒有營業時間，表示休館
    if today_hours is None:
        return False
    
    # 解析開館和閉館時間
    open_time_str = today_hours.get("open", "00:00")
    close_time_str = today_hours.get("close", "23:59")
    
    open_hour, open_minute = map(int, open_time_str.split(":"))
    close_hour, close_minute = map(int, close_time_str.split(":"))
    
    open_time = time(open_hour, open_minute)
    close_time = time(close_hour, close_minute)
    current_time_only = current_time.time()
    
    # 判斷是否在營業時間內
    # 處理跨日情況（例如 22:00-02:00）
    if close_time < open_time:
        # 跨日營業：閉館時間小於開館時間
        return current_time_only >= open_time or current_time_only < close_time
    else:
        # 正常營業：在同一天內
        return open_time <= current_time_only < close_time


def closing_in_minutes(
    operating_hours: Dict[str, Optional[Dict[str, str]]], current_time: datetime
) -> Optional[int]:
    """
    計算距離閉館還有多少分鐘
    
    Args:
        operating_hours: 營業時間字典
        current_time: 當前時間
    
    Returns:
        距離閉館的分鐘數，如果已閉館或超過 120 分鐘則回傳 None
    """
    if not is_open(operating_hours, current_time):
        return None
    
    day_names = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ]
    
    today = day_names[current_time.weekday()]
    today_hours = operating_hours.get(today)
    
    if today_hours is None:
        return None
    
    # 解析閉館時間
    close_time_str = today_hours.get("close", "23:59")
    close_hour, close_minute = map(int, close_time_str.split(":"))
    close_time = time(close_hour, close_minute)
    
    # 計算閉館的 datetime
    close_datetime = current_time.replace(
        hour=close_hour, minute=close_minute, second=0, microsecond=0
    )
    
    # 如果是跨日營業，且當前時間在午夜前，閉館時間是明天
    if close_time < current_time.time():
        from datetime import timedelta
        close_datetime = close_datetime + timedelta(days=1)
    
    # 計算時間差（分鐘）
    time_diff = close_datetime - current_time
    minutes = int(time_diff.total_seconds() / 60)
    
    # 如果超過 120 分鐘，回傳 None
    if minutes > 120:
        return None
    
    return minutes


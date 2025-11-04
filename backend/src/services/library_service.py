"""
圖書館服務層（排序邏輯）
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from src.services.distance import calculate_distance
from src.services.opening_hours import is_open, closing_in_minutes
from src.models.library import Library
from src.models.seat import SeatRealtime


async def get_libraries_from_db(
    db: AsyncSession,
    branch_name: Optional[str] = None,
) -> List[Library]:
    """
    從資料庫取得圖書館列表
    
    Args:
        db: 資料庫 session
        branch_name: 可選的館別名稱篩選
        
    Returns:
        圖書館列表（含 seat_realtime 關聯）
    """
    query = select(Library).options(selectinload(Library.seat_realtime))
    
    if branch_name:
        query = query.where(Library.branch_name == branch_name)
    
    result = await db.execute(query)
    libraries = result.scalars().all()
    
    return libraries


async def format_library_response(
    library: Library,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    current_time: Optional[datetime] = None,
) -> dict:
    """
    格式化圖書館回應資料
    
    Args:
        library: Library 模型實例
        user_lat: 使用者緯度
        user_lng: 使用者經度
        current_time: 當前時間（預設為現在）
        
    Returns:
        格式化後的字典
    """
    if current_time is None:
        current_time = datetime.now()
    
    # 計算距離
    distance_km = None
    if user_lat is not None and user_lng is not None:
        distance_m = calculate_distance(
            user_lat, user_lng, float(library.latitude), float(library.longitude)
        )
        distance_km = distance_m / 1000
    
    # 計算營業狀態
    is_open_now = is_open(library.open_hours, current_time)
    closing_minutes = closing_in_minutes(library.open_hours, current_time) if is_open_now else None
    
    # 即時座位資訊（聚合所有區域的資料）
    current_seats = None
    if library.seat_realtime and len(library.seat_realtime) > 0:
        # 聚合所有區域的座位數
        total_free = sum(seat.free_count for seat in library.seat_realtime)
        total_seats = sum(seat.total_count for seat in library.seat_realtime)
        current_seats = {
            "free": total_free,
            "total": total_seats,
        }
    
    return {
        "branch_name": library.branch_name,
        "address": library.address,
        "phone": library.phone,
        "latitude": float(library.latitude),
        "longitude": float(library.longitude),
        "open_hours": library.open_hours,
        "is_open": is_open_now,
        "closing_in_minutes": closing_minutes,
        "distance_km": distance_km,
        "current_seats": current_seats,
    }


async def get_libraries_sorted(
    db: AsyncSession,
    sort_by: str,
    branch_name: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
) -> List[dict]:
    """
    取得排序後的圖書館列表

    Args:
        db: 資料庫 session
        sort_by: 排序方式 ("distance" 或 "seats")
        branch_name: 可選的館別名稱篩選
        user_lat: 使用者緯度（距離排序需要）
        user_lng: 使用者經度（距離排序需要）

    Returns:
        排序後的圖書館列表（字典格式）
    """
    # 從資料庫取得圖書館
    libraries = await get_libraries_from_db(db, branch_name)
    
    # 格式化回應
    current_time = datetime.now()
    formatted_libs = [
        await format_library_response(lib, user_lat, user_lng, current_time)
        for lib in libraries
    ]

    if sort_by == "distance":
        if user_lat is None or user_lng is None:
            raise ValueError("距離排序需要提供 user_lat 和 user_lng")

        formatted_libs.sort(key=lambda x: x["distance_km"] or float("inf"))

    elif sort_by == "seats":
        # 按可用座位遞減，再按距離遞增
        formatted_libs.sort(
            key=lambda x: (
                -(x["current_seats"]["free"] if x["current_seats"] else 0),
                x["distance_km"] or float("inf"),
            )
        )

    return formatted_libs

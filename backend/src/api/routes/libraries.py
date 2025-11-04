"""
圖書館列表 API
"""
from typing import Optional, Literal
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas import LibraryResponse
from src.services.library_service import get_libraries_sorted
from src.api.dependencies import get_db

router = APIRouter(prefix="/api/v1/libraries", tags=["libraries"])


@router.get(
    "",
    response_model=dict,
    summary="查詢圖書館列表",
    description="取得所有圖書館的基本資料，包含地址、電話、經緯度、營業時間與即時座位資訊",
    responses={
        200: {
            "description": "成功取得圖書館列表",
            "content": {
                "application/json": {
                    "example": {
                        "data": [
                            {
                                "branch_name": "總館",
                                "address": "臺北市建國南路二段125號",
                                "phone": "02-2755-2823",
                                "latitude": 25.0265,
                                "longitude": 121.5378,
                                "open_hours": {
                                    "monday": {"open": "08:30", "close": "21:00"},
                                    "tuesday": {"open": "08:30", "close": "21:00"},
                                },
                                "is_open": True,
                                "closing_in_minutes": 480,
                                "distance_km": 1.2,
                                "current_seats": {"free": 85, "total": 300},
                            }
                        ],
                        "meta": {
                            "timestamp": "2025-11-01T13:00:00+08:00",
                            "version": "v1",
                            "total_count": 50,
                        },
                    }
                }
            },
        },
        400: {"description": "參數錯誤（例如：sort_by=distance 但未提供座標）"},
        422: {"description": "驗證錯誤（例如：只提供 user_lat 而沒有 user_lng）"},
    },
)
async def get_libraries(
    branch_name: Optional[str] = Query(None, description="篩選特定館別", example="總館"),
    user_lat: Optional[float] = Query(
        None, ge=-90, le=90, description="使用者緯度", example=25.0330
    ),
    user_lng: Optional[float] = Query(
        None, ge=-180, le=180, description="使用者經度", example=121.5654
    ),
    sort_by: Optional[Literal["distance", "seats"]] = Query(
        "distance", description="排序方式（distance=依距離，seats=依可用座位）", example="distance"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    查詢圖書館基本資料
    
    支援功能：
    - 查詢所有館別或特定館別
    - 依距離或可用座位排序
    - 計算與使用者的距離（需提供 user_lat 和 user_lng）
    - 顯示營業狀態與閉館倒數
    - 顯示即時座位資訊
    
    使用範例：
    - 查詢所有館別：`GET /api/v1/libraries`
    - 依距離排序：`GET /api/v1/libraries?user_lat=25.0330&user_lng=121.5654&sort_by=distance`
    - 依座位排序：`GET /api/v1/libraries?user_lat=25.0330&user_lng=121.5654&sort_by=seats`
    """
    # 驗證排序參數
    if sort_by == "distance" and (user_lat is None or user_lng is None):
        raise HTTPException(
            status_code=400,
            detail="sort_by='distance' requires user_lat and user_lng",
        )
    
    if (user_lat is None) != (user_lng is None):
        raise HTTPException(
            status_code=422,
            detail="user_lat and user_lng must be provided together",
        )

    # 實際資料庫查詢
    from datetime import datetime
    libraries = await get_libraries_sorted(
        db=db,
        sort_by=sort_by,
        branch_name=branch_name,
        user_lat=user_lat,
        user_lng=user_lng,
    )
    
    return {
        "data": libraries,
        "meta": {
            "timestamp": datetime.now().isoformat(),
            "version": "v1",
            "total_count": len(libraries),
        },
    }


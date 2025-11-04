"""
即時座位資料 API
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_db
from src.models.library import Library
from src.models.seat import SeatRealtime

router = APIRouter(prefix="/api/v1/realtime", tags=["realtime"])


async def get_realtime_seats_aggregated(
    db: AsyncSession,
    branch_name: Optional[str] = None,
) -> List[dict]:
    """
    取得聚合後的即時座位資料

    Args:
        db: 資料庫 session
        branch_name: 可選的館別名稱篩選

    Returns:
        聚合後的座位資料列表
    """

    query = (
        select(
            Library.id,
            Library.branch_name,
            func.sum(SeatRealtime.free_count).label("total_free_count"),
            func.sum(SeatRealtime.total_count).label("total_seat_count"),
            func.max(SeatRealtime.last_updated).label("last_updated"),
            func.array_agg(SeatRealtime.batch_id).label("batch_ids"),
        )
        .outerjoin(SeatRealtime, Library.id == SeatRealtime.library_id)
        .group_by(Library.id, Library.branch_name)
    )

    if branch_name:
        query = query.where(Library.branch_name == branch_name)

    result = await db.execute(query)
    rows = result.all()

    seat_data = []
    for row in rows:
        total_free = row.total_free_count or 0
        total_seats = row.total_seat_count or 0
        usage_rate = 1.0 - (total_free / total_seats) if total_seats > 0 else 0.0

        # 從 ARRAY_AGG 結果中取得第一個 batch_id（同一批次的資料應該有相同的 batch_id）
        batch_id = None
        if row.batch_ids and len(row.batch_ids) > 0:
            # 過濾掉 None 值，然後取第一個
            valid_batch_ids = [bid for bid in row.batch_ids if bid is not None]
            if valid_batch_ids:
                batch_id = str(valid_batch_ids[0])

        seat_data.append(
            {
                "branch_name": row.branch_name,
                "total_free_count": total_free,
                "total_seat_count": total_seats,
                "usage_rate": round(usage_rate, 3),
                "last_updated": (
                    row.last_updated.isoformat() if row.last_updated else None
                ),
                "batch_id": batch_id,
            }
        )

    return seat_data


@router.get(
    "",
    response_model=dict,
    summary="查詢即時座位資料",
    description="取得圖書館的即時座位資訊，包含可用座位數、總座位數、使用率與最後更新時間",
    responses={
        200: {
            "description": "成功取得即時座位資料",
            "content": {
                "application/json": {
                    "example": {
                        "data": [
                            {
                                "branch_name": "總館",
                                "total_free_count": 85,
                                "total_seat_count": 300,
                                "usage_rate": 0.717,
                                "last_updated": "2025-11-01T13:00:00+08:00",
                                "batch_id": "550e8400-e29b-41d4-a716-446655440000",
                            }
                        ],
                        "meta": {
                            "timestamp": "2025-11-01T13:01:23+08:00",
                            "version": "v1",
                            "total_count": 50,
                        },
                    }
                }
            },
        },
        404: {"description": "指定的館別不存在"},
    },
)
async def get_realtime_seats(
    branch_name: Optional[str] = Query(
        None, description="篩選特定館別", example="總館"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    查詢圖書館即時座位資訊

    功能說明：
    - 回傳所有館別的最新座位資料（聚合所有區域）
    - 可選篩選特定館別
    - 資料每 10 分鐘自動更新

    使用範例：
    - 查詢所有館別：`GET /api/v1/realtime`
    - 查詢特定館別：`GET /api/v1/realtime?branch_name=總館`

    注意事項：
    - 如果 `last_updated` 超過 15 分鐘，可能會在 meta 中包含警告訊息
    - `usage_rate` = 1 - (total_free_count / total_seat_count)
    - 座位數會聚合該館所有區域的資料
    """
    seat_data = await get_realtime_seats_aggregated(db, branch_name)

    if branch_name and not seat_data:
        raise HTTPException(
            status_code=404, detail=f"Library '{branch_name}' not found"
        )

    return {
        "data": seat_data,
        "meta": {
            "timestamp": datetime.now().isoformat(),
            "version": "v1",
            "total_count": len(seat_data),
        },
    }

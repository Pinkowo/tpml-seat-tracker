"""
健康檢查 API
"""
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.scheduler import scheduler
from src.database import get_db

router = APIRouter(prefix="/api/v1/health", tags=["health"])


@router.get(
    "",
    summary="健康檢查",
    description="檢查應用程式的健康狀態，包含資料庫連線與排程服務狀態",
    responses={
        200: {
            "description": "健康檢查結果",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "timestamp": "2025-11-01T13:00:00+08:00",
                        "database": "connected",
                        "scheduler": "running",
                    }
                }
            },
        },
    },
)
async def health_check(
    db: AsyncSession = Depends(get_db),
):
    """
    健康檢查端點

    檢查項目：
    - **status**: 整體狀態（healthy/degraded/unhealthy）
    - **database**: 資料庫連線狀態（connected/disconnected）
    - **scheduler**: 排程服務狀態（running/stopped）
    - **timestamp**: 檢查時間

    狀態說明：
    - `healthy`: 所有服務正常運作
    - `degraded`: 部分服務異常但不影響主要功能
    - `unhealthy`: 關鍵服務異常

    使用範例：
    - `GET /api/v1/health`

    適用場景：
    - 監控系統健康檢查
    - Kubernetes liveness/readiness probe
    - Load balancer 健康檢查
    """
    status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
    }

    # 檢查資料庫連線
    try:
        await db.execute(text("SELECT 1"))
        status["database"] = "connected"
    except Exception as e:
        status["database"] = "disconnected"
        status["status"] = "degraded"

    # 檢查 scheduler
    if scheduler.running:
        status["scheduler"] = "running"
    else:
        status["scheduler"] = "stopped"
        status["status"] = "degraded"

    return status


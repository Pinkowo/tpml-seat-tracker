"""
預測 API
"""
from typing import List
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas import PredictionResponse, PredictionItem
from src.services.prediction_service import predict_seats
# TODO: 等待資料庫團隊完成 models
# from src.models.library import Library
# from src.api.dependencies import get_db

router = APIRouter(prefix="/api/v1/predict", tags=["predict"])


@router.get(
    "",
    response_model=dict,
    summary="取得座位數預測",
    description="預測圖書館未來 30 分鐘和 60 分鐘的可用座位數",
    responses={
        200: {
            "description": "成功取得預測結果",
            "content": {
                "application/json": {
                    "example": {
                        "library_id": 1,
                        "predictions": [
                            {
                                "horizon_minutes": 30,
                                "predicted_seats": 50,
                                "is_fallback": False,
                            },
                            {
                                "horizon_minutes": 60,
                                "predicted_seats": 45,
                                "is_fallback": False,
                            },
                        ],
                    }
                }
            },
        },
        404: {"description": "指定的館別不存在"},
    },
)
async def get_prediction(
    branch_name: str = Query(..., description="圖書館分館名稱", example="總館"),
    # db: AsyncSession = Depends(get_db),  # TODO: 等待資料庫團隊完成 T022
):
    """
    取得座位數預測
    
    功能說明：
    - 回傳未來 30 分鐘和 60 分鐘的預測座位數
    - 使用機器學習模型進行預測
    - 如果模型不可用，自動使用移動平均 fallback
    
    預測機制：
    1. 優先使用 Champion 模型（表現最佳的模型）
    2. 若模型載入失敗，使用移動平均（過去 3 個相同時段的平均）
    3. `is_fallback=True` 表示使用 fallback 機制
    
    使用範例：
    - `GET /api/v1/predict?branch_name=總館`
    
    注意事項：
    - 預測模型每日 03:00 自動重新訓練
    - Fallback 預測的準確度可能較低，前端應顯示「估」badge
    """
    # TODO: 實際實作需要等待資料庫 models
    # library = await get_library_by_name(db, branch_name)
    # if not library:
    #     raise HTTPException(status_code=404, detail=f"Library '{branch_name}' not found")
    # 
    # predictions = []
    # for horizon in [30, 60]:
    #     predicted_seats, is_fallback = await predict_seats(
    #         library.id, horizon, db
    #     )
    #     predictions.append(
    #         PredictionItem(
    #             horizon_minutes=horizon,
    #             predicted_seats=predicted_seats,
    #             is_fallback=is_fallback,
    #         )
    #     )
    # 
    # return PredictionResponse(
    #     library_id=library.id,
    #     predictions=predictions,
    # )
    
    # 暫時回傳範例資料
    return {
        "library_id": 0,  # TODO
        "predictions": [
            {"horizon_minutes": 30, "predicted_seats": 0, "is_fallback": True},
            {"horizon_minutes": 60, "predicted_seats": 0, "is_fallback": True},
        ],
    }


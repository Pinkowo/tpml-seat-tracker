"""
預測服務（Fallback 邏輯）
"""
from typing import Optional
from loguru import logger

from src.services.model_storage import load_model
# TODO: 等待資料庫團隊完成 models
# from src.models.seat import SeatHistory
# from sqlalchemy.ext.asyncio import AsyncSession


async def predict_seats(
    library_id: int,
    horizon_minutes: int = 30,
    # db: AsyncSession,
) -> tuple[int, bool]:
    """
    預測未來指定時間點的座位數
    
    Args:
        library_id: 圖書館 ID
        horizon_minutes: 預測時間點（分鐘）
    
    Returns:
        (預測座位數, 是否為 fallback)
    """
    # 1. 嘗試載入 champion model
    # TODO: 從 model_registry 取得 champion model type
    champion_model = await load_model(library_id, "prophet")  # 暫時假設
    
    if champion_model:
        try:
            # 使用模型預測
            prediction = champion_model.predict(horizon_minutes)
            logger.info(f"使用模型預測: {prediction}")
            return int(prediction), False
        except Exception as e:
            logger.warning(f"模型預測失敗: {e}，改用 fallback")
    
    # 2. Fallback: 移動平均
    predicted_seats = await fallback_moving_average(
        library_id, horizon_minutes
        # db
    )
    logger.info(f"使用移動平均預測: {predicted_seats}")
    return predicted_seats, True


async def fallback_moving_average(
    library_id: int,
    horizon_minutes: int,
    # db: AsyncSession,
) -> int:
    """
    Fallback 邏輯：使用移動平均
    
    計算過去 3 個相同時段的平均座位數
    
    Args:
        library_id: 圖書館 ID
        horizon_minutes: 預測時間點
    
    Returns:
        預測座位數
    """
    # TODO: 實際實作需要等待資料庫 models
    # from datetime import datetime, timedelta
    # 
    # # 計算目標時間（現在 + horizon_minutes）
    # target_time = datetime.now() + timedelta(minutes=horizon_minutes)
    # target_hour = target_time.hour
    # target_weekday = target_time.weekday()
    # 
    # # 取得過去 3 週相同時段的資料
    # similar_records = []
    # for weeks_ago in range(1, 4):  # 過去 1-3 週
    #     past_date = target_time - timedelta(weeks=weeks_ago)
    #     records = await db.execute(
    #         select(SeatHistory)
    #         .where(SeatHistory.branch_name == library_id)
    #         .where(SeatHistory.collected_at.hour == target_hour)
    #         .where(SeatHistory.collected_at.weekday() == target_weekday)
    #         .where(
    #             SeatHistory.collected_at.between(
    #                 past_date - timedelta(hours=1),
    #                 past_date + timedelta(hours=1),
    #             )
    #         )
    #     )
    #     similar_records.extend(records.scalars().all())
    # 
    # if similar_records:
    #     # 計算平均可用座位數
    #     avg_free = sum(r.free_count for r in similar_records) / len(similar_records)
    #     return int(avg_free)
    # else:
    #     # 如果沒有歷史資料，回傳當前座位數
    #     current = await get_current_seats(db, library_id)
    #     return current
    
    # 暫時回傳 0
    return 0


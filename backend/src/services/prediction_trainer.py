"""
預測訓練服務（Task B）
"""
from typing import Dict, Any
from loguru import logger

from src.services.model_storage import save_model, load_model
# TODO: 等待資料庫團隊完成 models
# from src.models.seat import SeatHistory
# from src.models.prediction import ModelRegistry
# from sqlalchemy.ext.asyncio import AsyncSession


async def train_prediction_models(
    library_id: int,
    # db: AsyncSession,
) -> None:
    """
    訓練預測模型（Prophet/RandomForest/LSTM）
    
    Args:
        library_id: 圖書館 ID
    
    Process:
        1. 取得過去 90 天的 seat_history
        2. 訓練 3 種模型
        3. 計算 MAPE
        4. 比較 Champion/Challenger
    """
    logger.info(f"開始訓練圖書館 {library_id} 的預測模型...")
    
    # TODO: 實際實作需要等待資料庫 models
    # # 1. 取得訓練資料（過去 90 天）
    # from datetime import datetime, timedelta
    # cutoff_date = datetime.now() - timedelta(days=90)
    # 
    # history_records = await db.execute(
    #     select(SeatHistory)
    #     .where(SeatHistory.branch_name == library_id)
    #     .where(SeatHistory.collected_at >= cutoff_date)
    #     .order_by(SeatHistory.collected_at)
    # )
    # 
    # if len(history_records) < 100:  # 至少需要 100 筆資料
    #     logger.warning(f"訓練資料不足（{len(history_records)} 筆），跳過訓練")
    #     return
    # 
    # # 2. 訓練 3 種模型
    # models = {}
    # for model_type in ["prophet", "random_forest", "lstm"]:
    #     if model_type == "prophet":
    #         model = train_prophet_model(history_records)
    #     elif model_type == "random_forest":
    #         model = train_random_forest_model(history_records)
    #     elif model_type == "lstm":
    #         model = train_lstm_model(history_records)
    #     
    #     # 計算 MAPE（驗證集）
    #     metrics = evaluate_model(model, validation_data)
    #     models[model_type] = (model, metrics)
    # 
    # # 3. Champion/Challenger 比較
    # champion = await get_champion_model(db, library_id)
    # 
    # for model_type, (model_obj, metrics) in models.items():
    #     if champion:
    #         champion_mape = champion.metrics.get("mape", float("inf"))
    #         challenger_mape = metrics["mape"]
    #         
    #         # 如果 challenger 比 champion 好至少 5%
    #         if challenger_mape < champion_mape * 0.95:
    #             # 升級為新的 champion
    #             await update_champion_model(db, library_id, model_type, metrics)
    #             await save_model(library_id, model_type, model_obj, metrics)
    #             logger.info(f"模型 {model_type} 成為新的 champion（MAPE: {challenger_mape:.2f}%）")
    #         else:
    #             logger.info(f"模型 {model_type} 未達標（MAPE: {challenger_mape:.2f}%，需要 < {champion_mape * 0.95:.2f}%）")
    #     else:
    #         # 第一個模型成為 champion
    #         await set_champion_model(db, library_id, model_type, metrics)
    #         await save_model(library_id, model_type, model_obj, metrics)
    #         logger.info(f"模型 {model_type} 成為首個 champion（MAPE: {metrics['mape']:.2f}%）")
    
    logger.info(f"圖書館 {library_id} 的預測模型訓練完成")


# TODO: 實作具體的模型訓練函式
# def train_prophet_model(data):
#     """訓練 Prophet 模型"""
#     pass
# 
# def train_random_forest_model(data):
#     """訓練 RandomForest 模型"""
#     pass
# 
# def train_lstm_model(data):
#     """訓練 LSTM 模型"""
#     pass


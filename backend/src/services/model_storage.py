"""
模型持久化工具
"""
import pickle
import os
from pathlib import Path
from typing import Any, Optional
from loguru import logger

# 模型儲存目錄
MODEL_STORAGE_DIR = Path("models")


async def save_model(
    library_id: int,
    model_type: str,
    model_obj: Any,
    metrics: dict,
) -> None:
    """
    儲存模型到檔案系統
    
    Args:
        library_id: 圖書館 ID
        model_type: 模型類型（prophet, random_forest, lstm）
        model_obj: 模型物件
        metrics: 評估指標（MAPE, RMSE 等）
    """
    # 建立目錄
    library_dir = MODEL_STORAGE_DIR / f"library_{library_id}"
    library_dir.mkdir(parents=True, exist_ok=True)
    
    # 儲存模型
    model_path = library_dir / f"{model_type}.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(model_obj, f)
    
    # 儲存指標
    metrics_path = library_dir / f"{model_type}_metrics.json"
    import json
    with open(metrics_path, "w") as f:
        json.dump(metrics, f)
    
    logger.info(f"模型已儲存: {model_path}")


async def load_model(
    library_id: int,
    model_type: str,
) -> Optional[Any]:
    """
    載入模型
    
    Args:
        library_id: 圖書館 ID
        model_type: 模型類型
    
    Returns:
        模型物件，如果不存在則回傳 None
    """
    model_path = MODEL_STORAGE_DIR / f"library_{library_id}" / f"{model_type}.pkl"
    
    if not model_path.exists():
        logger.warning(f"模型不存在: {model_path}")
        return None
    
    try:
        with open(model_path, "rb") as f:
            model_obj = pickle.load(f)
        logger.info(f"模型已載入: {model_path}")
        return model_obj
    except Exception as e:
        logger.error(f"載入模型失敗: {e}")
        return None


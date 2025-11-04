"""
結構化日誌設定（使用 loguru）
"""
import sys
from loguru import logger

from src.config import settings


def setup_logger() -> None:
    """設定 loguru logger"""
    # 移除預設的 handler
    logger.remove()

    # 新增 console handler
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.log_level,
        colorize=True,
    )

    # 新增檔案 handler（可選，用於 production）
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",
        rotation="00:00",  # 每天午夜輪轉
        retention="30 days",  # 保留 30 天
        level=settings.log_level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        compression="zip",  # 壓縮舊日誌
    )


# 初始化 logger
setup_logger()


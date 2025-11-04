"""
排程任務管理（APScheduler）
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from loguru import logger

from src.services.seat_collector import collect_seat_data
from src.services.prediction_trainer import train_prediction_models
from src.services.library_sync import sync_library_metadata

scheduler = AsyncIOScheduler()


def register_jobs() -> None:
    """註冊所有排程任務"""
    
    # Task A: 每 10 分鐘收集座位資料
    scheduler.add_job(
        collect_seat_data,
        trigger=IntervalTrigger(minutes=10),
        id="collect_seat_data",
        name="收集座位資料",
        misfire_grace_time=300,  # 5 分鐘寬限期
        coalesce=True,  # 合併重複觸發
    )
    
    # Task B: 每日 03:00 訓練預測模型
    scheduler.add_job(
        train_all_libraries,
        trigger=CronTrigger(hour=3, minute=0),
        id="train_prediction_models",
        name="訓練預測模型",
        misfire_grace_time=3600,  # 1 小時寬限期
    )
    
    # Task C: 每日 02:00 同步圖書館 metadata
    scheduler.add_job(
        sync_library_metadata,
        trigger=CronTrigger(hour=2, minute=0),
        id="sync_library_metadata",
        name="同步圖書館資料",
        misfire_grace_time=3600,  # 1 小時寬限期
    )
    
    logger.info("排程任務已註冊")


async def train_all_libraries() -> None:
    """對所有圖書館訓練預測模型"""
    # TODO: 取得所有圖書館列表
    # libraries = await get_all_libraries()
    # for library in libraries:
    #     await train_prediction_models(library.id)
    logger.info("開始訓練所有圖書館的預測模型...")


def start_scheduler() -> None:
    """啟動 scheduler"""
    register_jobs()
    scheduler.start()
    logger.info("排程服務已啟動")


def shutdown_scheduler() -> None:
    """關閉 scheduler"""
    scheduler.shutdown()
    logger.info("排程服務已關閉")


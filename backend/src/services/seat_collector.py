"""
座位資料收集服務（Task A）
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any
import httpx
from loguru import logger

from src.config import settings
from src.services.retry import retry

# TODO: 等待資料庫團隊完成 models 後，import SeatRealtime 和 SeatHistory
# from src.models.seat import SeatRealtime, SeatHistory
# from sqlalchemy.ext.asyncio import AsyncSession


@retry(max_attempts=3, delay=60, exceptions=(httpx.HTTPError, httpx.RequestError))
async def fetch_seat_data_from_external_api() -> List[Dict[str, Any]]:
    """
    從外部 API 取得座位資料

    Returns:
        座位資料列表
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            settings.external_api_url,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def collect_seat_data(
    # db: AsyncSession
) -> None:
    """
    收集座位資料並同步到資料庫

    流程：
    1. 呼叫外部 API
    2. 解析回應
    3. 生成 batch_id
    4. 雙寫：UPDATE seat_realtime + INSERT INTO seat_history
    """
    try:
        logger.info("開始收集座位資料...")

        # 1. 呼叫外部 API（含重試邏輯）
        raw_data = await fetch_seat_data_from_external_api()
        logger.info(f"成功取得 {len(raw_data)} 筆座位資料")

        # 2. 生成 batch_id
        batch_id = uuid.uuid4()
        collected_at = datetime.now()

        # 3. 解析資料並聚合
        # TODO: 實際實作需要等待資料庫 models
        # aggregated_data = {}
        # for area in raw_data:
        #     branch_name = area["branch_name"]
        #     if branch_name not in aggregated_data:
        #         aggregated_data[branch_name] = {
        #             "total_free": 0,
        #             "total_seats": 0,
        #         }
        #     aggregated_data[branch_name]["total_free"] += area["free_count"]
        #     aggregated_data[branch_name]["total_seats"] += area["total_count"]
        #
        #     # 插入 seat_history
        #     history_record = SeatHistory(
        #         batch_id=batch_id,
        #         branch_name=branch_name,
        #         floor_name=area.get("floor_name"),
        #         area_name=area.get("area_name"),
        #         area_id=area.get("area_id"),
        #         free_count=area["free_count"],
        #         total_count=area["total_count"],
        #         collected_at=collected_at,
        #     )
        #     db.add(history_record)
        #
        # # 4. UPSERT seat_realtime
        # for branch_name, totals in aggregated_data.items():
        #     await db.execute(
        #         update(SeatRealtime)
        #         .where(SeatRealtime.branch_name == branch_name)
        #         .values(
        #             total_free_count=totals["total_free"],
        #             total_seat_count=totals["total_seats"],
        #             last_updated=collected_at,
        #             batch_id=batch_id,
        #         )
        #     )
        #
        # await db.commit()
        logger.info(f"座位資料收集完成，batch_id: {batch_id}")

    except Exception as e:
        logger.exception(f"座位資料收集失敗: {e}")
        raise

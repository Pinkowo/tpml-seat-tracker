"""
資料填充腳本

用於填充初始測試資料，從臺北市資料大平臺 API 取得真實資料
包含：
- library_info: 圖書館基本資料
- seat_realtime: 即時座位資訊
- seat_history: 座位歷史資料
- prediction_results: 預測結果

執行方式：
    python scripts/seed_data.py
或
    docker-compose exec backend python scripts/seed_data.py
"""

import asyncio
import sys
import httpx
from datetime import datetime, timedelta
from uuid import uuid4
from pathlib import Path

# 加入專案根目錄到 path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.models.library import Library
from src.models.seat import SeatRealtime, SeatHistory
from src.models.prediction import PredictionResult, ModelRegistry
from src.config import settings


# 臺北市資料大平臺 API
TAIPEI_DATA_API = "https://data.taipei/api/v1/dataset/030195ba-f22b-4044-8902-218979678044?scope=resourceAquire&limit=100"

# 座位資料 API
SEAT_API = "https://seat.tpml.edu.tw/sm/service/getAllArea"


def generate_open_hours() -> dict:
    """
    生成標準營業時間
    週一到週五：08:30-21:00
    週六到週日：09:00-17:00
    """
    return {
        "monday": {"open": "08:30", "close": "21:00"},
        "tuesday": {"open": "08:30", "close": "21:00"},
        "wednesday": {"open": "08:30", "close": "21:00"},
        "thursday": {"open": "08:30", "close": "21:00"},
        "friday": {"open": "08:30", "close": "21:00"},
        "saturday": {"open": "09:00", "close": "17:00"},
        "sunday": {"open": "09:00", "close": "17:00"},
    }


def estimate_seats_from_name(branch_name: str) -> dict:
    """
    根據分館名稱估算座位數
    """
    # 總館通常座位最多
    if "總館" in branch_name:
        total_seats = 300
        current_free = 85
    # 分館通常中等規模
    elif "分館" in branch_name:
        # 根據名稱 hash 生成不同的座位數（20-150之間）
        total_seats = 50 + (hash(branch_name) % 100)
        current_free = int(total_seats * (0.3 + (hash(branch_name) % 40) / 100))
    # 民眾閱覽室通常較小
    else:
        total_seats = 30 + (hash(branch_name) % 50)
        current_free = int(total_seats * (0.2 + (hash(branch_name) % 50) / 100))

    return {
        "total_seats": max(20, total_seats),  # 最少20個座位
        "current_free": max(0, min(current_free, total_seats)),
    }


async def fetch_libraries_from_api() -> list:
    """
    從臺北市資料大平臺 API 取得圖書館資料
    """
    print("正在從臺北市資料大平臺取得圖書館資料...")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(TAIPEI_DATA_API)
            response.raise_for_status()
            data = response.json()

            libraries = []
            results = data.get("result", {}).get("results", [])

            print(f"✓ 成功取得 {len(results)} 個分館資料")

            for item in results:
                name = item.get("name", "").strip()
                address = item.get("address", "").strip()
                tel = item.get("tel", "").strip()
                lat = item.get("lat", "")
                lon = item.get("lon", "")

                # 跳過缺少必要資料的分館
                if not name or not lat or not lon:
                    continue

                try:
                    latitude = float(lat)
                    longitude = float(lon)
                except (ValueError, TypeError):
                    continue

                # 格式化電話（加上 02- 如果沒有區域碼）
                if tel and not tel.startswith("02-"):
                    if len(tel.replace("-", "")) == 8:  # 8位數電話
                        tel = f"02-{tel}"
                    else:
                        tel = tel

                # 估算座位數
                seats = estimate_seats_from_name(name)

                libraries.append(
                    {
                        "branch_name": name,
                        "address": address,
                        "phone": tel if tel else None,
                        "latitude": latitude,
                        "longitude": longitude,
                        "open_hours": generate_open_hours(),
                        "total_seats": seats["total_seats"],
                        "current_free": seats["current_free"],
                    }
                )

            return libraries

    except Exception as e:
        print(f"⚠ 無法從 API 取得資料: {e}")
        print("使用預設測試資料...")
        return get_default_libraries_data()


def get_default_libraries_data() -> list:
    """
    預設測試資料（當 API 無法使用時）
    """
    return [
        {
            "branch_name": "總館",
            "address": "臺北市建國南路二段125號",
            "phone": "02-2755-2823",
            "latitude": 25.0265,
            "longitude": 121.5378,
            "open_hours": {
                "monday": {"open": "08:30", "close": "21:00"},
                "tuesday": {"open": "08:30", "close": "21:00"},
                "wednesday": {"open": "08:30", "close": "21:00"},
                "thursday": {"open": "08:30", "close": "21:00"},
                "friday": {"open": "08:30", "close": "21:00"},
                "saturday": {"open": "09:00", "close": "17:00"},
                "sunday": {"open": "09:00", "close": "17:00"},
            },
            "total_seats": 300,
            "current_free": 85,
        },
        {
            "branch_name": "大安分館",
            "address": "臺北市大安區辛亥路三段223號5樓",
            "phone": "02-2733-6900",
            "latitude": 25.0189,
            "longitude": 121.5431,
            "open_hours": {
                "monday": {"open": "09:00", "close": "21:00"},
                "tuesday": {"open": "09:00", "close": "21:00"},
                "wednesday": {"open": "09:00", "close": "21:00"},
                "thursday": {"open": "09:00", "close": "21:00"},
                "friday": {"open": "09:00", "close": "21:00"},
                "saturday": {"open": "09:00", "close": "17:00"},
                "sunday": None,  # 週日休館
            },
            "total_seats": 50,
            "current_free": 12,
        },
        {
            "branch_name": "松山分館",
            "address": "臺北市松山區八德路四段688號",
            "phone": "02-2753-1871",
            "latitude": 25.0496,
            "longitude": 121.5777,
            "open_hours": {
                "monday": {"open": "08:30", "close": "21:00"},
                "tuesday": {"open": "08:30", "close": "21:00"},
                "wednesday": {"open": "08:30", "close": "21:00"},
                "thursday": {"open": "08:30", "close": "21:00"},
                "friday": {"open": "08:30", "close": "21:00"},
                "saturday": {"open": "09:00", "close": "17:00"},
                "sunday": {"open": "09:00", "close": "17:00"},
            },
            "total_seats": 120,
            "current_free": 45,
        },
        {
            "branch_name": "信義分館",
            "address": "臺北市信義區松勤街50號",
            "phone": "02-2723-8194",
            "latitude": 25.0329,
            "longitude": 121.5684,
            "open_hours": {
                "monday": {"open": "09:00", "close": "21:00"},
                "tuesday": {"open": "09:00", "close": "21:00"},
                "wednesday": {"open": "09:00", "close": "21:00"},
                "thursday": {"open": "09:00", "close": "21:00"},
                "friday": {"open": "09:00", "close": "21:00"},
                "saturday": {"open": "09:00", "close": "17:00"},
                "sunday": {"open": "09:00", "close": "17:00"},
            },
            "total_seats": 80,
            "current_free": 28,
        },
        {
            "branch_name": "中崙分館",
            "address": "臺北市松山區長安東路二段229號",
            "phone": "02-8773-6858",
            "latitude": 25.0481,
            "longitude": 121.5491,
            "open_hours": {
                "monday": {"open": "08:30", "close": "21:00"},
                "tuesday": {"open": "08:30", "close": "21:00"},
                "wednesday": {"open": "08:30", "close": "21:00"},
                "thursday": {"open": "08:30", "close": "21:00"},
                "friday": {"open": "08:30", "close": "21:00"},
                "saturday": {"open": "09:00", "close": "17:00"},
                "sunday": {"open": "09:00", "close": "17:00"},
            },
            "total_seats": 150,
            "current_free": 62,
        },
    ]


async def seed_libraries(db: AsyncSession, libraries_data: list) -> dict[str, Library]:
    """填充圖書館基本資料"""
    from sqlalchemy import select

    libraries = {}

    for lib_data in libraries_data:
        # 檢查是否已存在
        result = await db.execute(
            select(Library).where(Library.branch_name == lib_data["branch_name"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"✓ {lib_data['branch_name']} 已存在，跳過")
            libraries[lib_data["branch_name"]] = existing
        else:
            library = Library(
                branch_name=lib_data["branch_name"],
                address=lib_data["address"],
                phone=lib_data["phone"],
                latitude=lib_data["latitude"],
                longitude=lib_data["longitude"],
                open_hours=lib_data["open_hours"],
            )
            db.add(library)
            await db.flush()  # 確保 library.id 被設置
            libraries[lib_data["branch_name"]] = library
            print(f"✓ 新增 {lib_data['branch_name']}")

    await db.commit()
    return libraries


async def seed_seat_realtime(
    db: AsyncSession, libraries: dict[str, Library], libraries_data: list
):
    """填充即時座位資料（從真實 API）"""
    from sqlalchemy import select

    print("正在從座位 API 取得即時座位資料...")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(SEAT_API)
            response.raise_for_status()
            seat_data = response.json()

            print(f"✓ 成功取得 {len(seat_data)} 筆座位區域資料")

            now = datetime.now()
            batch_id = uuid4()

            # 重新查詢所有 library_id，避免 detached 狀態問題
            library_ids = {}
            for branch_name in libraries.keys():
                result = await db.execute(
                    select(Library.id).where(
                        Library.branch_name.ilike(f"%{branch_name}%")
                    )
                )
                library_id = result.scalar_one_or_none()
                if library_id:
                    library_ids[branch_name] = library_id

            for area in seat_data:
                branch_name = area.get("branchName", "").strip()
                if not branch_name or branch_name not in library_ids:
                    continue

                library_id = library_ids[branch_name]
                area_id = str(area.get("areaId", ""))

                # 檢查是否已存在（根據 library_id 和 area_id）
                result = await db.execute(
                    select(SeatRealtime).where(
                        SeatRealtime.library_id == library_id,
                        SeatRealtime.area_id == area_id,
                    )
                )
                existing = result.scalar_one_or_none()

                if existing:
                    # 更新現有資料
                    existing.floor_name = area.get("floorName")
                    existing.area_name = area.get("areaName")
                    existing.free_count = area.get("freeCount", 0)
                    existing.total_count = area.get("totalCount", 0)
                    existing.last_updated = now
                    existing.batch_id = batch_id
                    print(
                        f"✓ 更新 {branch_name} {area.get('floorName')} {area.get('areaName')} 即時座位資料 ({area.get('freeCount', 0)}/{area.get('totalCount', 0)})"
                    )
                else:
                    # 新增資料
                    seat_realtime = SeatRealtime(
                        library_id=library_id,
                        floor_name=area.get("floorName"),
                        area_name=area.get("areaName"),
                        area_id=area_id,
                        free_count=area.get("freeCount", 0),
                        total_count=area.get("totalCount", 0),
                        last_updated=now,
                        batch_id=batch_id,
                    )
                    db.add(seat_realtime)
                    print(
                        f"✓ 新增 {branch_name} {area.get('floorName')} {area.get('areaName')} 即時座位資料 ({area.get('freeCount', 0)}/{area.get('totalCount', 0)})"
                    )

            await db.commit()

    except Exception as e:
        print(f"⚠ 無法從 API 取得座位資料: {e}")
        print("使用預設資料...")
        # 回退到原本的邏輯
        await seed_seat_realtime_fallback(db, libraries, libraries_data)


async def seed_seat_realtime_fallback(
    db: AsyncSession, libraries: dict[str, Library], libraries_data: list
):
    """填充即時座位資料（回退方法）"""
    from sqlalchemy import select

    now = datetime.now()
    batch_id = uuid4()

    # 重新查詢所有 library_id，避免 detached 狀態問題
    library_ids = {}
    for branch_name in libraries.keys():
        result = await db.execute(
            select(Library.id).where(Library.branch_name.ilike(f"%{branch_name}%"))
        )
        library_id = result.scalar_one_or_none()
        if library_id:
            library_ids[branch_name] = library_id

    for lib_data in libraries_data:
        branch_name = lib_data["branch_name"]

        if branch_name not in library_ids:
            continue

        library_id = library_ids[branch_name]

        # Fallback 模式下，使用聚合資料作為單一區域記錄
        # 檢查是否已存在（根據 library_id，fallback 模式下 area_id 為空）
        result = await db.execute(
            select(SeatRealtime).where(
                SeatRealtime.library_id == library_id,
                SeatRealtime.area_id.is_(None),  # fallback 記錄沒有 area_id
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            # 更新現有資料
            existing.free_count = lib_data["current_free"]
            existing.total_count = lib_data["total_seats"]
            existing.last_updated = now
            existing.batch_id = batch_id
            print(f"✓ 更新 {branch_name} 即時座位資料（預設）")
        else:
            # 新增資料（fallback 模式下沒有區域詳細資訊）
            seat_realtime = SeatRealtime(
                library_id=library_id,
                floor_name=None,
                area_name=None,
                area_id=None,
                free_count=lib_data["current_free"],
                total_count=lib_data["total_seats"],
                last_updated=now,
                batch_id=batch_id,
            )
            db.add(seat_realtime)
            print(f"✓ 新增 {branch_name} 即時座位資料（預設）")

    await db.commit()


async def seed_seat_history(db: AsyncSession, libraries: dict[str, Library]):
    """填充座位歷史資料（從真實 API）"""
    from sqlalchemy import select, func

    # 檢查是否已有歷史資料
    result = await db.execute(select(func.count(SeatHistory.id)))
    count = result.scalar()

    if count > 0:
        print(f"✓ 已有 {count} 筆歷史資料，跳過")
        return

    print("正在從座位 API 取得歷史座位資料...")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(SEAT_API)
            response.raise_for_status()
            seat_data = response.json()

            print(f"✓ 成功取得 {len(seat_data)} 筆座位區域資料")

            now = datetime.now()
            batch_id = uuid4()

            # 重新查詢所有 library_id，避免 detached 狀態問題
            library_ids = {}
            for branch_name in libraries.keys():
                result = await db.execute(
                    select(Library.id).where(
                        Library.branch_name.ilike(f"%{branch_name}%")
                    )
                )
                library_id = result.scalar_one_or_none()
                if library_id:
                    library_ids[branch_name] = library_id

            for area in seat_data:
                branch_name = area.get("branchName", "").strip()
                if not branch_name or branch_name not in library_ids:
                    continue

                library_id = library_ids[branch_name]

                seat_history = SeatHistory(
                    batch_id=batch_id,
                    library_id=library_id,
                    floor_name=area.get("floorName"),
                    area_name=area.get("areaName"),
                    area_id=str(area.get("areaId", "")),
                    free_count=area.get("freeCount", 0),
                    total_count=area.get("totalCount", 0),
                    collected_at=now,
                    source_updated_at=now,
                )
                db.add(seat_history)

            await db.commit()
            print(f"✓ 完成歷史資料填充（{len(seat_data)} 筆區域資料）")

    except Exception as e:
        print(f"⚠ 無法從 API 取得座位資料: {e}")
        await db.rollback()  # 明確 rollback
        print("跳過歷史資料填充...")


async def seed_predictions(
    db: AsyncSession, libraries: dict[str, Library], libraries_data: list
):
    """填充預測結果"""
    from sqlalchemy import select

    now = datetime.now()

    try:
        # 重新查詢所有 library_id，避免 detached 狀態問題
        library_ids = {}
        for branch_name in libraries.keys():
            result = await db.execute(
                select(Library.id).where(Library.branch_name == branch_name)
            )
            library_id = result.scalar_one_or_none()
            if library_id:
                library_ids[branch_name] = library_id

        for lib_data in libraries_data:
            branch_name = lib_data["branch_name"]

            if branch_name not in library_ids:
                continue

            library_id = library_ids[branch_name]

            # 檢查是否已有預測資料
            result = await db.execute(
                select(PredictionResult).where(
                    PredictionResult.library_id == library_id,
                    PredictionResult.prediction_time >= now - timedelta(hours=1),
                )
            )
            existing = result.scalars().first()

            if existing:
                print(f"✓ {branch_name} 已有預測資料，跳過")
                continue

            current_free = lib_data["current_free"]

            # 模擬預測值（基於當前座位數，加上一些變動）
            # 30分鐘後：稍微減少（人們繼續使用）
            predicted_30 = max(0, current_free - 5)
            # 60分鐘後：可能回升或繼續減少
            predicted_60 = max(0, current_free - 10)

            # 插入 30 分鐘預測
            pred_30 = PredictionResult(
                library_id=library_id,
                prediction_time=now,
                predicted_seats=predicted_30,
                horizon_minutes=30,
                model_version="prophet_v1.0",
            )
            db.add(pred_30)

            # 插入 60 分鐘預測
            pred_60 = PredictionResult(
                library_id=library_id,
                prediction_time=now,
                predicted_seats=predicted_60,
                horizon_minutes=60,
                model_version="prophet_v1.0",
            )
            db.add(pred_60)

            print(
                f"✓ 新增 {branch_name} 預測資料 (30min: {predicted_30}, 60min: {predicted_60})"
            )

        await db.commit()
    except Exception as e:
        print(f"⚠ 填充預測結果失敗: {e}")
        await db.rollback()
        raise


async def seed_model_registry(db: AsyncSession, libraries: dict[str, Library]):
    """填充模型註冊表（Champion 模型）"""
    from sqlalchemy import select

    now = datetime.now()

    # 重新查詢所有 library_id，避免 detached 狀態問題
    library_ids = {}
    for branch_name in libraries.keys():
        result = await db.execute(
            select(Library.id).where(Library.branch_name == branch_name)
        )
        library_id = result.scalar_one_or_none()
        if library_id:
            library_ids[branch_name] = library_id

    for branch_name, library_id in library_ids.items():
        # 檢查是否已有模型
        result = await db.execute(
            select(ModelRegistry).where(
                ModelRegistry.library_id == library_id,
                ModelRegistry.status == "champion",
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"✓ {branch_name} 已有模型註冊，跳過")
            continue

        model = ModelRegistry(
            library_id=library_id,
            model_type="prophet",
            version="v1.0",
            status="champion",
            mape=15.5,  # 模擬 MAPE 15.5%
            activated_at=now,
        )
        db.add(model)
        print(f"✓ 新增 {branch_name} 模型註冊 (Prophet v1.0, MAPE: 15.5%)")

    await db.commit()


async def main():
    """主函數"""
    print("=" * 60)
    print("開始填充測試資料...")
    print("=" * 60)

    # 從 API 取得圖書館資料
    LIBRARIES_DATA = await fetch_libraries_from_api()
    print(f"\n將填充 {len(LIBRARIES_DATA)} 個圖書館分館")

    # 建立資料庫連線
    engine = create_async_engine(
        settings.database_url,
        echo=False,
    )
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    try:
        async with async_session() as db:
            # 1. 填充圖書館基本資料
            print("\n[1/5] 填充圖書館基本資料...")
            libraries = await seed_libraries(db, LIBRARIES_DATA)

            # 2. 填充即時座位資料
            print("\n[2/5] 填充即時座位資料...")
            await seed_seat_realtime(db, libraries, LIBRARIES_DATA)

            # 3. 填充座位歷史資料（從真實 API）
            print("\n[3/5] 填充座位歷史資料...")
            await seed_seat_history(db, libraries)

            # 4. 填充預測結果
            print("\n[4/5] 填充預測結果...")
            await seed_predictions(db, libraries, LIBRARIES_DATA)

            # 5. 填充模型註冊表
            print("\n[5/5] 填充模型註冊表...")
            await seed_model_registry(db, libraries)

        print("\n" + "=" * 60)
        print("資料填充完成！")
        print("=" * 60)
        print("\n你可以測試 API：")
        print("  GET http://localhost:8000/api/v1/libraries")
        print("  GET http://localhost:8000/api/v1/realtime")
        print("  GET http://localhost:8000/api/v1/predict?branch_name=總館")

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())

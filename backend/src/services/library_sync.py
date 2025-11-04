"""
圖書館 metadata 同步服務（Task C）
"""
import httpx
from loguru import logger

from src.config import settings
from src.services.retry import retry
# TODO: 等待資料庫團隊完成 models
# from src.models.library import Library
# from sqlalchemy.ext.asyncio import AsyncSession


@retry(max_attempts=3, delay=60, exceptions=(httpx.HTTPError, httpx.RequestError))
async def fetch_library_metadata_from_external_api() -> list:
    """
    從外部 API 取得圖書館列表
    
    Returns:
        圖書館 metadata 列表
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.external_api_url}/libraries",
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def sync_library_metadata(
    # db: AsyncSession
) -> None:
    """
    同步圖書館 metadata
    
    流程：
    1. 呼叫外部 API 取得圖書館列表
    2. UPSERT library_info 表（更新現有、插入新館）
    3. 標記已移除的館別
    """
    try:
        logger.info("開始同步圖書館 metadata...")
        
        # 1. 取得外部資料
        external_libraries = await fetch_library_metadata_from_external_api()
        logger.info(f"成功取得 {len(external_libraries)} 個圖書館的 metadata")
        
        # TODO: 實際實作需要等待資料庫 models
        # # 2. 取得現有圖書館
        # existing_libraries = await get_all_libraries(db)
        # existing_branch_names = {lib.branch_name for lib in existing_libraries}
        # external_branch_names = {lib["branch_name"] for lib in external_libraries}
        # 
        # # 3. UPSERT（更新或插入）
        # for lib_data in external_libraries:
        #     library = await db.execute(
        #         select(Library)
        #         .where(Library.branch_name == lib_data["branch_name"])
        #     )
        #     library = library.scalar_one_or_none()
        #     
        #     if library:
        #         # 更新現有
        #         library.address = lib_data["address"]
        #         library.phone = lib_data.get("phone")
        #         library.latitude = lib_data["latitude"]
        #         library.longitude = lib_data["longitude"]
        #         library.open_hours = lib_data["open_hours"]
        #         library.updated_at = datetime.now()
        #     else:
        #         # 插入新館
        #         library = Library(**lib_data)
        #         db.add(library)
        # 
        # # 4. 標記已移除的館別（標記為 inactive 或刪除）
        # removed_branches = existing_branch_names - external_branch_names
        # for branch_name in removed_branches:
        #     library = await db.execute(
        #         select(Library)
        #         .where(Library.branch_name == branch_name)
        #     )
        #     library = library.scalar_one()
        #     library.is_active = False  # 或直接刪除
        # 
        # await db.commit()
        logger.info("圖書館 metadata 同步完成")
        
    except Exception as e:
        logger.exception(f"圖書館 metadata 同步失敗: {e}")
        raise


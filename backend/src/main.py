"""
圖書館座位地圖與預測系統 - FastAPI 應用程式
"""

import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.config import settings
from src.api.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler,
)
from src.services.logger import logger
from src.api.routes import libraries, realtime, predict, health
from src.services.scheduler import start_scheduler, shutdown_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程式生命週期管理"""
    # 測試環境跳過 scheduler 啟動
    if os.getenv("TESTING") != "1":
        # Startup
        logger.info("應用程式啟動中...")
        logger.info(
            f"環境設定: LOG_LEVEL={settings.log_level}, API_BASE_URL={settings.api_base_url}"
        )

        # 啟動 scheduler
        start_scheduler()

    yield

    # Shutdown
    if os.getenv("TESTING") != "1":
        shutdown_scheduler()
        logger.info("應用程式關閉中...")


app = FastAPI(
    title="圖書館座位追蹤系統 API",
    description="提供圖書館座位即時狀態、預測與查詢功能",
    version="0.1.0",
    lifespan=lifespan,
    contact={
        "name": "TPML Seat Tracker Team",
    },
    license_info={
        "name": "MIT",
    },
)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: 在 production 中限制為 frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """記錄每個請求的資訊"""
    start_time = time.time()

    # 記錄請求
    logger.info(f"{request.method} {request.url.path}")

    # 處理請求
    response = await call_next(request)

    # 計算處理時間
    duration = time.time() - start_time

    # 記錄回應
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {duration:.3f}s"
    )

    return response


# Exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# API routes
app.include_router(libraries.router)
app.include_router(realtime.router)
app.include_router(predict.router)
app.include_router(health.router)


@app.get(
    "/health",
    summary="簡單健康檢查（相容性端點）",
    description="簡單的健康檢查端點，用於相容舊版 API 或簡單的負載平衡器檢查",
    tags=["health"],
)
async def simple_health_check():
    """
    簡單健康檢查端點（相容性）

    注意：完整健康檢查請使用 `/api/v1/health`
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

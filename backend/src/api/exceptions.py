"""
HTTP 錯誤處理
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from loguru import logger


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """處理 HTTP 例外"""
    logger.warning(
        f"HTTP {exc.status_code}: {exc.detail} - {request.method} {request.url}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": f"HTTP {exc.status_code}", "detail": exc.detail},
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """處理請求驗證錯誤"""
    logger.warning(f"Validation error: {exc.errors()} - {request.method} {request.url}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """處理一般例外"""
    logger.exception(f"Unhandled exception: {exc} - {request.method} {request.url}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred",
        },
    )


"""
錯誤追蹤整合點
"""
from loguru import logger


def capture_exception(exception: Exception, context: dict = None) -> None:
    """
    捕獲例外並記錄
    
    Args:
        exception: 例外物件
        context: 額外上下文資訊
    """
    logger.exception(
        f"Unhandled exception: {exception}",
        extra=context or {},
    )
    
    # TODO: 整合 Sentry 或其他錯誤追蹤服務
    # import sentry_sdk
    # sentry_sdk.capture_exception(exception, contexts={"custom": context})


def capture_message(message: str, level: str = "error", context: dict = None) -> None:
    """
    捕獲訊息並記錄
    
    Args:
        message: 訊息內容
        level: 日誌層級
        context: 額外上下文資訊
    """
    if level == "error":
        logger.error(message, extra=context or {})
    elif level == "warning":
        logger.warning(message, extra=context or {})
    else:
        logger.info(message, extra=context or {})
    
    # TODO: 整合 Sentry
    # import sentry_sdk
    # sentry_sdk.capture_message(message, level=level)


"""
座位資料收集器的 unit tests
"""

import pytest
from unittest.mock import AsyncMock, Mock, patch
import httpx


@pytest.mark.asyncio
async def test_fetch_seat_data_success():
    """測試成功取得座位資料"""
    mock_data = [
        {
            "branch_name": "總館",
            "floor_name": "2F",
            "area_name": "自習室 A",
            "free_count": 10,
            "total_count": 20,
        }
    ]

    # Mock settings 和 httpx
    with patch("src.services.seat_collector.settings") as mock_settings, patch(
        "httpx.AsyncClient"
    ) as mock_client_class:

        mock_settings.external_api_url = "https://test-api.example.com/seats"

        # 建立 mock response
        mock_response = Mock()
        mock_response.json.return_value = mock_data
        mock_response.raise_for_status = Mock()  # raise_for_status 不是 async

        # Mock async context manager 和 get 方法
        mock_client_instance = AsyncMock()
        mock_client_instance.get = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(
            return_value=mock_client_instance
        )
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=False)

        # Mock retry decorator 為 no-op，避免測試卡住
        def no_op_retry(**kwargs):
            def decorator(func):
                return func  # 直接返回原函數，不包裝

            return decorator

        with patch("src.services.retry.retry", no_op_retry):
            # 重新 import 以使用新的 retry decorator
            import importlib
            import src.services.seat_collector

            importlib.reload(src.services.seat_collector)

            from src.services.seat_collector import fetch_seat_data_from_external_api

            result = await fetch_seat_data_from_external_api()
            assert result == mock_data
            # 確認 get 被呼叫了
            assert mock_client_instance.get.called


@pytest.mark.asyncio
async def test_fetch_seat_data_retry_on_failure():
    """測試 API 失敗時的重試邏輯"""
    with patch("src.services.seat_collector.settings") as mock_settings, patch(
        "httpx.AsyncClient"
    ) as mock_client_class:

        mock_settings.external_api_url = "https://test-api.example.com/seats"

        # 前兩次失敗，第三次成功
        mock_response_fail = Mock()
        mock_response_fail.raise_for_status.side_effect = httpx.HTTPError(
            "Connection error"
        )

        mock_response_success = Mock()
        mock_response_success.json.return_value = []
        mock_response_success.raise_for_status = Mock()  # raise_for_status 不是 async

        # Mock async context manager 和 get 方法
        mock_client_instance = AsyncMock()
        # get 方法前兩次失敗，第三次成功
        mock_client_instance.get = AsyncMock(
            side_effect=[
                mock_response_fail,
                mock_response_fail,
                mock_response_success,
            ]
        )
        mock_client_class.return_value.__aenter__ = AsyncMock(
            return_value=mock_client_instance
        )
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=False)

        # Mock retry decorator，保留重試邏輯但 delay 為 0
        def no_delay_retry(
            max_attempts=3, delay=60, backoff=1, exceptions=(Exception,)
        ):
            def decorator(func):
                async def wrapper(*args, **kwargs):
                    last_exception = None
                    for attempt in range(1, max_attempts + 1):
                        try:
                            return await func(*args, **kwargs)
                        except exceptions as e:
                            last_exception = e
                            if attempt < max_attempts:
                                # 不延遲，直接重試
                                continue
                    if last_exception:
                        raise last_exception
                    raise RuntimeError("Retry failed without exception")

                return wrapper

            return decorator

        with patch("src.services.retry.retry", no_delay_retry):
            # 重新 import 以使用新的 retry decorator
            import importlib
            import src.services.seat_collector

            importlib.reload(src.services.seat_collector)

            from src.services.seat_collector import fetch_seat_data_from_external_api

            # 現在會重試，但不會延遲
            result = await fetch_seat_data_from_external_api()
            assert result == []
            # 確認 get 被呼叫了 3 次（重試邏輯）
            assert mock_client_instance.get.call_count == 3


@pytest.mark.asyncio
async def test_collect_seat_data_integration():
    """測試收集座位資料的整合流程"""
    # 這個測試需要 mock 資料庫操作
    # 目前暫時跳過，等待資料庫 models 完成
    pass

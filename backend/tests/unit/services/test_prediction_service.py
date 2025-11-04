"""
Fallback 邏輯（移動平均）的 unit tests
"""
import pytest
from unittest.mock import AsyncMock, patch

from src.services.prediction_service import predict_seats, fallback_moving_average


@pytest.mark.asyncio
async def test_predict_seats_with_model():
    """測試使用模型預測"""
    # Mock 載入模型成功
    # predict 不是 async 函數，使用普通 Mock
    from unittest.mock import Mock
    mock_model = Mock()
    mock_model.predict.return_value = 50
    
    with patch("src.services.prediction_service.load_model", return_value=mock_model):
        predicted_seats, is_fallback = await predict_seats(
            library_id=1,
            horizon_minutes=30,
        )
        
        assert predicted_seats == 50
        assert is_fallback is False


@pytest.mark.asyncio
async def test_predict_seats_model_failure():
    """測試模型失敗時使用 fallback"""
    # Mock 載入模型失敗
    with patch("src.services.prediction_service.load_model", return_value=None):
        with patch("src.services.prediction_service.fallback_moving_average", new_callable=AsyncMock, return_value=45):
            predicted_seats, is_fallback = await predict_seats(
                library_id=1,
                horizon_minutes=30,
            )
            
            assert predicted_seats == 45
            assert is_fallback is True


@pytest.mark.asyncio
async def test_predict_seats_model_exception():
    """測試模型預測時發生例外，應使用 fallback"""
    # predict 不是 async 函數，使用普通 Mock
    from unittest.mock import Mock
    mock_model = Mock()
    mock_model.predict.side_effect = Exception("Model error")
    
    with patch("src.services.prediction_service.load_model", return_value=mock_model):
        with patch("src.services.prediction_service.fallback_moving_average", new_callable=AsyncMock, return_value=40):
            predicted_seats, is_fallback = await predict_seats(
                library_id=1,
                horizon_minutes=30,
            )
            
            assert predicted_seats == 40
            assert is_fallback is True


@pytest.mark.asyncio
async def test_fallback_moving_average():
    """測試移動平均計算"""
    # TODO: 實際實作需要等待資料庫 models
    # 測試案例：
    # 過去 3 週相同時段的座位數：50, 55, 45
    # 預期平均值：50
    pass


@pytest.mark.asyncio
async def test_fallback_no_history_data():
    """測試沒有歷史資料時使用當前座位數"""
    # TODO: 實際實作需要等待資料庫 models
    # 當沒有歷史資料時，應該回傳當前座位數
    pass


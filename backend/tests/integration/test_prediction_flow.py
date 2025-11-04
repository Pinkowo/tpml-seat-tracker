"""
預測資料流的 integration tests
"""
import pytest

# TODO: 這個測試需要完整的資料庫設定和模型訓練邏輯
# 流程：
# 1. 收集資料（mock 外部 API）
# 2. 插入 seat_history
# 3. 更新 seat_realtime
# 4. 訓練模型
# 5. 預測
# 6. 驗證結果


@pytest.mark.asyncio
async def test_prediction_flow_complete():
    """測試完整的預測流程"""
    # TODO: 等待資料庫 models 完成後實作
    # 這個測試需要：
    # - 測試資料庫連線
    # - Mock 外部 API
    # - 實際的模型訓練邏輯
    # - 驗證預測結果
    pass


@pytest.mark.asyncio
async def test_collect_train_predict_cycle():
    """測試收集→訓練→預測的完整循環"""
    # TODO: 等待資料庫 models 完成後實作
    pass


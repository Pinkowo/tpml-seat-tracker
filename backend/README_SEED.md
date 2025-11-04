# 資料填充腳本說明

## 用途

用於填充初始測試資料，讓 API 可以正常回傳資料。

## 執行方式

### 方式一：在 Docker 容器內執行

```bash
# 從專案根目錄執行
docker-compose exec backend python scripts/seed_data.py
```

### 方式二：本地執行（需要先啟動資料庫）

```bash
cd backend
export DATABASE_URL="postgresql+asyncpg://tpml_user:tpml_password@localhost:5432/tpml_seat_tracker"
python scripts/seed_data.py
```

## 填充的資料

腳本會填充以下資料：

1. **library_info** (3個分館)
   - 總館
   - 大安分館
   - 松山分館
   - 包含地址、電話、經緯度、營業時間等完整資料

2. **seat_realtime** (即時座位資料)
   - 每個分館的當前可用座位數和總座位數
   - 最後更新時間

3. **prediction_results** (預測結果)
   - 每個分館的 30 分鐘和 60 分鐘預測
   - 使用 Prophet v1.0 模型

4. **model_registry** (模型註冊表)
   - 每個分館的 Champion 模型註冊
   - MAPE: 15.5%

## 資料來源

參考台北市立圖書館的真實資料格式，包含：
- 真實的地址和電話
- 真實的經緯度座標
- 實際的營業時間

## 注意事項

- 如果資料已存在，腳本會跳過，不會重複插入
- 可以重複執行，不會造成重複資料
- 歷史資料（seat_history）不會自動填充，需要由排程任務產生

## 測試 API

填充完成後，可以測試以下 API：

```bash
# 取得所有圖書館
curl "http://localhost:8000/api/v1/libraries?user_lat=25.033&user_lng=121.5654&sort_by=distance"

# 取得即時座位資料
curl "http://localhost:8000/api/v1/realtime"

# 取得預測結果
curl "http://localhost:8000/api/v1/predict?branch_name=總館"
```


-- 初始化資料庫 extensions
-- 此檔案會在 PostgreSQL 容器啟動時自動執行

-- UUID 生成（用於 batch_id）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 地理距離計算（用於計算使用者與圖書館的距離）
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- 確認 extensions 已安裝
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'cube', 'earthdistance');

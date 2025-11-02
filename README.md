# TPML Seat Tracker

TPML Seat Tracker 是一套協助使用者即時查詢圖書館座位狀況的全端專案。專案採用 React 18 + Vite 作為前端框架，後端與資料處理由對應的 `backend/` 目錄負責。本說明聚焦於前端應用的開發與部署流程。

## 專案結構

```
.
├── backend/             # 後端與資料處理
├── frontend/            # React + TypeScript 前端程式碼
├── specs/               # 專案規格文件與設計稿
└── README.md            # 本檔案
```

## 先決條件

- Node.js 18 或 20
- npm 10 以上（專案使用 `npm ci` / `npm run` 指令）
- 可用的 Mapbox Access Token（若無則地圖會顯示提示訊息，其他功能仍可運作）

## 快速開始（本地開發）

1. 安裝依賴
   ```bash
   cd frontend
   npm install
   ```
2. 設定環境變數
   ```bash
   cp .env.example .env
   # 編輯 .env，填入您的 Mapbox token 與 API base URL
   ```
3. 啟動開發伺服器
   ```bash
   npm run dev
   ```
4. 開啟瀏覽器造訪 [http://localhost:5173](http://localhost:5173)。

## 重要環境變數

| 變數名稱           | 範例值                 | 說明                                   |
|--------------------|------------------------|----------------------------------------|
| `VITE_MAPBOX_TOKEN` | `pk.xxxxx`             | Mapbox Access Token，用於顯示地圖        |
| `VITE_API_BASE_URL` | `http://localhost:3000` | 後端 API 基底位址（Mock 模式可維持預設值） |

## 常用指令

| 指令                 | 功能                         |
|----------------------|------------------------------|
| `npm run dev`        | 啟動 Vite 開發伺服器          |
| `npm run build`      | 建置靜態檔案 (`dist/`)        |
| `npm run preview`    | 以本地伺服器預覽建置成果      |
| `npm run lint`       | 執行 ESLint 靜態檢查          |
| `npm run test -- --run` | 執行 Vitest 測試（單元、整合） |

## Docker 部署

前端目錄提供一份多階段建置的 Dockerfile：

```bash
cd frontend
docker build -t tpml-seat-tracker-frontend .
docker run -p 8080:80 tpml-seat-tracker-frontend
```

伺服器將透過 Nginx 提供 `dist/` 靜態檔案，並將所有路由導向 `index.html`，確保 SPA 正常運作。

## 測試策略

- **Unit / Hook 測試**：位於 `frontend/tests/unit/`，使用 Vitest 與 Testing Library。
- **Integration 測試**：位於 `frontend/tests/integration/`，涵蓋地圖標記、列表互動、輪詢等關鍵流程。
- 建議在提交前執行 `npm run lint` 與 `npm run test -- --run` 以確保品質。

## 延伸閱讀

- 詳細任務分解與設計規格：`specs/001-library-seat-tracker/`
- 設計變數與色彩系統：`specs/design/design-tokens.css`
- 如需後端設定，請參考 `backend/` 目錄下的 README 或對應文件。

---

若有部署或整合需求（例如 CI/CD、雲端環境參數設定），請與後端與 DevOps 團隊協調後調整本說明。

# 前端團隊任務清單

## 團隊資訊

- **負責範圍**: React UI 元件、使用者互動邏輯、Mapbox 地圖整合、狀態管理
- **總任務數**: 57 個任務
- **預估工時**: 8-10 天（假設 2 位開發者平行作業）
- **技術棧**: React 18, TypeScript, Vite, Redux Toolkit, React Query, Mapbox GL JS, Tailwind CSS, Vitest

## ⚠️ 共享任務（需協調）

- **T003**: docker-compose.yml（與資料庫/後端團隊協調，前端可能需要 dev server 設定）
- **T104**: README.md（與後端團隊協調整體專案說明）

## 依賴關係

### 依賴後端團隊
- **Phase 3（US1）**: 需等待 T038-T040（GET /libraries, /realtime API）完成
- **Phase 4（US2）**: 需等待 T050-T051（排序 API）完成
- **Phase 5（US3）**: 需等待 T057-T059（營業時間 API）完成
- **Phase 6（US4）**: 需等待 T075（GET /predict API）完成

**策略**: 前端可在後端 API 未完成前，使用 mock data 進行開發與測試

### 不阻塞其他團隊
- 前端工作不會阻塞後端或資料庫團隊
- 可獨立開發、測試、除錯

## 關鍵里程碑

1. **Milestone 1**: Phase 1 完成 → 前端專案結構與依賴項安裝完成
2. **Milestone 2**: Phase 2 完成 → 核心架構就緒（Redux, React Query, routing）
3. **Milestone 3**: Phase 3 完成 → US1 地圖功能完成（可使用 mock data 或整合後端 API）
4. **Milestone 4**: Phase 4 完成 → US2 列表排序完成
5. **Milestone 5**: Phase 5 完成 → US3 營業時間顯示完成
6. **Milestone 6**: Phase 6 完成 → US4 預測顯示完成
7. **Milestone 7**: Phase 7 完成 → US5 自動更新與輪詢完成
8. **Milestone 8**: Phase 8 完成 → UI Polish 與無障礙支援完成

---

## Phase 1: 前端設置與測試基礎設施

**目標**: 建立前端專案結構、安裝依賴、設定測試環境

**預估工時**: 1 天

**⚠️ 前置**: 無依賴，可立即開始

### 1.1 專案結構與設定

- [ ] T002 [P] 建立 frontend 目錄結構 (frontend/src/{components,pages,store,services,hooks,types}/) in frontend/src/
  - **目錄**: components/, pages/, store/, services/, hooks/, types/, tests/
  - **子目錄**: components/map/, components/library-list/, components/library-detail/, components/info-footer/

- [ ] T005 [P] 建立 frontend/.env.example，包含 Mapbox token 佔位符 in frontend/.env.example
  - **變數**: VITE_MAPBOX_TOKEN, VITE_API_BASE_URL

### 1.2 Vite + React + TypeScript 初始化

- [ ] T011 在 frontend/ 初始化 Vite + React + TypeScript 專案 in frontend/
  - **命令**: `npm create vite@latest frontend -- --template react-ts`
  - **檢查**: package.json, vite.config.ts, tsconfig.json

- [ ] T012 在 frontend/package.json 安裝依賴項: Mapbox GL JS, React Query, @reduxjs/toolkit react-redux, Tailwind CSS in frontend/package.json
  - **核心**:
    - mapbox-gl, @types/mapbox-gl
    - @tanstack/react-query
    - @reduxjs/toolkit, react-redux
    - tailwindcss, postcss, autoprefixer
    - react-router-dom
  - **工具**: @types/node, clsx

- [ ] T012a [P] 在 frontend/src/index.html 引入 Town Pass 設計系統 in frontend/src/index.html
  - **設計規範**: 引入 `specs/design/design-tokens.css` 到專案
  - **用途**: 提供完整的 Town Pass 色彩系統、字體、間距等 CSS 變數
  - **文件**: 參考 `specs/design/README.md` 了解如何使用設計變數
  - **引入方式**:
    ```html
    <link rel="stylesheet" href="/specs/design/design-tokens.css">
    ```

- [ ] T013 [P] 在 frontend/tailwind.config.js 設定 Tailwind CSS in frontend/tailwind.config.js
  - **Content paths**: "./src/**/*.{js,ts,jsx,tsx}"
  - **設計規範**: 擴展 Tailwind 設定以使用 Town Pass 色彩系統
  - **Theme 自訂顏色**:
    - Primary: `#5AB4C5`
    - Secondary: `#F5BA4B`
    - 座位狀態 - 有空位: `#76A732` (Green/500)
    - 座位狀態 - 已滿: `#ADB8BE` (Grey/300)
    - 座位狀態 - 無資料: `#FFFFFF` + 邊框 `#91A0A8`
  - **參考**: `specs/design/design-tokens.css`

- [ ] T014 [P] 在 frontend/tsconfig.json 設定 TypeScript strict mode in frontend/tsconfig.json
  - **Strict options**: strict: true, noImplicitAny: true
  - **Path aliases**: @/ → ./src/

- [ ] T015 [P] 在 frontend/ 設定 ESLint 與 Prettier in frontend/
  - **ESLint**: react, typescript plugins
  - **Prettier**: semi: true, singleQuote: true

### 1.3 測試基礎設施

- [ ] T015b [P] 在 frontend/package.json 安裝 Vitest 與 @testing-library/react in frontend/package.json
  - **套件**: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom

- [ ] T015d [P] 建立 frontend/tests/ 目錄結構 (unit/, integration/, setup.ts) in frontend/tests/
  - **目錄**: unit/, integration/
  - **檔案**: setup.ts, __mocks__/

- [ ] T015f [P] 在 frontend/ 設定 vitest.config.ts in frontend/vitest.config.ts
  - **設定**: environment: 'jsdom', setupFiles: ['./tests/setup.ts']

---

## Phase 2: 核心架構

**目標**: 建立 React Router、Redux store、React Query、API client

**預估工時**: 1-1.5 天

**⚠️ 前置**: Phase 1 完成

### 2.1 核心設定（可平行執行）

- [ ] T029 [P] 在 frontend/src/App.tsx 建立 App.tsx，包含 React Router 設定 in frontend/src/App.tsx
  - **Routes**:
    - `/` → HomePage
    - 未來可擴充其他 routes
  - **Layout**: 包含 ErrorBoundary

- [ ] T030 [P] 在 frontend/src/store/index.ts 使用 Redux Toolkit 建立 Redux store 設定 in frontend/src/store/index.ts
  - **Slices**: 未來新增（例如：uiSlice for modal state）
  - **Middleware**: Redux Toolkit 預設 middleware

- [ ] T031 [P] 在 frontend/src/main.tsx 建立 React Query provider 設定 in frontend/src/main.tsx
  - **QueryClient config**:
    - refetchOnWindowFocus: false（Phase 7 會改為 true）
    - staleTime: 0（Phase 7 會設定為 10 分鐘）
  - **Provider 順序**: QueryClientProvider > Redux Provider > App

- [ ] T032 [P] 在 frontend/src/services/api.ts 建立 axios instance，包含 base URL 設定 in frontend/src/services/api.ts
  - **Config**:
    - baseURL: import.meta.env.VITE_API_BASE_URL
    - timeout: 10000
    - headers: { 'Content-Type': 'application/json' }
  - **Interceptors**: Request/response logging

- [ ] T033 [P] 在 frontend/src/types/api.ts 建立 API 回應的 TypeScript types in frontend/src/types/api.ts
  - **Types**: ApiResponse<T>, ApiError, PaginatedResponse<T>

- [ ] T034 [P] 在 frontend/src/components/ErrorBoundary.tsx 建立 error boundary component in frontend/src/components/ErrorBoundary.tsx
  - **功能**: Catch React errors, 顯示 fallback UI
  - **Logging**: 記錄錯誤到 console（Phase 8 會整合錯誤追蹤）

**檢查點**: 核心架構完成 - 可開始實作 User Story UI

---

## Phase 3: User Story 1 - 快速查找附近有空位的圖書館 (優先度: P1) 🎯 MVP

**目標**: 實作地圖顯示、標記渲染、圖書館詳細資訊 modal

**預估工時**: 2.5-3 天

**⚠️ 依賴後端**: T038-T040（GET /libraries, /realtime API）
**策略**: 可先使用 mock data 開發，後端 API 就緒後再整合

### 3.1 Types 與 Hooks（可平行執行）

- [ ] T041 [P] [US1] 在 frontend/src/hooks/useGeolocation.ts 建立 useGeolocation hook，取得使用者位置 in frontend/src/hooks/useGeolocation.ts
  - **功能**: 使用 navigator.geolocation API
  - **回傳**: `{ location: {lat, lng} | null, error: string | null, loading: boolean }`
  - **權限**: 處理 permission denied

- [ ] T042 [P] [US1] 在 frontend/src/types/library.ts 建立 Library 與 SeatStatus 的 TypeScript types in frontend/src/types/library.ts
  - **Types**:
    ```typescript
    interface Library {
      id: number;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      distance?: number; // meters
    }
    
    interface SeatStatus {
      library: Library;
      available_seats: number;
      total_seats: number;
      updated_at: string;
    }
    ```

- [ ] T047 [P] [US1] 在 frontend/src/hooks/useLibraryData.ts 使用 React Query 建立 useLibraryData hook in frontend/src/hooks/useLibraryData.ts
  - **Queries**:
    - `useLibraries(userLat, userLng)` → GET /api/v1/libraries
    - `useRealtimeSeats()` → GET /api/v1/realtime
  - **Options**: staleTime, cacheTime, retry

### 3.2 地圖元件（依序執行）

- [ ] T043 [US1] 在 frontend/src/components/map/MapView.tsx 建立 Mapbox 地圖初始化元件 in frontend/src/components/map/MapView.tsx
  - **⚠️ 依賴**: T041（useGeolocation）完成
  - **設計規範**: 參考 `specs/design/components.md` - 地圖區域規格
  - **功能**:
    - 初始化 Mapbox map
    - 設定中心點（使用者位置或預設台北）
    - Zoom level: 12
  - **Props**: onMarkerClick, selectedLibraryId

- [ ] T044 [US1] 在 frontend/src/components/map/MarkerLayer.tsx 建立標記渲染，包含顏色邏輯（綠/灰/白） in frontend/src/components/map/MarkerLayer.tsx
  - **⚠️ 依賴**: T043（MapView）完成
  - **設計規範**: 參考 `specs/design/components.md` - 地圖標記 (Map Marker)
  - **顏色使用 Town Pass 系統**:
    - 🟢 有空位: `#76A732` (Green/500) - available_seats > 0
    - ⚫ 座位已滿: `#ADB8BE` (Grey/300) - available_seats === 0
    - ⚪ 無資料: `#FFFFFF` + 邊框 `#91A0A8` (Grey/400) - 無資料時
  - **尺寸**: 40x40px (Mobile 觸控友善)
  - **圓角**: 完全圓形 (`border-radius: 50%`)
  - **陰影**: `0 4px 12px rgba(0, 0, 0, 0.15)`
  - **Active 狀態**: 點擊時 `scale(1.2)`，增加陰影
  - **互動**: 觸覺回饋 (Haptic Feedback)
  - **無障礙**: `role="button"`, `aria-label="圖書館名稱，目前有 X 個空位"`
    - 灰色: available_seats = 0
    - 白色: 無資料
  - **互動**: Click → 觸發 onMarkerClick

### 3.3 UI 元件（可平行執行）

- [ ] T045 [P] [US1] 在 frontend/src/components/info-footer/InfoFooter.tsx 建立資訊頁尾元件，包含圖例 in frontend/src/components/info-footer/InfoFooter.tsx
  - **設計規範**: 參考 `specs/design/README.md` - 底部滑動面板規格
  - **內容**:
    - 顏色圖例（綠/灰/白）
    - 說明文字（14px/Regular）
  - **位置**: Fixed bottom, 透明背景
  - **顏色**: 使用 Town Pass 系統色彩

- [ ] T046 [US1] 在 frontend/src/components/library-detail/LibraryDetail.tsx 建立圖書館詳細資訊 modal，包含座位資訊與導航 in frontend/src/components/library-detail/LibraryDetail.tsx
  - **設計規範**: 參考 `specs/design/components.md` - 詳細資訊頁面 (Detail Page)
  - **頂部彩色區塊**:
    - 背景: 主色 `#5AB4C5` (Primary/500)
    - 文字: 白色
    - 標題: H1 (36px/Semibold) 或 H2 (24px/Semibold)
    - 返回按鈕: 44x44px，圓形，白色半透明背景 `rgba(255, 255, 255, 0.2)`
  - **座位資訊卡片**:
    - 浮起效果: 陰影 `0 4px 20px rgba(11, 13, 14, 0.1)`
    - 圓角: 20px
    - 內距: 32px 24px
    - 座位數字: 超大字體 48px/Bold
    - 數字顏色: 可用座位 `#76A732`，已滿 `#ADB8BE`
  - **資訊列表**:
    - 圖示: 24x24px，主色 `#5AB4C5`
    - 標籤: 12px/Regular，顏色 `#91A0A8` (Grey/400)
    - 內容: 16px/Regular，顏色 `#30383D` (Grey/800)
  - **導航按鈕**: 參考 `specs/design/components.md` - 導航按鈕規格
    - 寬度: 100%
    - 背景: 主色 `#5AB4C5`
    - 圓角: 12px
    - 內距: 16px
    - 字體: 16px/Semibold
  - **互動**: Close button, 點擊外部關閉

### 3.4 頁面整合

- [ ] T048 [US1] 在 frontend/src/pages/HomePage.tsx 整合地圖與資訊頁尾 in frontend/src/pages/HomePage.tsx
  - **⚠️ 依賴**: T043-T046 完成
  - **Layout**:
    - MapView（全螢幕）
    - InfoFooter（bottom overlay）
    - LibraryDetail modal（conditional render）
  - **State**: selectedLibraryId（控制 modal）

### 3.5 測試 (US1)

- [ ] T048e [P] [US1] 在 frontend/tests/integration/test_map_markers.test.ts 使用 mock API 撰寫地圖標記渲染的 integration tests in frontend/tests/integration/test_map_markers.test.ts
  - **測試案例**:
    - 標記正確渲染
    - 顏色邏輯正確
    - Click 開啟 modal

- [ ] T048f [P] [US1] 在 frontend/tests/unit/hooks/test_useGeolocation.test.ts 撰寫 useGeolocation hook 的 unit tests in frontend/tests/unit/hooks/test_useGeolocation.test.ts
  - **測試案例**: Permission granted, denied, error

**檢查點**: US1 前端完成 - 地圖可顯示圖書館標記

---

## Phase 4: User Story 2 - 透過列表排序快速比較館別 (優先度: P1)

**目標**: 實作圖書館列表、排序切換、與地圖狀態同步

**預估工時**: 1.5-2 天

**⚠️ 依賴後端**: T050-T051（排序 API）
**策略**: 可先使用 mock data 開發

### 4.1 UI 元件（可平行執行）

- [ ] T052 [P] [US2] 在 frontend/src/components/library-list/LibraryList.tsx 建立可收合的圖書館列表容器 in frontend/src/components/library-list/LibraryList.tsx
  - **設計規範**: 參考 `specs/design/components.md` - 底部滑動面板 (Bottom Sheet)
  - **位置**: Fixed bottom（Mobile）/ Fixed top-right（Desktop）
  - **狀態**:
    - 收合: 120px 高度
    - 展開: 80vh 高度
    - 隱藏: translateY(100%)
  - **圓角**: 頂部圓角 24px (`border-radius: 24px 24px 0 0`)
  - **陰影**: `0 -4px 24px rgba(11, 13, 14, 0.12)`
  - **手柄**: 48x4px，背景 `#ADB8BE` (Grey/300)，圓角 2px
  - **互動**:
    - 點擊手柄切換展開/收合
    - 上滑/下滑手勢
    - 拖曳跟隨手指
  - **內容**: 圖書館卡片列表（可捲動）

- [ ] T052a [P] [US2] 在 frontend/src/components/library-list/LibraryCard.tsx 建立圖書館卡片元件 in frontend/src/components/library-list/LibraryCard.tsx
  - **設計規範**: 參考 `specs/design/components.md` - 圖書館卡片 (Library Card)
  - **圓角**: 16px
  - **內距**: 20px
  - **間距**: 卡片間 16px
  - **陰影**: `0 2px 8px rgba(11, 13, 14, 0.08)`
  - **Active 狀態**: `scale(0.98)`，背景變為 `#F1F3F4` (Grey/50)
  - **座位數字**:
    - 可用座位: 28px/Semibold，顏色 `#76A732` (有空位) 或 `#ADB8BE` (已滿)
    - 總座位: 18px/Regular，顏色 `#91A0A8` (Grey/400)
  - **狀態標籤**:
    - 圓角: 12px
    - 內距: 4px 12px
    - 字體: 12px/Semibold
    - 有空位: 背景 `rgba(118, 167, 50, 0.1)`，文字 `#76A732`
    - 已滿: 背景 `#E3E7E9` (Grey/100)，文字 `#91A0A8` (Grey/400)
  - **距離標籤**: 12px/Regular，顏色 `#91A0A8`

- [ ] T053 [P] [US2] 在 frontend/src/components/library-list/SortToggle.tsx 建立排序切換按鈕元件 in frontend/src/components/library-list/SortToggle.tsx
  - **設計規範**: 參考 `specs/design/components.md` - 按鈕元件
  - **選項**: "依距離" / "依可用座位"
  - **UI**: Toggle button group
  - **尺寸**: 最小觸控 48x48px
  - **Active 狀態**: 背景主色 `#5AB4C5`，文字白色
  - **Inactive 狀態**: 背景透明，文字主色
  - **State**: sortBy state ("distance" | "seats")

- [ ] T054 [P] [US2] 在 frontend/src/components/library-list/LocationPrompt.tsx 建立位置權限提示 UI in frontend/src/components/library-list/LocationPrompt.tsx
  - **設計規範**: 參考 `specs/design/design-tokens.css` - 提醒色
  - **情境**: 選擇「依距離」但無位置權限
  - **背景**: 提醒色淡化 `rgba(253, 133, 58, 0.1)` (Orange/500 alpha 0.1)
  - **文字**: 提醒色 `#FD853A` (Orange/500)
  - **圓角**: 12px
  - **內距**: 12px 16px
  - **Actions**: "允許" button（觸發 useGeolocation）
    - 按鈕背景: 主色 `#5AB4C5`
    - 按鈕圓角: 8px
    - 按鈕內距: 8px 16px

- [ ] T055 [P] [US2] 在 frontend/src/utils/format.ts 建立距離格式化工具（m vs km，1000m 臨界值） in frontend/src/utils/format.ts
  - **函式**: `formatDistance(meters: number) => string`
  - **邏輯**:
    - < 1000m: "XXX m"
    - ≥ 1000m: "X.X km"

### 4.2 狀態管理與整合

- [ ] T056 [US2] 在 frontend/src/pages/HomePage.tsx 整合圖書館列表與地圖狀態同步 in frontend/src/pages/HomePage.tsx
  - **⚠️ 依賴**: T052-T054 完成
  - **State sync**:
    - 點擊列表項目 → 地圖 center 到該館 + 開啟 modal
    - 點擊地圖標記 → 列表 highlight 該館
  - **Sorting**: sortBy state 傳給 useLibraries hook

### 4.3 測試 (US2)

- [ ] T056c [P] [US2] 在 frontend/tests/integration/test_library_list.test.ts 撰寫列表排序行為的 integration tests in frontend/tests/integration/test_library_list.test.ts
  - **測試案例**:
    - 排序切換更新列表
    - 點擊列表項目同步地圖
    - 距離格式化正確

**檢查點**: US2 前端完成 - 列表與地圖雙向同步

---

## Phase 5: User Story 3 - 查看開館倒數以規劃時間 (優先度: P2)

**目標**: 實作營業時間顯示、閉館倒數警告

**預估工時**: 1 天

**⚠️ 依賴後端**: T057-T059（營業時間 API）
**策略**: 可先使用 mock data 開發

### 5.1 UI 元件（可平行執行）

- [ ] T060 [P] [US3] 在 frontend/src/components/library-detail/OpeningHours.tsx 建立營業時間顯示元件 in frontend/src/components/library-detail/OpeningHours.tsx
  - **設計規範**: 參考 `specs/design/components.md` - 詳細資訊頁面的資訊列表
  - **圖示**: clock icon (24x24px)，顏色 `#5AB4C5` (Primary/500)
  - **標籤**: 12px/Regular，顏色 `#91A0A8` (Grey/400) - "開放時間"
  - **內容**: 16px/Regular，顏色 `#30383D` (Grey/800)
    - 今日營業時間（例如：08:00 - 21:00）
    - 營業狀態（營業中 / 已閉館）
  - **Props**: operatingHours, isOpen

- [ ] T061 [P] [US3] 在 frontend/src/components/library-detail/ClosingWarning.tsx 建立倒數警告元件（60min/15min 臨界值） in frontend/src/components/library-detail/ClosingWarning.tsx
  - **設計規範**: 參考 `specs/design/design-tokens.css` - 語意化顏色
  - **邏輯與樣式**:
    - **≤ 15 分鐘**:
      - 警告色背景 `rgba(212, 82, 81, 0.1)` (Red/500 alpha 0.1)
      - 文字 `#D45251` (Red/500 - Alarm)
      - 文字: "即將閉館（X 分鐘）"
    - **≤ 60 分鐘**:
      - 提醒色背景 `rgba(253, 133, 58, 0.1)` (Orange/500 alpha 0.1)
      - 文字 `#FD853A` (Orange/500 - Reminder)
      - 文字: "距離閉館 X 分鐘"
    - **> 60 分鐘**: 不顯示
  - **圓角**: 12px
  - **內距**: 12px 16px
  - **字體**: 14px/Semibold
  - **Props**: closingInMinutes

- [ ] T062 [P] [US3] 在 frontend/src/components/library-detail/LibraryDetail.tsx 新增閉館狀態樣式（灰色背景） in frontend/src/components/library-detail/LibraryDetail.tsx
  - **設計規範**: 閉館時使用禁用色
  - **樣式**: isOpen=false 時
    - 背景: `#E3E7E9` (Grey/100 - Disable)
    - 文字顏色較淡: `#91A0A8` (Grey/400)
    - 座位數字: `#ADB8BE` (Grey/300)
  - **Disable**: 閉館時，導航按鈕 disabled

### 5.2 整合

- [ ] T063 [US3] 在 frontend/src/components/library-detail/LibraryDetail.tsx 整合營業時間區塊到圖書館詳細資訊 modal in frontend/src/components/library-detail/LibraryDetail.tsx
  - **⚠️ 依賴**: T060-T062 完成
  - **Layout**: OpeningHours + ClosingWarning 在座位資訊下方

### 5.3 測試 (US3)

- [ ] T063b [P] [US3] 在 frontend/tests/integration/test_closing_warning.test.ts 撰寫倒數警告顯示的 integration tests in frontend/tests/integration/test_closing_warning.test.ts
  - **測試案例**:
    - ≤ 15 分鐘顯示紅色警告
    - ≤ 60 分鐘顯示黃色提示
    - > 60 分鐘不顯示

**檢查點**: US3 前端完成 - 營業時間與倒數顯示正確

---

## Phase 6: User Story 4 - 查看座位數預測以提前規劃 (優先度: P2)

**目標**: 實作預測資料顯示、fallback badge

**預估工時**: 1-1.5 天

**⚠️ 依賴後端**: T075（GET /predict API）
**策略**: 可先使用 mock data 開發

### 6.1 Types 與 Hooks（可平行執行）

- [ ] T080 [P] [US4] 在 frontend/src/hooks/usePredictions.ts 使用 React Query 建立 usePredictions hook in frontend/src/hooks/usePredictions.ts
  - **Query**: `usePredictions(branchName)` → GET /api/v1/predict?branch_name=XXX
  - **Options**: enabled（只在 modal 開啟時呼叫）

- [ ] T081 [P] [US4] 在 frontend/src/types/prediction.ts 新增預測的 TypeScript types in frontend/src/types/prediction.ts
  - **Types**:
    ```typescript
    interface PredictionItem {
      horizon_minutes: 30 | 60;
      predicted_seats: number;
      is_fallback: boolean;
    }
    
    interface PredictionResponse {
      library_id: number;
      predictions: PredictionItem[];
    }
    ```

### 6.2 UI 元件（可平行執行）

- [ ] T078 [P] [US4] 在 frontend/src/components/library-detail/PredictionSection.tsx 建立圖書館詳細資訊 modal 的預測顯示區塊 in frontend/src/components/library-detail/PredictionSection.tsx
  - **設計規範**: 參考 `specs/design/components.md` - 詳細資訊頁面的資訊卡片樣式
  - **標題**: H2 (24px/Semibold) - "座位預測"
  - **卡片**:
    - 圓角: 16px
    - 內距: 20px
    - 陰影: `0 2px 8px rgba(11, 13, 14, 0.08)`
    - 背景: 白色
  - **預測數字**:
    - 字體: 18px/Semibold
    - 顏色依座位狀態: `#76A732` (有空位) 或 `#ADB8BE` (已滿)
  - **時間標籤**: 14px/Regular，顏色 `#91A0A8` (Grey/400)
  - **內容**:
    - 30 分鐘後預測座位數
    - 60 分鐘後預測座位數
  - **Loading state**: Skeleton or spinner
  - **Error state**: "預測資料暫時無法取得"

- [ ] T079 [P] [US4] 在 frontend/src/components/library-detail/FallbackBadge.tsx 建立 fallback「估」badge 元件 in frontend/src/components/library-detail/FallbackBadge.tsx
  - **設計規範**: 參考 `specs/design/components.md` - 狀態標籤
  - **顯示條件**: is_fallback=true
  - **背景**: 次要色淡化 `rgba(245, 186, 75, 0.1)` (Secondary/500 alpha 0.1)
  - **文字**: 次要色 `#F5BA4B` (Secondary/500)
  - **圓角**: 12px
  - **內距**: 4px 12px
  - **字體**: 12px/Semibold
  - **文字**: 「估」或「估計值」
  - **Tooltip**: "此預測由歷史平均計算"

### 6.3 整合

- [ ] （整合已包含在 T078）PredictionSection 使用 usePredictions hook 與 FallbackBadge

**檢查點**: US4 前端完成 - 預測資料顯示正確

---

## Phase 7: User Story 5 - 自動更新資料以確保資訊即時性 (優先度: P3)

**目標**: 實作 10 分鐘輪詢、Page Visibility API、手動刷新、過期警告

**預估工時**: 1-1.5 天

**⚠️ 依賴**: Phase 3-6 完成（所有 queries 已建立）

### 7.1 輪詢與刷新邏輯（可平行執行）

- [ ] T086 [P] [US5] 在 frontend/src/main.tsx 設定 React Query，10 分鐘重新拉取間隔 in frontend/src/main.tsx
  - **QueryClient config**:
    - refetchInterval: 600000 (10 分鐘)
    - refetchOnWindowFocus: true
    - staleTime: 600000

- [ ] T087 [P] [US5] 在 frontend/src/hooks/useVisibilityRefresh.ts 實作 Page Visibility API 整合，當頁面隱藏時暫停輪詢 in frontend/src/hooks/useVisibilityRefresh.ts
  - **功能**: 監聽 visibilitychange event
  - **邏輯**:
    - 頁面隱藏 → pause queries
    - 頁面顯示 → resume queries + refetch

- [ ] T088 [P] [US5] 在 frontend/src/components/RefreshButton.tsx 建立手動刷新按鈕元件 in frontend/src/components/RefreshButton.tsx
  - **設計規範**: 參考 `specs/design/components.md` - 按鈕元件
  - **尺寸**: 48x48px 圓形按鈕
  - **背景**: 主色 `#5AB4C5` (Primary/500)
  - **圖示**: 刷新 icon（白色），旋轉動畫 loading 時
  - **Active 狀態**: `scale(0.92)`，背景變深 `#468D9B` (Primary/600)
  - **位置**: Header or list 內
  - **功能**: 點擊 → invalidate all queries → refetch
  - **UI**: Refresh icon + loading spinner（旋轉動畫）

- [ ] T089 [P] [US5] 在 frontend/src/components/StaleDataWarning.tsx 建立過期資料警告（15min 臨界值） in frontend/src/components/StaleDataWarning.tsx
  - **設計規範**: 參考 `specs/design/design-tokens.css` - 提醒色
  - **實作 FR-032**: 資料過期提示
  - **背景**: 提醒色淡化 `rgba(253, 133, 58, 0.1)` (Orange/500 alpha 0.1)
  - **文字**: 提醒色 `#FD853A` (Orange/500)
  - **圓角**: 12px
  - **內距**: 12px 16px
  - **字體**: 14px/Semibold
  - **圖示**: 警告 icon (16x16px)，提醒色
  - **邏輯**: 比對 updated_at 與現在時間
  - **顯示**: updated_at > 15 分鐘前 → 顯示警告 banner
  - **內容**: "資料可能不是最新的，上次更新：XX 分鐘前"
  - **位置**: 固定於頂部或列表上方

### 7.2 整合

- [ ] T090 [US5] 在 frontend/src/components/library-list/LibraryList.tsx 新增載入狀態與樂觀更新到圖書館列表 in frontend/src/components/library-list/LibraryList.tsx
  - **Loading state**: 列表頂部顯示 loading bar
  - **Optimistic update**: Refetch 時不移除現有資料，等新資料到達才更新

### 7.3 測試 (US5)

- [ ] T090a [P] [US5] 在 frontend/tests/integration/test_polling.test.ts 撰寫 10 分鐘輪詢行為的 integration tests in frontend/tests/integration/test_polling.test.ts
  - **測試案例**: 使用 fake timers 驗證 10 分鐘後 refetch

- [ ] T090b [P] [US5] 在 frontend/tests/unit/hooks/test_useVisibilityRefresh.test.ts 撰寫 Page Visibility API 整合的 unit tests in frontend/tests/unit/hooks/test_useVisibilityRefresh.test.ts
  - **測試案例**: 模擬 visibilitychange event

**檢查點**: US5 前端完成 - 自動更新正常運作

---

## Phase 8: 最佳化與跨領域關注點

**目標**: 錯誤監控、無障礙支援、色盲友善、部署

**預估工時**: 1.5-2 天

**⚠️ 依賴**: 所有 User Story UI 完成

### 8.1 錯誤監控

- [ ] T097 [P] 在 frontend/src/services/errorLogger.ts 實作前端錯誤日誌服務 in frontend/src/services/errorLogger.ts
  - **整合**: Sentry or custom logger
  - **Capture**:
    - ErrorBoundary errors
    - API errors
    - Unhandled promise rejections

### 8.2 無障礙支援

- [ ] T098 [P] 在 frontend/src/components/map/ 新增 ARIA labels 到地圖標記與互動元素 in frontend/src/components/map/
  - **ARIA attributes**:
    - aria-label: "圖書館標記：XXX"
    - role: "button"
    - aria-pressed（for selected marker）

- [ ] T099 [P] 在 frontend/src/components/ 新增鍵盤導航支援（Tab 順序，Enter 觸發） in frontend/src/components/
  - **實作**:
    - 地圖標記可 Tab 聚焦
    - Enter 開啟 modal
    - Esc 關閉 modal
  - **Focus management**: Modal 開啟時 focus trap

### 8.3 色盲友善驗證

- [ ] T100 [P] 在 frontend/src/components/map/MarkerLayer.tsx 驗證色盲友善設計（綠/灰/白組合） in frontend/src/components/map/MarkerLayer.tsx
  - **驗證工具**: Chrome DevTools 或 色盲模擬器
  - **調整**: 如果綠/黃不易區分，考慮改用形狀差異（圓形 vs 三角形）

### 8.4 部署

- [ ] T102 [P] 在 frontend/Dockerfile 建立 frontend 的 Dockerfile，使用 nginx in frontend/Dockerfile
  - **Stage 1**: Build (npm run build)
  - **Stage 2**: nginx serve /dist
  - **nginx.conf**: SPA routing (fallback to index.html)

- [ ] T103 [P] 在 frontend/Dockerfile 使用 layer caching 最佳化 Docker image in frontend/Dockerfile
  - **優化**: 先 COPY package.json, 再 npm install, 最後 COPY source

- [ ] T104 [P] 在 README.md 建立完整的 README，包含快速入門指南 in README.md
  - **⚠️ 共享**: 與後端團隊協調整體專案說明
  - **內容**: 專案簡介、功能截圖、本地開發設定、環境變數說明

---

## 並行執行機會

### 可同時進行的任務批次

**批次 1: Phase 1 設置（完全平行）**
```bash
同時執行:
- T002: frontend 目錄結構
- T005: .env.example
- T011-T015: Vite + React 專案初始化
- T015b, T015d, T015f: 測試設定
```

**批次 2: Phase 2 核心架構（完全平行）**
```bash
同時執行:
- T029: App.tsx with routing
- T030: Redux store
- T031: React Query provider
- T032: axios instance
- T033: TypeScript types
- T034: ErrorBoundary
```

**批次 3: Phase 3 US1（高度平行）**
```bash
Developer A（地圖）:
- T041: useGeolocation hook
- T042: TypeScript types
- T043: MapView
- T044: MarkerLayer
- T048f: useGeolocation tests

Developer B（UI）:
- T045: InfoFooter
- T046: LibraryDetail modal
- T047: useLibraryData hook
- T048e: Map integration tests

最後整合:
- T048: HomePage integration
```

**批次 4: Phase 4 US2（平行）**
```bash
Developer A:
- T052: LibraryList
- T053: SortToggle
- T056c: Tests

Developer B:
- T054: LocationPrompt
- T055: formatDistance utility

最後整合:
- T056: HomePage state sync
```

**批次 5: Phase 5 US3（完全平行）**
```bash
同時執行:
- T060: OpeningHours component
- T061: ClosingWarning component
- T062: LibraryDetail styles
- T063b: Tests

最後整合:
- T063: LibraryDetail integration
```

**批次 6: Phase 6 US4（平行）**
```bash
Developer A:
- T078: PredictionSection
- T079: FallbackBadge

Developer B:
- T080: usePredictions hook
- T081: TypeScript types
```

**批次 7: Phase 7 US5（完全平行）**
```bash
同時執行:
- T086: React Query config
- T087: useVisibilityRefresh hook
- T088: RefreshButton
- T089: StaleDataWarning
- T090a, T090b: Tests

最後整合:
- T090: LibraryList loading states
```

**批次 8: Phase 8 Polish（完全平行）**
```bash
同時執行:
- T097: Error logging
- T098: ARIA labels
- T099: Keyboard navigation
- T100: Color blind validation
- T102-T103: Dockerfile
- T104: README
```

---

## 任務統計

### 依 Phase 分布

| Phase | 任務數 | 預估工時 | 依賴後端 |
|-------|--------|----------|----------|
| Phase 1: 設置 | 9 | 1天 | ❌ |
| Phase 2: 核心架構 | 6 | 1-1.5天 | ❌ |
| Phase 3: US1 地圖 | 9 | 2.5-3天 | ⚠️ 可用 mock |
| Phase 4: US2 列表 | 5 | 1.5-2天 | ⚠️ 可用 mock |
| Phase 5: US3 營業時間 | 4 | 1天 | ⚠️ 可用 mock |
| Phase 6: US4 預測 | 4 | 1-1.5天 | ⚠️ 可用 mock |
| Phase 7: US5 輪詢 | 6 | 1-1.5天 | ❌ |
| Phase 8: Polish | 7 | 1.5-2天 | ❌ |
| **總計** | **50** | **10-13天** | - |

### 依優先度分布

- **P0（基礎設施）**: 15 個任務（Phase 1 + Phase 2）
- **P1（MVP）**: 14 個任務（Phase 3 + Phase 4）
- **P2**: 8 個任務（Phase 5 + Phase 6）
- **P3**: 6 個任務（Phase 7）
- **Polish**: 7 個任務（Phase 8）

### 測試任務統計

- **Unit tests**: 3 個任務
- **Integration tests**: 5 個任務
- **測試覆蓋率目標**: >70%（UI 元件 + hooks）

---

## 執行建議

### 兩位開發者平行策略

**Week 1**:
- **Day 1**: 兩人一起完成 Phase 1 & Phase 2（設置與核心架構）
- **Day 2-4**:
  - Developer A: Phase 3（US1 地圖功能）- MapView, MarkerLayer
  - Developer B: Phase 3（US1 UI 元件）- InfoFooter, LibraryDetail
- **Day 5**:
  - 兩人一起整合 Phase 3（HomePage）
  - 開始 Phase 4（US2 列表）

**Week 2**:
- **Day 1**:
  - Developer A: 完成 Phase 4（US2）
  - Developer B: Phase 5（US3 營業時間）
- **Day 2**:
  - Developer A: Phase 6（US4 預測）
  - Developer B: Phase 7（US5 輪詢）開始
- **Day 3**:
  - Developer A: 協助完成 Phase 7
  - Developer B: Phase 8（Polish）開始
- **Day 4-5**:
  - 兩人一起完成 Phase 8
  - 整合測試與 bug 修復

### 驗證檢查清單

**Phase 2 完成檢查**:
- [ ] `npm run dev` 啟動成功
- [ ] React Router 正常運作
- [ ] Redux DevTools 可連線
- [ ] API client 可呼叫（測試 health endpoint）

**Phase 3 完成檢查**:
- [ ] 地圖正確顯示
- [ ] 使用者位置定位成功（或處理 permission denied）
- [ ] 標記正確渲染，顏色邏輯正確
- [ ] 點擊標記開啟 modal
- [ ] Modal 顯示正確資訊

**Phase 4 完成檢查**:
- [ ] 列表可展開/收合
- [ ] 排序切換更新列表
- [ ] 點擊列表項目同步地圖
- [ ] 距離顯示正確（m vs km）

**Phase 7 完成檢查**:
- [ ] 10 分鐘自動 refetch（使用 DevTools Network tab 驗證）
- [ ] 切換分頁後回來會 refetch
- [ ] 手動刷新按鈕正常運作
- [ ] 過期警告正確顯示

**Phase 8 完成檢查**:
- [ ] Tab 可遍歷所有互動元素
- [ ] Enter 可觸發按鈕
- [ ] Esc 關閉 modal
- [ ] 色盲模式下，標記仍可區分
- [ ] Dockerfile build 成功
- [ ] npm run build 成功，dist/ 可用 nginx serve

---

## 與其他團隊的交接點

### 從後端團隊接收

1. **Phase 2 完成後**:
   - 取得 API base URL
   - 取得 OpenAPI 文件 URL（/docs）
   - 確認 CORS 設定正確

2. **Phase 3 整合前**:
   - 確認 GET /api/v1/libraries 與 /realtime endpoints 可用
   - 取得 response schema 範例
   - 測試 API（使用 Postman or curl）

3. **Phase 4 整合前**:
   - 確認排序參數（sort_by, user_lat, user_lng）正確運作
   - 測試不同排序組合

4. **Phase 6 整合前**:
   - 確認 GET /api/v1/predict endpoint 可用
   - 了解 fallback 機制觸發條件
   - 測試不同 branch_name

### 需要後端團隊配合

1. **CORS 問題**:
   - 如果前端無法呼叫 API，請後端檢查 CORS 設定
   - 確認 credentials: 'include' 是否需要

2. **API Response 調整**:
   - 如果 response schema 不符預期，請後端調整
   - 回報缺少的欄位或錯誤的資料型別

3. **效能問題**:
   - 如果 API 回應時間過長（>2 秒），請後端最佳化
   - 考慮新增 pagination（如果列表過長）

---

## 風險與應對

### 風險 1: Mapbox token 額度用盡
**情境**: 開發時頻繁重新載入地圖，消耗 token 額度
**應對**:
- 使用開發專用 token（限制 localhost）
- 實作地圖 lazy loading（只在需要時初始化）
- 考慮使用 OpenStreetMap 替代方案（開發環境）

### 風險 2: 使用者不允許位置權限
**情境**: 大部分使用者拒絕位置權限
**應對**:
- 提供清楚的說明（為什麼需要位置權限）
- 提供手動輸入地址功能（未來擴充）
- 預設顯示台北市中心，讓使用者可手動探索

### 風險 3: 後端 API 延遲整合
**情境**: 後端 API 未如期完成
**應對**:
- 使用 MSW (Mock Service Worker) 建立 mock API
- 建立完整的 mock data（符合 contract tests）
- 前端可獨立開發與測試

### 風險 4: 效能問題（大量標記渲染）
**情境**: 地圖上有數十個標記，渲染卡頓
**應對**:
- 使用 Mapbox GL JS 的 clustering 功能
- 實作 viewport-based filtering（只顯示可見範圍的標記）
- 使用 React.memo 避免不必要的 re-render

### 風險 5: 行動裝置適配問題
**情境**: UI 在小螢幕上顯示異常
**應對**:
- 使用 Tailwind CSS 的 responsive classes
- 列表在手機上改為 bottom sheet（而非 top-right）
- 測試常見裝置尺寸（iPhone SE, iPhone 14, iPad）

---

## 備註

- **Mock Data 策略**: 建立 `frontend/src/__mocks__/api.ts`，提供所有 API 的 mock responses
- **TypeScript Strict Mode**: 啟用 strict mode，避免 any 類型
- **CSS 方法論**: 使用 Tailwind CSS utility classes，避免自訂 CSS（除非必要）
- **元件命名**: 使用 PascalCase（LibraryDetail.tsx），hook 使用 camelCase（useGeolocation.ts）
- **Import 順序**: React → third-party → absolute imports → relative imports
- **Code Review**: 每個 Phase 完成後，進行 code review（focus on 型別安全、錯誤處理、accessibility）

# Implementation Plan: 圖書館座位地圖與預測系統

**Branch**: `001-library-seat-tracker` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-library-seat-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本專案需建立一個圖書館座位地圖與預測系統，透過互動地圖呈現各圖書館即時座位資訊與開館倒數，提供「附近可用館別推薦」，並預測未來 30 分鐘與 1 小時的可用座位數。

**重要架構特性**: 本系統為 **TownPass 微服務**，將在 Flutter App 的 WebView 中執行，並透過 Flutter JS Bridge (`window.flutterObject`) 與原生功能整合（主要用於 GPS 定位）。

系統包含前端地圖介面與後端 API 服務：
- **Backend**: Python + FastAPI，採用 uv 作為套件依賴管理工具，搭配定時排程擷取外部 API 資料並訓練預測模型
- **Frontend**: TypeScript/JavaScript + React + Mapbox GL JS，運行於 TownPass Flutter WebView 中

## Technical Context

**Language/Version**:
- Backend: Python 3.12
- Frontend: TypeScript + JavaScript (ES2020+)

**Primary Dependencies**:
- Backend: FastAPI, uvicorn, SQLAlchemy, scikit-learn（預測模型）, httpx（外部 API 呼叫）, APScheduler（排程）
- Frontend: React, Mapbox GL JS, React Query, @reduxjs/toolkit, Tailwind CSS
- 套件管理: uv（後端 Python 依賴管理）, npm/pnpm（前端）

**Storage**: PostgreSQL（即時座位狀態、歷史資料、館別基本資料）

**Testing**:
- Backend: pytest, pytest-asyncio
- Frontend: Vitest, @testing-library/react

**Target Platform**:
- Backend: Linux server
- Frontend: **TownPass Flutter WebView (iOS/Android)** - 需支援 Flutter JS Bridge 整合
  - 瀏覽器回退支援: 支援直接在瀏覽器中開啟（無 JS Bridge 時自動降級）
  - WebView 版本需求: 支援 ES2020+, postMessage API

**Project Type**: web（frontend + backend），但 frontend 運行於 Flutter WebView 環境

**Performance Goals**:
- API p95 < 200ms
- 地圖標記繪製 < 500ms（包含使用者位置標記）
- 頁面載入 < 2s（快取命中時）
- 資料擷取成功率 ≥ 95%

**Constraints**:
- 資料更新頻率：每 10 分鐘
- 預測模型訓練：每日執行
- 定位座標不落資料庫（隱私保護）
- MVP 不整合節假日 API
- **Flutter WebView 限制**:
  - 必須檢查 `window.flutterObject` 存在性再呼叫
  - 不依賴不支援的瀏覽器 API
  - 定位功能透過 JS Bridge 實作，不使用 `navigator.geolocation`（WebView 中）
  - 需優雅降級處理 Bridge 不可用情境（直接瀏覽器訪問）

**Scale/Scope**:
- 館別數量: 台北市立圖書館所有分館（約 50+ 館）
- 預期使用者數: TownPass App 使用者（數萬級）
- 歷史資料保留：最近 30 天

**Flutter JS Bridge 整合** (詳見 `docs/microservice_requirements.md`):
- **定位請求**: `window.flutterObject?.postMessage(JSON.stringify({ name: 'location', data: null }))`
- **定位回應**:
  - 成功: `data` 為 `Position` JSON (包含 latitude, longitude)
  - 失敗/拒絕: `data` 為 `[]`
- **降級機制**: 當 `window.flutterObject` 不存在時（直接瀏覽器訪問），回退使用 `navigator.geolocation`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Code Quality
- ✅ 遵循 SOLID 原則：Controller-Service-Repository 分層
- ✅ 使用強型別：Python type hints、TypeScript
- ✅ 錯誤處理：所有 API 回應包含錯誤上下文
- ✅ Flutter JS Bridge 錯誤處理：優雅降級機制

### Testing Discipline
- ✅ TDD 強制執行：先寫測試再實作
- ✅ Contract Tests：API endpoints
- ✅ Integration Tests：外部 API 呼叫、資料庫互動、Flutter JS Bridge 整合
- ✅ Unit Tests：預測模型、業務邏輯、定位服務（包含 Bridge 與降級邏輯）
- ✅ 目標覆蓋率：≥ 80%

### User Experience Consistency
- ✅ 即時回饋：載入狀態、錯誤訊息
- ✅ 無障礙：WCAG 2.1 AA（ARIA 標籤、鍵盤支援）
- ✅ 回應式設計：支援桌面與行動裝置（TownPass WebView + 瀏覽器）
- ✅ 定位權限處理：提供明確引導與回退機制
- ✅ Flutter WebView 優雅降級：Bridge 不可用時回退功能正常運作
- ✅ 使用者位置標記：定位成功時顯示藍色圓點，失敗時顯示明確提示

### Performance Standards
- ✅ API p95 < 200ms
- ✅ 頁面載入 < 2s
- ✅ 資料庫索引：library_name、timestamp
- ✅ 前端 bundle size：需監控並最佳化（< 500KB gzipped）
- ✅ WebView 效能：避免阻塞主執行緒的 Bridge 呼叫

### Documentation Language
- ✅ 所有文件使用繁體中文（spec.md、plan.md、tasks.md、README、API 文件）
- ✅ Code comments 使用繁體中文（public API docstrings）
- ✅ Commit messages 偏好繁體中文

### Dependency Management
- ✅ 使用 uv 管理 Python 依賴
- ✅ Pin 主版本與次版本，commit lock files
- ✅ 定期掃描安全性漏洞
- ✅ Mapbox GL JS 授權相容性已確認（BSD-3-Clause）

### Compliance Gate
**Status**: ✅ PASS

無需填寫 Complexity Tracking 表格（無違反 constitution 的情況）

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/           # SQLAlchemy models (Library, RealtimeSeatStatus, HistorySeatStatus)
│   ├── services/         # 業務邏輯層 (fetcher, predictor, library_service)
│   ├── api/              # FastAPI endpoints (/realtime, /predict, /libraries, /suggestions)
│   ├── scheduler/        # APScheduler 排程任務
│   └── core/             # 設定檔、資料庫連線、工具函式
├── tests/
│   ├── contract/         # API contract tests
│   ├── integration/      # 資料庫、外部 API 整合測試
│   └── unit/             # 業務邏輯單元測試
├── pyproject.toml        # uv 專案設定檔
├── uv.lock               # uv lock file
└── alembic/              # 資料庫 migration

frontend/
├── src/
│   ├── components/       # React/Vue 元件 (Map, LibraryMarker, DetailWindow, LibraryList)
│   ├── pages/            # 主頁面
│   ├── services/         # API client、定位服務
│   └── types/            # TypeScript 型別定義
├── tests/
│   ├── unit/             # 元件單元測試
│   └── e2e/              # End-to-end 測試
└── package.json
```

**Structure Decision**: 採用 Web application 結構（Option 2），前後端分離。後端使用 FastAPI + SQLAlchemy + uv，前端使用現代化框架（React/Vue）+ TypeScript。此結構支援獨立開發、測試與部署，符合 Constitution 要求的清晰分層與測試覆蓋。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

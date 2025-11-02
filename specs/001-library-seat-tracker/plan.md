# Implementation Plan: 圖書館座位地圖與預測系統

**Branch**: `001-library-seat-tracker` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-library-seat-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本專案需建立一個圖書館座位地圖與預測系統，透過互動地圖呈現各圖書館即時座位資訊與開館倒數，提供「附近可用館別推薦」，並預測未來 30 分鐘與 1 小時的可用座位數。系統包含前端地圖介面與後端 API 服務，後端使用 Python + FastAPI，採用 uv 作為套件依賴管理工具，搭配定時排程擷取外部 API 資料並訓練預測模型。

## Technical Context

**Language/Version**: Python 3.12（後端）、TypeScript/JavaScript（前端）
**Primary Dependencies**:
- 後端：FastAPI、uvicorn、SQLAlchemy、scikit-learn（預測模型）、httpx（外部 API 呼叫）、APScheduler（排程）
- 前端：NEEDS CLARIFICATION（地圖函式庫選擇：Leaflet、Mapbox、Google Maps API）
- 套件管理：uv（後端 Python 依賴管理）
**Storage**: PostgreSQL（即時座位狀態、歷史資料、館別基本資料）
**Testing**: pytest（後端）、NEEDS CLARIFICATION（前端測試框架）
**Target Platform**: Linux server（後端）、Web browser（前端）
**Project Type**: web（frontend + backend）
**Performance Goals**:
- API p95 < 200ms
- 地圖標記繪製 < 500ms
- 頁面載入 < 2s（快取命中時）
- 資料擷取成功率 ≥ 95%
**Constraints**:
- 資料更新頻率：每 10 分鐘
- 預測模型訓練：每日執行
- 定位座標不落資料庫
- MVP 不整合節假日 API
**Scale/Scope**:
- 館別數量：NEEDS CLARIFICATION（台北市圖書館分館數）
- 預期使用者數：NEEDS CLARIFICATION
- 歷史資料保留：最近 30 天

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Code Quality
- ✅ 遵循 SOLID 原則：Controller-Service-Repository 分層
- ✅ 使用強型別：Python type hints、TypeScript
- ✅ 錯誤處理：所有 API 回應包含錯誤上下文

### Testing Discipline
- ✅ TDD 強制執行：先寫測試再實作
- ✅ Contract Tests：API endpoints
- ✅ Integration Tests：外部 API 呼叫、資料庫互動
- ✅ Unit Tests：預測模型、業務邏輯
- ✅ 目標覆蓋率：≥ 80%

### User Experience Consistency
- ✅ 即時回饋：載入狀態、錯誤訊息
- ✅ 無障礙：WCAG 2.1 AA（ARIA 標籤、鍵盤支援）
- ✅ 回應式設計：支援桌面與行動裝置
- ✅ 定位權限處理：提供明確引導與回退機制

### Performance Standards
- ✅ API p95 < 200ms
- ✅ 頁面載入 < 2s
- ✅ 資料庫索引：library_name、timestamp
- ✅ 前端 bundle size：需監控並最佳化

### Documentation Language
- ✅ 所有文件使用繁體中文（spec.md、plan.md、tasks.md、README、API 文件）
- ✅ Code comments 使用繁體中文（public API docstrings）
- ✅ Commit messages 偏好繁體中文

### Dependency Management
- ✅ 使用 uv 管理 Python 依賴
- ✅ Pin 主版本與次版本，commit lock files
- ✅ 定期掃描安全性漏洞
- ⚠️ 需評估前端地圖函式庫的授權相容性

### Compliance Gate
**Status**: ✅ PASS（需在 Phase 0 解決 NEEDS CLARIFICATION 項目）

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

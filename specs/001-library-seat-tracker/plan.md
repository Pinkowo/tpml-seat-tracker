# Implementation Plan: 圖書館座位地圖與預測系統

**Branch**: `001-library-seat-tracker` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-library-seat-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立互動式圖書館座位地圖系統，提供即時座位資訊查詢、距離排序、開館倒數提醒，以及未來 30/60 分鐘的座位可用性預測。系統每 10 分鐘自動更新座位資料，並使用機器學習模型進行趨勢預測，協助使用者快速決策與導航。

## 技術背景資訊

**語言/版本**: Python 3.12 (backend), TypeScript (frontend)
**主要依賴套件**: FastAPI, SQLAlchemy 2.x, Alembic, React, Vite, Tailwind CSS, Redux Toolkit, Mapbox GL JS v2.16+
**儲存方案**: PostgreSQL 15 (時間序列資料、模型註冊表、預測結果)
**測試框架**: pytest (backend), Vitest (frontend), contract tests for API
**目標平台**: Docker containers on GCP (backend), modern browsers (frontend)
**專案類型**: Web application (backend + frontend)
**效能目標**:
- 地圖載入 < 2 秒（快取命中時）
- 全部館標記繪製 < 500ms
- API 回應時間 < 200ms (p95)
- 支援並發查詢 100+ requests/sec
**限制條件**:
- 資料更新頻率固定為 10 分鐘（與外部 API 限制對齊）
- 預測模型訓練需在每日 03:00 完成以避免影響查詢效能
- 前端必須支援無定位權限的降級體驗
**規模/範疇**:
- 約 50 個圖書館分館
- 每館 3-10 個座位區域
- 保留 30 天歷史資料供模型訓練
- 預計 1000+ 日活躍使用者

## 專案憲章檢查

*關卡：必須在 Phase 0 研究之前通過。Phase 1 設計之後重新檢查。*

**備註**: 未找到專案憲章檔案。遵循標準最佳實踐原則：
- 避免過度工程化（KISS 原則）
- 優先選擇簡單方案而非複雜抽象
- 技術選擇必須有實際需求支撐

## 專案結構

### 文件目錄（本功能）

```text
specs/[###-feature]/
├── plan.md              # 本檔案（/speckit.plan 指令輸出）
├── research.md          # Phase 0 輸出（/speckit.plan 指令）
├── data-model.md        # Phase 1 輸出（/speckit.plan 指令）
├── quickstart.md        # Phase 1 輸出（/speckit.plan 指令）
├── contracts/           # Phase 1 輸出（/speckit.plan 指令）
└── tasks.md             # Phase 2 輸出（/speckit.tasks 指令 - 非由 /speckit.plan 建立）
```

### 原始碼目錄（repository root）

```text
backend/
├── src/
│   ├── api/
│   │   ├── routes/          # API endpoints (/realtime, /predict, /libraries)
│   │   ├── dependencies.py  # FastAPI dependencies (DB session, auth)
│   │   └── schemas.py       # Pydantic request/response models
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── library.py
│   │   ├── seat.py
│   │   ├── prediction.py
│   │   └── model_registry.py
│   ├── services/            # 業務邏輯
│   │   ├── seat_collector.py    # Task A: 每 10 分鐘擷取座位資料
│   │   ├── prediction_trainer.py # Task B: 每日模型訓練
│   │   ├── library_sync.py       # Task C: 每日分館資料同步
│   │   └── distance.py           # 地理距離計算
│   ├── db/
│   │   ├── session.py       # Database connection pool
│   │   └── migrations/      # Alembic migration files
│   └── config.py            # 設定檔 (env vars, secrets)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/            # API contract tests
├── Dockerfile
├── requirements.txt
└── pyproject.toml

frontend/
├── src/
│   ├── components/
│   │   ├── map/             # Mapbox 地圖相關元件
│   │   ├── library-list/    # 右上角列表視窗
│   │   ├── info-footer/     # 底部資訊框
│   │   └── library-detail/  # 詳細視窗
│   ├── pages/
│   │   └── HomePage.tsx     # 主畫面
│   ├── store/               # Redux Toolkit slices
│   │   ├── librarySlice.ts
│   │   ├── mapSlice.ts
│   │   └── uiSlice.ts
│   ├── services/            # API client
│   │   └── api.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useGeolocation.ts
│   │   └── useLibraryData.ts
│   └── types/               # TypeScript 型別定義
├── tests/
│   ├── unit/
│   └── e2e/
├── Dockerfile
├── package.json
└── vite.config.ts

docker-compose.yml             # 本地開發環境（backend + frontend + postgres）
README.md
```

**結構決策**: Web 應用程式架構，分離 backend/frontend 目錄。
- Backend 遵循分層架構：API routes → Services → Models → DB
- Frontend 遵循功能導向的元件組織方式，搭配集中式狀態管理
- 兩個服務均容器化，以確保部署到 GCP 的一致性

## 複雜度追蹤

> **僅在專案憲章檢查有需要說明的違規時填寫**

N/A - 未發現複雜度違規。

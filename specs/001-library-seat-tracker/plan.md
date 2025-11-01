# Implementation Plan: 圖書館座位地圖與預測系統

**Branch**: `001-library-seat-tracker` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-library-seat-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立互動式圖書館座位地圖系統，提供即時座位資訊查詢、距離排序、開館倒數提醒，以及未來 30/60 分鐘的座位可用性預測。系統每 10 分鐘自動更新座位資料，並使用機器學習模型進行趨勢預測，協助使用者快速決策與導航。

## Technical Context

**Language/Version**: Python 3.12 (backend), TypeScript (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy 2.x, Alembic, React, Vite, Tailwind CSS, Redux Toolkit, Mapbox GL JS v2.16+
**Storage**: PostgreSQL 15 (time-series data, model registry, predictions)
**Testing**: pytest (backend), Vitest (frontend), contract tests for API
**Target Platform**: Docker containers on GCP (backend), modern browsers (frontend)
**Project Type**: Web application (backend + frontend)
**Performance Goals**:
- 地圖載入 < 2 秒（快取命中時）
- 全部館標記繪製 < 500ms
- API 回應時間 < 200ms (p95)
- 支援並發查詢 100+ requests/sec
**Constraints**:
- 資料更新頻率固定為 10 分鐘（與外部 API 限制對齊）
- 預測模型訓練需在每日 03:00 完成以避免影響查詢效能
- 前端必須支援無定位權限的降級體驗
**Scale/Scope**:
- 約 50 個圖書館分館
- 每館 3-10 個座位區域
- 保留 30 天歷史資料供模型訓練
- 預計 1000+ 日活躍使用者

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: No project constitution file found. Proceeding with standard best practices:
- Avoid over-engineering (KISS principle)
- Prefer simple solutions over complex abstractions
- Technology choices must be justified by actual requirements

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
│   ├── api/
│   │   ├── routes/          # API endpoints (/realtime, /predict, /libraries)
│   │   ├── dependencies.py  # FastAPI dependencies (DB session, auth)
│   │   └── schemas.py       # Pydantic request/response models
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── library.py
│   │   ├── seat.py
│   │   ├── prediction.py
│   │   └── model_registry.py
│   ├── services/            # Business logic
│   │   ├── seat_collector.py    # Task A: 每 10 分鐘擷取座位資料
│   │   ├── prediction_trainer.py # Task B: 每日模型訓練
│   │   ├── library_sync.py       # Task C: 每日分館資料同步
│   │   └── distance.py           # 地理距離計算
│   ├── db/
│   │   ├── session.py       # Database connection pool
│   │   └── migrations/      # Alembic migration files
│   └── config.py            # Configuration (env vars, secrets)
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
│   └── types/               # TypeScript type definitions
├── tests/
│   ├── unit/
│   └── e2e/
├── Dockerfile
├── package.json
└── vite.config.ts

docker-compose.yml             # 本地開發環境（backend + frontend + postgres）
README.md
```

**Structure Decision**: Web application structure with separate backend/frontend directories.
- Backend follows layered architecture: API routes → Services → Models → DB
- Frontend follows feature-based component organization with centralized state management
- Both services containerized for consistent deployment to GCP

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No complexity violations identified.

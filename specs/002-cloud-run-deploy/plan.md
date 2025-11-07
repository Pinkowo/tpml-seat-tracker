# Implementation Plan: Cloud Run 自動化部署

**Branch**: `002-cloud-run-deploy` | **Date**: 2025-11-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-cloud-run-deploy/spec.md`

## Summary

本功能實作圖書館座位追蹤系統的前後端應用程式自動化部署至 Google Cloud Run。採用簡化架構方案：後端 FastAPI 應用透過 Cloud SQL Python Connector 連線至具有 Public IP 的 Cloud SQL PostgreSQL 資料庫，前端 React + Vite 應用建置為 Nginx 靜態服務。整體架構無需 VPC Connector，透過 Cloud Run MCP 工具進行部署，預估月成本約 $25-35 USD。

## Technical Context

**Language/Version**:
- 後端：Python 3.12 + FastAPI + uvicorn
- 前端：Node.js 20 + React 18 + Vite 5 + TypeScript

**Primary Dependencies**:
- 後端：FastAPI, SQLAlchemy, asyncpg, google-cloud-sql-connector, uvicorn, alembic
- 前端：React, Vite, Mapbox GL JS, Nginx (runtime)

**Storage**:
- Cloud SQL for PostgreSQL 15 (db-f1-micro, Public IP, 10GB)
- 透過 Cloud SQL Python Connector 連線（自動 TLS 加密 + IAM 認證）

**Testing**:
- 後端：pytest (已有單元、整合、契約測試)
- 前端：Vitest + Testing Library (已有單元、整合測試)
- 部署後驗證：手動測試 API 健康檢查與前端載入

**Target Platform**:
- Google Cloud Run (asia-east1 region)
- 前端：0.5 CPU, 512MB RAM, Nginx 容器
- 後端：1 CPU, 1GB RAM, Python 容器

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- 後端 API 回應時間 p95 < 1 秒
- 前端首次載入 < 3 秒
- 部署時間 < 5 分鐘（從執行指令到取得 URL）

**Constraints**:
- 使用 Cloud Run MCP 工具進行部署（簡化流程）
- 預算限制：月成本控制在 $35 USD 以內
- 前端需支援 SPA 路由（所有路徑導向 index.html）
- 後端需要資料庫連線（透過 Cloud SQL Connector）
- 環境變數需妥善管理（使用 Secret Manager）

**Scale/Scope**:
- 預期使用者：初期 < 1000 人/月
- API 請求量：< 10 萬次/月
- 資料庫大小：< 1GB
- 前端靜態資源：< 10MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles

#### I. Code Quality
✅ **PASS** - 部署配置遵循以下原則：
- Dockerfile 採用多階段建置，清楚分離建置與執行環境
- 環境變數透過 Secret Manager 集中管理，避免硬編碼
- 使用標準工具（Cloud SQL Python Connector）而非自訂解決方案
- 錯誤處理透過 Cloud Run 健康檢查機制明確回報

#### II. Testing Discipline
✅ **PASS** - 測試策略：
- 專案已有完整的單元、整合、契約測試（backend/tests/, frontend/tests/）
- 部署前必須通過所有測試（在 CI/CD 中驗證，本功能範疇外）
- 部署後進行煙霧測試：健康檢查端點、前端載入、API 整合測試
- 使用 Cloud Run 內建健康檢查機制持續監控服務狀態

#### III. User Experience Consistency
✅ **PASS** - 使用者體驗一致性：
- 部署流程透過 MCP 工具標準化，減少人為錯誤
- 前端 Nginx 配置正確處理 SPA 路由，避免 404 錯誤
- 後端 CORS 設定允許前端跨域請求
- Cloud Run 自動提供 HTTPS，確保安全連線

#### IV. Performance Standards
✅ **PASS** - 效能標準：
- Cloud SQL Python Connector 使用 `refresh_strategy="lazy"` 適配 Cloud Run 環境
- 前端 Dockerfile 採用 Nginx Alpine 映像檔，體積小啟動快
- 後端 uvicorn 配置 2 workers 提升並行處理能力
- Cloud Run 自動擴展機制應對流量變化

#### V. Documentation Language
✅ **PASS** - 文件語言：
- 所有規格、計畫、研究文件使用繁體中文
- Quickstart 指南使用繁體中文
- 程式碼註解與 commit messages 使用繁體中文或英文（視情況）

### Technical Standards

#### Code Style & Formatting
✅ **PASS** - 部署配置符合專案規範：
- Dockerfile 遵循 Docker 最佳實踐（多階段建置、最小化層數）
- 環境變數命名一致（大寫加底線，例如 `DATABASE_URL`）
- 配置檔案格式統一（YAML for Cloud Run service config）

#### Documentation
✅ **PASS** - 文件完整性：
- spec.md 定義功能需求
- research.md 記錄技術決策與替代方案評估
- quickstart.md 提供快速部署指南
- contracts/ 定義部署介面與環境變數規格

#### Dependency Management
✅ **PASS** - 依賴管理：
- 使用 Google Cloud 官方函式庫（google-cloud-sql-connector）
- 依賴項已在 backend/pyproject.toml 與 frontend/package.json 中定義
- Cloud Run 執行環境使用固定版本（python:3.12-slim, node:20-alpine）

### Development Workflow

#### Git Workflow
✅ **PASS** - Git 流程：
- 功能分支：`002-cloud-run-deploy`
- Commit messages 遵循 Conventional Commits（例如 `feat(deploy): add cloud run deployment config`）
- 部署配置檔案納入版本控制

#### Continuous Integration
⚠️ **OUT OF SCOPE** - CI/CD 自動化：
- 本功能範疇僅涵蓋手動透過 MCP 工具部署
- CI/CD 流程（GitHub Actions）列於 spec.md 的 Out of Scope
- 未來可擴展為自動化部署流程

### Gate Result

✅ **PASS** - 所有適用的 Constitution 原則皆符合，可以進行 Phase 0 研究。

## Project Structure

### Documentation (this feature)

```text
specs/002-cloud-run-deploy/
├── plan.md              # 本檔案 (執行中)
├── research.md          # Phase 0 輸出：技術決策與替代方案評估
├── data-model.md        # Phase 1 輸出：環境變數與配置模型
├── quickstart.md        # Phase 1 輸出：部署快速指南
├── contracts/           # Phase 1 輸出：部署介面規格
│   ├── backend-env.yaml      # 後端環境變數規格
│   ├── frontend-env.yaml     # 前端環境變數規格
│   └── cloud-sql-config.yaml # Cloud SQL 配置規格
└── tasks.md             # Phase 2 輸出 (/speckit.tasks 指令產生，不在本次範圍)
```

### Source Code (repository root)

```text
# 現有專案結構（已確認）
backend/
├── src/
│   ├── main.py          # FastAPI 應用程式進入點
│   ├── config.py        # 環境設定（需調整連線字串）
│   ├── models/          # SQLAlchemy 資料模型
│   ├── services/        # 業務邏輯
│   └── api/             # API 路由
├── tests/               # 後端測試
├── alembic/             # 資料庫遷移腳本
├── Dockerfile           # 後端容器映像檔（需微調生產環境配置）
├── pyproject.toml       # Python 依賴定義
└── docker-compose.yml   # 本地開發用（部署時不使用）

frontend/
├── src/
│   ├── components/      # React 元件
│   ├── pages/           # 頁面元件
│   └── services/        # API 呼叫服務
├── tests/               # 前端測試
├── docker/
│   └── nginx.conf       # Nginx SPA 路由配置（已存在）
├── Dockerfile           # 前端容器映像檔（需調整建置參數）
└── package.json         # Node.js 依賴定義

# 部署後新增（透過 MCP 工具產生，不納入版本控制）
.cloud-run/
├── backend-service.yaml   # 後端 Cloud Run 服務配置（可選）
└── frontend-service.yaml  # 前端 Cloud Run 服務配置（可選）
```

**Structure Decision**:
本專案為 Web 應用架構，包含獨立的 frontend/ 與 backend/ 目錄。部署流程透過 Cloud Run MCP 工具執行，無需修改現有專案結構。部署配置文件（Dockerfile）已存在於各自目錄中，僅需微調環境變數注入與生產環境最佳化設定。

## Complexity Tracking

> 本功能無 Constitution 違規，此表格留空。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Phase 0: Research & Technical Decisions

**Status**: 待執行（下一步撰寫 research.md）

**研究主題**：
1. Cloud SQL Python Connector vs Unix Socket 連線方式比較
2. Public IP vs Private IP + VPC Connector 成本與安全性分析
3. Cloud Run 環境變數注入方式（Secret Manager vs 直接設定）
4. 前端建置時環境變數注入策略（ARG vs ENV）
5. Cloud Run 自動擴展配置最佳實踐
6. Nginx SPA 路由配置驗證

**輸出**: research.md

---

## Phase 1: Design Artifacts

**Status**: 待執行

**輸出檔案**：
1. **data-model.md**: 環境變數與配置模型（Cloud Run 服務配置、Secret Manager 設定）
2. **contracts/**: 部署介面規格（環境變數 schema、Cloud SQL 配置）
3. **quickstart.md**: 部署快速指南（step-by-step 指令）

---

## Next Steps

1. ✅ 使用者確認架構方案：方案 A（Public IP + Cloud SQL Connector，無 VPC）
2. 🔄 執行 Phase 0：撰寫 research.md
3. ⏳ 執行 Phase 1：設計環境變數模型、撰寫部署合約與快速指南
4. ⏳ 更新 agent context
5. ⏳ 使用者執行 `/speckit.tasks` 產生實作任務清單

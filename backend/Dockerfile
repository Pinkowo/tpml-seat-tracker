# Multi-stage build for backend

# Stage 1: Build dependencies
FROM python:3.12-slim as builder

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files (docker-compose 從專案根目錄執行，build context 是 backend/)
COPY pyproject.toml uv.lock* ./

# Install dependencies
RUN uv pip install --system . || pip install fastapi uvicorn sqlalchemy alembic apscheduler httpx pydantic-settings loguru python-dotenv asyncpg psycopg2-binary

# Stage 2: Runtime
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY src ./src
COPY alembic.ini ./alembic.ini
COPY alembic ./alembic

# Create directories for logs and models
RUN mkdir -p logs models

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Health check (使用 curl 或 wget，因為 requests 可能未安裝)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run application (由 docker-compose command 覆蓋，移除 ENTRYPOINT 以便在開發模式使用 --reload)
# ENTRYPOINT 移除，改用 docker-compose 的 command 控制


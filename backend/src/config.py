"""
應用程式環境設定
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """應用程式設定"""

    # 資料庫
    database_url: str = "postgresql+asyncpg://tpml_user:tpml_password@localhost:5432/tpml_seat_tracker"

    # API 設定
    api_base_url: str = "http://localhost:8000"
    log_level: str = "INFO"

    # 外部 API
    external_api_url: str = "https://example.com/api/seats"
    mapbox_token: str = ""  # 測試用，可選

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# 全域設定實例
settings = Settings()


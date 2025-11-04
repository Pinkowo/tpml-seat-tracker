"""
SQLAlchemy Base 設定
"""
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func

Base = declarative_base()


class TimestampMixin:
    """時間戳記 mixin"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


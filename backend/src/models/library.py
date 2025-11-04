"""
Library SQLAlchemy model
"""

from sqlalchemy import Column, Integer, String, Text, Numeric, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from src.models.base import Base, TimestampMixin


class Library(Base, TimestampMixin):
    """
    圖書館分館主檔

    對應資料表: library_info
    """

    __tablename__ = "library_info"

    id = Column(Integer, primary_key=True, index=True)
    branch_name = Column(String(100), unique=True, nullable=False, index=True)
    address = Column(Text, nullable=False)
    phone = Column(String(20), nullable=True)
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    # 使用 JSONB（PostgreSQL）或 JSON（SQLite）
    # SQLAlchemy 會根據資料庫類型自動選擇
    open_hours = Column(JSONB().with_variant(JSON(), "sqlite"), nullable=False)

    # Relationships
    seat_realtime = relationship(
        "SeatRealtime",
        back_populates="library",
        uselist=True,  # one-to-many（每個區域一筆記錄）
    )
    seat_history = relationship("SeatHistory", back_populates="library")
    prediction_results = relationship("PredictionResult", back_populates="library")
    model_registry = relationship("ModelRegistry", back_populates="library")

    def to_dict(self):
        """轉換為字典格式（用於序列化）"""
        return {
            "id": self.id,
            "branch_name": self.branch_name,
            "address": self.address,
            "phone": self.phone,
            "latitude": float(self.latitude),
            "longitude": float(self.longitude),
            "open_hours": self.open_hours,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

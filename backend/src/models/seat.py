"""
Seat 相關 SQLAlchemy models
"""

from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    String,
    DateTime,
    ForeignKey,
    UUID,
    CheckConstraint,
)
from sqlalchemy.orm import relationship

from src.models.base import Base, TimestampMixin


class SeatRealtime(Base):
    """
    即時座位狀態

    對應資料表: seat_realtime
    每個區域一筆記錄（UPSERT 更新），包含詳細的區域資訊
    """

    __tablename__ = "seat_realtime"

    id = Column(Integer, primary_key=True, index=True)
    library_id = Column(
        Integer,
        ForeignKey("library_info.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    floor_name = Column(String(50), nullable=True)
    area_name = Column(String(100), nullable=True)
    area_id = Column(String(100), nullable=True)
    free_count = Column(Integer, nullable=False)
    total_count = Column(Integer, nullable=False)
    last_updated = Column(DateTime(timezone=True), nullable=False, index=True)
    batch_id = Column(UUID, nullable=False)

    # Relationships
    library = relationship("Library", back_populates="seat_realtime")

    __table_args__ = (
        CheckConstraint("free_count >= 0", name="check_free_count_positive"),
        CheckConstraint("total_count > 0", name="check_seat_count_positive"),
    )

    def to_dict(self):
        """轉換為字典格式"""
        return {
            "id": self.id,
            "library_id": self.library_id,
            "branch_name": self.library.branch_name if self.library else None,
            "floor_name": self.floor_name,
            "area_name": self.area_name,
            "area_id": self.area_id,
            "free_count": self.free_count,
            "total_count": self.total_count,
            "usage_rate": (
                1.0 - (self.free_count / self.total_count)
                if self.total_count > 0
                else 0.0
            ),
            "last_updated": (
                self.last_updated.isoformat() if self.last_updated else None
            ),
            "batch_id": str(self.batch_id),
        }


class SeatHistory(Base, TimestampMixin):
    """
    座位歷史快照

    對應資料表: seat_history
    只增不改（INSERT-only），便於時序分析
    """

    __tablename__ = "seat_history"

    id = Column(BigInteger, primary_key=True, index=True)
    batch_id = Column(UUID, nullable=False, index=True)
    library_id = Column(
        Integer,
        ForeignKey("library_info.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    floor_name = Column(String(50), nullable=True)
    area_name = Column(String(100), nullable=True)
    area_id = Column(String(100), nullable=True)
    free_count = Column(Integer, nullable=False)
    total_count = Column(Integer, nullable=False)
    collected_at = Column(DateTime(timezone=True), nullable=False, index=True)
    source_updated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    library = relationship("Library", back_populates="seat_history")

    __table_args__ = (
        CheckConstraint("free_count >= 0", name="check_free_count_positive"),
        CheckConstraint("total_count > 0", name="check_total_count_positive"),
    )

    def to_dict(self):
        """轉換為字典格式"""
        return {
            "id": self.id,
            "batch_id": str(self.batch_id),
            "library_id": self.library_id,
            "branch_name": self.library.branch_name if self.library else None,
            "floor_name": self.floor_name,
            "area_name": self.area_name,
            "area_id": self.area_id,
            "free_count": self.free_count,
            "total_count": self.total_count,
            "collected_at": (
                self.collected_at.isoformat() if self.collected_at else None
            ),
            "source_updated_at": (
                self.source_updated_at.isoformat() if self.source_updated_at else None
            ),
            "created_at": (self.created_at.isoformat() if self.created_at else None),
            "updated_at": (self.updated_at.isoformat() if self.updated_at else None),
        }

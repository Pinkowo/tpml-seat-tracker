"""
Prediction 相關 SQLAlchemy models
"""

from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    String,
    DateTime,
    ForeignKey,
    Numeric,
    CheckConstraint,
)
from sqlalchemy.orm import relationship

from src.models.base import Base, TimestampMixin


class PredictionResult(Base):
    """
    預測結果

    對應資料表: prediction_results
    """

    __tablename__ = "prediction_results"

    id = Column(BigInteger, primary_key=True, index=True)
    library_id = Column(
        Integer,
        ForeignKey("library_info.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    prediction_time = Column(DateTime(timezone=True), nullable=False, index=True)
    predicted_seats = Column(Integer, nullable=False)
    horizon_minutes = Column(Integer, nullable=False)  # 30 或 60
    model_version = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default="now()", nullable=False)

    # Relationships
    library = relationship("Library", back_populates="prediction_results")

    __table_args__ = (
        CheckConstraint("horizon_minutes IN (30, 60)", name="check_horizon_minutes"),
        CheckConstraint("predicted_seats >= 0", name="check_predicted_seats_positive"),
    )

    def to_dict(self):
        """轉換為字典格式"""
        return {
            "id": self.id,
            "library_id": self.library_id,
            "branch_name": self.library.branch_name if self.library else None,
            "prediction_time": (
                self.prediction_time.isoformat() if self.prediction_time else None
            ),
            "predicted_seats": self.predicted_seats,
            "horizon_minutes": self.horizon_minutes,
            "model_version": self.model_version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    @classmethod
    async def get_latest_prediction(
        cls, session, library_id: int, horizon_minutes: int
    ):
        """
        取得指定圖書館最新的預測結果

        查詢方法: get_latest_prediction(library_id, horizon_minutes)
        """
        from sqlalchemy import select

        query = (
            select(cls)
            .where(cls.library_id == library_id)
            .where(cls.horizon_minutes == horizon_minutes)
            .order_by(cls.prediction_time.desc())
            .limit(1)
        )
        result = await session.execute(query)
        return result.scalar_one_or_none()


class ModelRegistry(Base):
    """
    模型註冊表

    對應資料表: model_registry
    追蹤 Champion/Challenger 模型版本與評估指標
    """

    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    library_id = Column(
        Integer,
        ForeignKey("library_info.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    model_type = Column(String(50), nullable=False)  # prophet, random_forest, lstm
    version = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)  # champion, challenger, archived
    mape = Column(Numeric(5, 2), nullable=True)  # 平均絕對百分比誤差（%）
    created_at = Column(DateTime(timezone=True), server_default="now()", nullable=False)
    activated_at = Column(DateTime(timezone=True), nullable=True)  # 啟用時間

    # Relationships
    library = relationship("Library", back_populates="model_registry")

    __table_args__ = (
        CheckConstraint(
            "model_type IN ('prophet', 'random_forest', 'lstm')",
            name="check_model_type",
        ),
        CheckConstraint(
            "status IN ('champion', 'challenger', 'archived')", name="check_status"
        ),
    )

    def to_dict(self):
        """轉換為字典格式"""
        return {
            "id": self.id,
            "library_id": self.library_id,
            "branch_name": self.library.branch_name if self.library else None,
            "model_type": self.model_type,
            "version": self.version,
            "status": self.status,
            "mape": float(self.mape) if self.mape else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "activated_at": (
                self.activated_at.isoformat() if self.activated_at else None
            ),
        }

    @classmethod
    async def get_champion_model(cls, session, library_id: int):
        """
        取得指定圖書館的 Champion 模型

        查詢方法: get_champion_model(library_id)
        """
        from sqlalchemy import select

        query = (
            select(cls)
            .where(cls.library_id == library_id)
            .where(cls.status == "champion")
            .order_by(cls.activated_at.desc())
            .limit(1)
        )
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def promote_to_champion(cls, session, model_id: int):
        """
        將模型升級為 Champion

        查詢方法: promote_to_champion(model_id)
        """
        from sqlalchemy import select, update
        from datetime import datetime

        # 取得要升級的模型
        query = select(cls).where(cls.id == model_id)
        result = await session.execute(query)
        model = result.scalar_one_or_none()

        if not model:
            raise ValueError(f"Model {model_id} not found")

        # 將同一圖書館的其他 champion 降級
        await session.execute(
            update(cls)
            .where(cls.library_id == model.library_id)
            .where(cls.status == "champion")
            .values(status="archived")
        )

        # 升級當前模型
        model.status = "champion"
        model.activated_at = datetime.now()

        await session.commit()
        return model

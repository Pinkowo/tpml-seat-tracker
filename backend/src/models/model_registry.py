"""
ModelRegistry SQLAlchemy model

追蹤 Champion/Challenger 模型版本與評估指標
"""
from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, Boolean, Date, Text
from sqlalchemy.sql import func
from src.models.base import Base


class ModelRegistry(Base):
    """模型註冊表 - 追蹤訓練的預測模型版本"""

    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(50), nullable=False)  # 'prophet' | 'random_forest' | 'lstm'
    version = Column(String(20), nullable=False)  # 版本號（如 'v1.2.3'）
    role = Column(String(20), nullable=False)  # 'champion' | 'challenger'
    mape = Column(Numeric(5, 2), nullable=True)  # 平均絕對百分比誤差（%）
    rmse = Column(Numeric(5, 2), nullable=True)  # 均方根誤差（座位數）
    trained_at = Column(TIMESTAMP, nullable=False, default=func.now())  # 訓練完成時間
    training_data_start = Column(Date, nullable=False)  # 訓練資料起始日期
    training_data_end = Column(Date, nullable=False)  # 訓練資料結束日期
    artifact_path = Column(Text, nullable=True)  # 模型檔案路徑（如 GCS URI）
    is_active = Column(Boolean, default=True, nullable=False)  # 是否啟用
    created_at = Column(TIMESTAMP, default=func.now(), nullable=False)

    __table_args__ = (
        # 確保模型名稱 + 版本的唯一性
        {"sqlite_autoincrement": True},
    )

    def __repr__(self):
        return (
            f"<ModelRegistry(id={self.id}, "
            f"model_name='{self.model_name}', "
            f"version='{self.version}', "
            f"role='{self.role}', "
            f"mape={self.mape}, "
            f"is_active={self.is_active})>"
        )

    @property
    def is_champion(self) -> bool:
        """是否為 champion 模型"""
        return self.role == "champion" and self.is_active

    @property
    def is_challenger(self) -> bool:
        """是否為 challenger 模型"""
        return self.role == "challenger" and self.is_active

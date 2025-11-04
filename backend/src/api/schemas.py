"""
API 回應的 Pydantic schemas
"""
from typing import Generic, TypeVar, List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseResponse(BaseModel):
    """基本回應模型"""

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """錯誤回應模型"""

    error: str
    detail: str | dict | list


class PaginatedResponse(BaseModel, Generic[T]):
    """分頁回應模型"""

    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


# Library schemas
class OpenHours(BaseModel):
    """營業時間單日模型"""

    open: str  # HH:MM
    close: str  # HH:MM


class CurrentSeats(BaseModel):
    """即時座位資訊"""

    free: int
    total: int


class LibraryResponse(BaseModel):
    """圖書館回應模型"""

    branch_name: str
    address: str
    phone: str | None
    latitude: float
    longitude: float
    open_hours: Dict[str, OpenHours | None]
    is_open: bool
    closing_in_minutes: int | None
    distance_km: float | None = None
    current_seats: CurrentSeats | None = None

    model_config = ConfigDict(from_attributes=True)


# Realtime seat schemas
class RealtimeSeatResponse(BaseModel):
    """即時座位回應模型"""

    branch_name: str
    total_free_count: int
    total_seat_count: int
    usage_rate: float
    last_updated: str  # ISO 8601
    batch_id: str  # UUID

    model_config = ConfigDict(from_attributes=True)


# Prediction schemas
class PredictionItem(BaseModel):
    """單一預測項目"""

    horizon_minutes: int  # 30 或 60
    predicted_seats: int
    is_fallback: bool  # 是否使用 fallback 機制


class PredictionResponse(BaseModel):
    """預測回應模型"""

    library_id: int
    predictions: List[PredictionItem]


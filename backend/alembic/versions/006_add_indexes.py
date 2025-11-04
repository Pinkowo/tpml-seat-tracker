"""add indexes for query optimization

Revision ID: 006
Revises: 005
Create Date: 2025-01-15 10:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # seat_history 索引（已在 003 中建立，這裡確保完整性）
    # idx_history_library_time - 已存在
    # idx_history_batch - 已存在
    # idx_history_collected - 已存在
    
    # prediction_results 索引優化（已在 004 中建立）
    # idx_prediction_library_time_horizon - 已存在
    
    # model_registry 索引優化（已在 005 中建立）
    # idx_model_registry_library_status_mape - 已存在
    
    # 所有索引都已在各自的 migration 中建立，這裡不做任何操作
    pass


def downgrade() -> None:
    # 所有索引都已在各自的 migration 中建立，這裡不做任何操作
    pass


"""create seat_realtime

Revision ID: 002
Revises: 001
Create Date: 2025-01-15 10:05:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "seat_realtime",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("library_id", sa.Integer(), nullable=False),
        sa.Column("floor_name", sa.String(length=50), nullable=True),
        sa.Column("area_name", sa.String(length=100), nullable=True),
        sa.Column("area_id", sa.String(length=100), nullable=True),
        sa.Column("free_count", sa.Integer(), nullable=False),
        sa.Column("total_count", sa.Integer(), nullable=False),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=False),
        sa.Column("batch_id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ["library_id"], ["library_info.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_realtime_updated", "seat_realtime", ["last_updated"], unique=False
    )
    op.create_index(
        "idx_realtime_library_id", "seat_realtime", ["library_id"], unique=False
    )
    op.create_index(
        "idx_realtime_library_area",
        "seat_realtime",
        ["library_id", "area_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_realtime_library_area", table_name="seat_realtime")
    op.drop_index("idx_realtime_library_id", table_name="seat_realtime")
    op.drop_index("idx_realtime_updated", table_name="seat_realtime")
    op.drop_table("seat_realtime")

"""create seat_history

Revision ID: 003
Revises: 002
Create Date: 2025-01-15 10:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "seat_history",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("batch_id", sa.UUID(), nullable=False),
        sa.Column("library_id", sa.Integer(), nullable=False),
        sa.Column("floor_name", sa.String(length=50), nullable=True),
        sa.Column("area_name", sa.String(length=100), nullable=True),
        sa.Column("area_id", sa.String(length=100), nullable=True),
        sa.Column("free_count", sa.Integer(), nullable=False),
        sa.Column("total_count", sa.Integer(), nullable=False),
        sa.Column("collected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source_updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            onupdate=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("free_count >= 0", name="check_free_count_positive"),
        sa.CheckConstraint("total_count > 0", name="check_total_count_positive"),
        sa.ForeignKeyConstraint(
            ["library_id"], ["library_info.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_history_library_time",
        "seat_history",
        ["library_id", "collected_at"],
        unique=False,
    )
    op.create_index("idx_history_batch", "seat_history", ["batch_id"], unique=False)
    op.create_index(
        "idx_history_collected", "seat_history", ["collected_at"], unique=False
    )


def downgrade() -> None:
    op.drop_index("idx_history_collected", table_name="seat_history")
    op.drop_index("idx_history_batch", table_name="seat_history")
    op.drop_index("idx_history_library_time", table_name="seat_history")
    op.drop_table("seat_history")

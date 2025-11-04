"""create model_registry

Revision ID: 005
Revises: 004
Create Date: 2025-01-15 10:20:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "model_registry",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("library_id", sa.Integer(), nullable=False),
        sa.Column("model_type", sa.String(length=50), nullable=False),
        sa.Column("version", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("mape", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("activated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "model_type IN ('prophet', 'random_forest', 'lstm')",
            name="check_model_type",
        ),
        sa.CheckConstraint(
            "status IN ('champion', 'challenger', 'archived')", name="check_status"
        ),
        sa.ForeignKeyConstraint(
            ["library_id"], ["library_info.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_model_registry_library_status_mape",
        "model_registry",
        ["library_id", "status", "mape"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_model_registry_library_status_mape", table_name="model_registry")
    op.drop_table("model_registry")

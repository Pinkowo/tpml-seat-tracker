"""create prediction_results

Revision ID: 004
Revises: 003
Create Date: 2025-01-15 10:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'prediction_results',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('library_id', sa.Integer(), nullable=False),
        sa.Column('prediction_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('predicted_seats', sa.Integer(), nullable=False),
        sa.Column('horizon_minutes', sa.Integer(), nullable=False),
        sa.Column('model_version', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('horizon_minutes IN (30, 60)', name='check_horizon_minutes'),
        sa.CheckConstraint('predicted_seats >= 0', name='check_predicted_seats_positive'),
        sa.ForeignKeyConstraint(['library_id'], ['library_info.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_prediction_library_time_horizon', 'prediction_results', ['library_id', 'prediction_time', 'horizon_minutes'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_prediction_library_time_horizon', table_name='prediction_results')
    op.drop_table('prediction_results')


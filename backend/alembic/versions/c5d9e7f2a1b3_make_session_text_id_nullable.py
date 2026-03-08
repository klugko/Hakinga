"""make session text_id nullable

Revision ID: c5d9e7f2a1b3
Revises: b4c8f2d1e3a5
Create Date: 2026-03-08 13:20:00.000000

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = 'c5d9e7f2a1b3'
down_revision = 'b4c8f2d1e3a5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make text_id nullable to support external quotes (e.g., from type.fit API)
    op.alter_column('typing_sessions', 'text_id',
               existing_type=sa.UUID(),
               nullable=True)


def downgrade() -> None:
    # Revert to non-nullable (will fail if there are NULL values)
    op.alter_column('typing_sessions', 'text_id',
               existing_type=sa.UUID(),
               nullable=False)

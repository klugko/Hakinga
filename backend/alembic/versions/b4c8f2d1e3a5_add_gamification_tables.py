"""add gamification tables

Revision ID: b4c8f2d1e3a5
Revises: 9bae76476d33
Create Date: 2026-02-05 10:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b4c8f2d1e3a5'
down_revision: str | Sequence[str] | None = '9bae76476d33'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Define enum outside of functions for reuse
RANK_TIER_VALUES = ('unranked', 'bronze', 'silver', 'gold',
                    'platinum', 'diamond', 'master', 'grandmaster')


def upgrade() -> None:
    """Add gamification tables and columns."""
    # Create rank_tier enum type if it doesn't exist
    connection = op.get_bind()
    result = connection.execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = 'ranktier'")
    )
    if not result.fetchone():
        rank_tier_enum = postgresql.ENUM(*RANK_TIER_VALUES, name='ranktier')
        rank_tier_enum.create(connection)

    # Create user_progress table
    op.create_table(
        'user_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'),
                  nullable=False, unique=True, index=True),
        sa.Column('total_xp', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('current_level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('current_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('best_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_session_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rank_tier', postgresql.ENUM(*RANK_TIER_VALUES, name='ranktier',
                                                create_type=False),
                  nullable=False, server_default='unranked'),
        sa.Column('mmr', sa.Integer(), nullable=False, server_default='1000'),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.func.now()),
    )

    # Add gamification columns to typing_sessions
    op.add_column('typing_sessions',
                  sa.Column('max_combo', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('typing_sessions',
                  sa.Column('xp_earned', sa.Integer(), nullable=False, server_default='0'))

    # Add columns to achievements table for enhanced achievements
    op.add_column('achievements',
                  sa.Column('rarity', sa.String(20), nullable=False, server_default='common'))
    op.add_column('achievements',
                  sa.Column('xp_reward', sa.Integer(), nullable=False, server_default='50'))
    op.add_column('achievements',
                  sa.Column('is_hidden', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Remove gamification tables and columns."""
    # Remove columns from achievements
    op.drop_column('achievements', 'is_hidden')
    op.drop_column('achievements', 'xp_reward')
    op.drop_column('achievements', 'rarity')

    # Remove columns from typing_sessions
    op.drop_column('typing_sessions', 'xp_earned')
    op.drop_column('typing_sessions', 'max_combo')

    # Drop user_progress table
    op.drop_table('user_progress')

    # Drop enum type
    connection = op.get_bind()
    rank_tier_enum = postgresql.ENUM(*RANK_TIER_VALUES, name='ranktier')
    rank_tier_enum.drop(connection, checkfirst=True)

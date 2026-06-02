"""create saved_creators table

Revision ID: 20260530_create_saved_creators
Revises: e200f87befef
Create Date: 2026-05-30 00:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260530_create_saved_creators"
down_revision = "e200f87befef"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "saved_creators",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("creator_id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_saved_creators_user_id_users")),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], name=op.f("fk_saved_creators_creator_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_saved_creators")),
        sa.UniqueConstraint("user_id", "creator_id", name=op.f("uq_saved_creators_user_creator")),
    )


def downgrade() -> None:
    op.drop_table("saved_creators")

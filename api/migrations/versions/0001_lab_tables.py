"""Таблицы учебной лаборатории."""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None


def upgrade():
    op.create_table(
        "lab_disks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("price_rub", sa.Integer(), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.CheckConstraint("price_rub > 0", name="ck_lab_disks_positive_price"),
        sa.CheckConstraint("stock >= 0", name="ck_lab_disks_nonnegative_stock"),
    )
    op.create_table(
        "lab_users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(32), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(60), nullable=False),
    )


def downgrade():
    op.drop_table("lab_users")
    op.drop_table("lab_disks")

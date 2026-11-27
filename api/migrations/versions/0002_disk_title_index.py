"""Индекс для поиска дисков по названию."""

from alembic import op

revision = "0002"
down_revision = "0001"


def upgrade():
    # TODO 11: Создайте ix_lab_disks_title на lab_disks.title.
    pass


def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_lab_disks_title")

from alembic import context

from shop.lab.database import make_engine
from shop.lab.models import Base
from shop.lab.settings import Settings


def upgrade(connection):
    context.configure(
        connection=connection,
        target_metadata=Base.metadata,
        version_table="lab_alembic_version",
    )
    with context.begin_transaction():
        context.run_migrations()


connection = context.config.attributes.get("connection")
if connection is None:
    engine = make_engine(Settings().database_url)
    try:
        with engine.connect() as connection:
            upgrade(connection)
    finally:
        engine.dispose()
else:
    upgrade(connection)

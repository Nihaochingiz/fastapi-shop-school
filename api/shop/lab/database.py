from collections.abc import Iterator
from pathlib import Path

import psycopg
from alembic import command
from alembic.config import Config
from fastapi import Request
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session


def make_engine(database_url: str) -> Engine:
    # The driver accepts both a URL and the keyword DSN used for isolated test schemas.
    return create_engine(
        "postgresql+psycopg://",
        creator=lambda: psycopg.connect(database_url),
        pool_pre_ping=True,
    )


def migrate(engine: Engine) -> None:
    with engine.begin() as connection:
        config = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
        config.attributes["connection"] = connection
        command.upgrade(config, "head")


def get_session(request: Request) -> Iterator[Session]:
    with Session(request.app.state.lab_engine) as session:
        yield session

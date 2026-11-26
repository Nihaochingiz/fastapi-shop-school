import os
from collections.abc import Iterator
from pathlib import Path

import psycopg
from psycopg import Connection
from psycopg.rows import dict_row


def connect() -> Connection:
    return psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row)


def get_db() -> Iterator[Connection]:
    with connect() as conn:
        yield conn


def initialize(conn: Connection) -> None:
    conn.execute(Path(__file__).with_name("schema.sql").read_text(encoding="utf-8"))

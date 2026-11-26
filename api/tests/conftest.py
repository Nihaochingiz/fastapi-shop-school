import os
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient
from psycopg import sql
from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row

from shop.db import initialize
from shop.main import app


@pytest.fixture
def database(monkeypatch):
    base_dsn = os.environ.get("DATABASE_URL")
    if not base_dsn:
        pytest.fail("Укажите DATABASE_URL или запустите docker compose exec api pytest.")
    schema = f"test_{uuid4().hex}"
    with psycopg.connect(base_dsn, autocommit=True) as admin:
        admin.execute(sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(schema)))
        dsn = make_conninfo(base_dsn, options=f"-c search_path={schema}")
        monkeypatch.setenv("DATABASE_URL", dsn)
        try:
            with psycopg.connect(dsn, row_factory=dict_row) as conn:
                initialize(conn)
            yield dsn
        finally:
            admin.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(schema)))


@pytest.fixture
def client(database):
    with TestClient(app) as http:
        yield http

from collections.abc import Iterator
from contextlib import contextmanager

from fastapi.testclient import TestClient
from sqlalchemy import Connection
from sqlalchemy.orm import Session


def assert_ping(client: TestClient) -> None:
    response = client.get("/api/lab/ping")
    assert response.status_code == 200
    # TODO 19: Проверьте, что поле status в JSON равно "ok".


@contextmanager
def transactional_session(connection: Connection) -> Iterator[Session]:
    # TODO 20: Используйте SAVEPOINT, чтобы commit и rollback сессии не завершали внешнюю транзакцию.
    with Session(bind=connection, join_transaction_mode="rollback_only") as session:
        yield session


# TODO 21: Добавьте неверные значения для title и stock.
INVALID_DISKS = [
    ({"title": "Gran Turismo 4", "price_rub": 0, "stock": 1}, "price_rub"),
]

from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

import psycopg
import pytest


def test_base_catalog_and_existing_card(client):
    assert client.get("/api/health").json() == {"status": "ok"}
    games = client.get("/api/games").json()
    assert len(games) == 6
    response = client.get(f"/api/games/{games[0]['id']}")
    assert response.status_code == 200
    assert response.json() == games[0]


def test_lesson_01_price_limit_combines_with_genre(client):
    response = client.get("/api/games", params={"genre": "Гонки", "max_price": 990})
    assert response.status_code == 200
    assert [game["title"] for game in response.json()] == ["Gran Turismo 4"]
    assert client.get("/api/games?max_price=1").json() == []
    assert client.get("/api/games?max_price=0").status_code == 422


def test_lesson_02_missing_card_is_404(client):
    response = client.get("/api/games/99999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Игра не найдена"}


@pytest.mark.parametrize("quantity", [0, 6])
def test_lesson_03_quantity_limits_return_422(client, quantity):
    response = client.post("/api/orders", json={"game_id": 1, "buyer": "Толя", "quantity": quantity})
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "quantity"]


def test_lesson_03_upper_boundary_is_valid(client):
    response = client.post("/api/orders", json={"game_id": 1, "buyer": "Толя", "quantity": 5})
    assert response.status_code == 409


def test_lesson_04_sort_uses_id_as_tie_breaker(client, database):
    with psycopg.connect(database) as conn:
        conn.execute("UPDATE games SET price_rub = 990 WHERE id = 4")
    games = client.get("/api/games?sort=price_asc").json()
    keys = [(game["price_rub"], game["id"]) for game in games]
    assert keys == sorted(keys)
    original = client.get("/api/games").json()
    assert [game["id"] for game in original] == list(range(1, 7))
    assert client.get("/api/games?sort=unsupported").status_code == 422


def test_lesson_05_order_updates_stock_and_keeps_server_price(client, database):
    order = {"game_id": 1, "buyer": "Толя", "quantity": 2}
    response = client.post("/api/orders", json={**order, "total_rub": 1})
    assert response.status_code == 201
    assert response.json()["total_rub"] == 1980
    assert client.get("/api/games/1").json()["stock"] == 1
    assert client.post("/api/orders", json=order).status_code == 409
    with psycopg.connect(database) as conn:
        assert conn.execute("SELECT game_id, quantity, total_rub FROM orders").fetchall() == [(1, 2, 1980)]


def test_lesson_05_concurrent_orders_can_only_sell_last_disk_once(client, database):
    order = {"game_id": 2, "buyer": "Толя", "quantity": 1}
    start = Barrier(2, timeout=10)

    def buy(_):
        start.wait()
        return client.post("/api/orders", json=order).status_code

    with ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(buy, range(2))) == [201, 409]
    with psycopg.connect(database) as conn:
        assert conn.execute("SELECT stock FROM games WHERE id = 2").fetchone() == (0,)
        assert conn.execute("SELECT count(*) FROM orders").fetchone() == (1,)


def test_lesson_05_failed_insert_rolls_back_stock(client, database):
    with psycopg.connect(database) as conn:
        conn.execute("ALTER TABLE orders ADD CHECK (buyer <> 'rollback')")
    with pytest.raises(psycopg.errors.CheckViolation):
        client.post("/api/orders", json={"game_id": 1, "buyer": "rollback", "quantity": 1})
    assert client.get("/api/games/1").json()["stock"] == 3
    with psycopg.connect(database) as conn:
        assert conn.execute("SELECT count(*) FROM orders").fetchone() == (0,)

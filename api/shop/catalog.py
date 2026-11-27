from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from psycopg import Connection

from .db import get_db
from .models import Game

router = APIRouter(prefix="/api/games", tags=["catalog"])
Database = Annotated[Connection, Depends(get_db)]


@router.get("", response_model=list[Game])
def list_games(
    db: Database,
    genre: Annotated[str | None, Query(min_length=1)] = None,
    max_price: Annotated[int | None, Query(gt=0)] = None,
    sort: Literal["default", "price_asc"] = "default",
):
    conditions = []
    params = []
    if genre is not None:
        conditions.append("genre = %s")
        params.append(genre)
    # TODO 03: Добавьте условие для max_price.
    where = " WHERE " + " AND ".join(conditions) if conditions else ""
    # TODO 03: Добавьте сортировку price_asc с id для одинаковых цен.
    order_by = "id"
    return db.execute(
        f"SELECT * FROM games{where} ORDER BY {order_by}", params
    ).fetchall()


@router.get("/{game_id}", response_model=Game | None)
def get_game(game_id: int, db: Database):
    game = db.execute("SELECT * FROM games WHERE id = %s", (game_id,)).fetchone()
    # TODO 06: Если игра отсутствует, верните HTTP 404 с detail="Игра не найдена".
    return game

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection

from .db import get_db
from .models import OrderInput, OrderResult

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", status_code=201, response_model=OrderResult)
def create_order(order: OrderInput, db: Annotated[Connection, Depends(get_db)]):
    if order.quantity <= 0:
        raise HTTPException(400, "Количество должно быть положительным")

    with db.transaction():
        game = db.execute(
            "SELECT price_rub, stock FROM games WHERE id = %s FOR UPDATE",
            (order.game_id,),
        ).fetchone()
        if game is None:
            raise HTTPException(404, "Игра не найдена")
        if game["stock"] < order.quantity:
            raise HTTPException(409, "Недостаточно дисков")
        # TODO 25: Спишите остаток через UPDATE в этой же транзакции.
        result = db.execute(
            """INSERT INTO orders (game_id, buyer, quantity, total_rub)
               VALUES (%s, %s, %s, %s)
               RETURNING id, game_id, quantity, total_rub""",
            (order.game_id, order.buyer, order.quantity, game["price_rub"] * order.quantity),
        ).fetchone()
    return result

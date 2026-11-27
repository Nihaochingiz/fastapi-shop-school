from typing import Literal

from pydantic import BaseModel, Field


class Game(BaseModel):
    id: int
    title: str
    genre: str
    condition: Literal["good", "excellent"]
    price_rub: int
    stock: int
    description: str


class OrderInput(BaseModel):
    game_id: int = Field(gt=0)
    buyer: str
    # TODO 04: Ограничьте количество диапазоном 1–5.
    quantity: int


class OrderResult(BaseModel):
    id: int
    game_id: int
    quantity: int
    total_rub: int

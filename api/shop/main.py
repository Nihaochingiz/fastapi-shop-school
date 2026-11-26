from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import catalog, orders
from .db import connect, initialize


@asynccontextmanager
async def lifespan(app: FastAPI):
    with connect() as conn:
        initialize(conn)
    yield


app = FastAPI(title="Магазин дисков Толи", version="1.0.0", lifespan=lifespan)
app.include_router(catalog.router)
app.include_router(orders.router)


@app.get("/api/health")
def health():
    with connect() as conn:
        conn.execute("SELECT 1")
    return {"status": "ok"}

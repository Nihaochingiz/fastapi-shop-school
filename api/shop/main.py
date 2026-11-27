from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import catalog, orders
from .db import connect, initialize
from .lab.database import make_engine, migrate
from .lab.routes import router as lab_router
from .lab.settings import Settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    with connect() as conn:
        initialize(conn)
    settings = Settings()
    engine = make_engine(settings.database_url)
    try:
        migrate(engine)
        app.state.lab_engine = engine
        app.state.lab_settings = settings
        yield
    finally:
        engine.dispose()


app = FastAPI(title="Магазин дисков Толи", version="2.0.0", lifespan=lifespan)
app.include_router(catalog.router)
app.include_router(orders.router)
app.include_router(lab_router)


@app.get("/api/health")
def health():
    with connect() as conn:
        conn.execute("SELECT 1")
    return {"status": "ok"}

# TODO 12: Перенесите регистрацию этого маршрута в APIRouter лаборатории.
@app.get("/api/lab/about")
def lab_about():
    return {"module": "shop.main"}

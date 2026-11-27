from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import get_session
from .models import LabDisk, LabUser
from .repositories import count_disks, find_user, get_disk
from .schemas import Credentials, DiskInput, DiskOutput, TokenOutput, UserOutput
from .security import DUMMY_HASH, hash_password, issue_token, read_subject, verify_password
from .services import DiskMissing, quote_order
from .settings import Settings

router = APIRouter(prefix="/api/lab", tags=["Учебная лаборатория"])
Db = Annotated[Session, Depends(get_session)]
bearer = HTTPBearer(auto_error=False)


@router.get("/info")
def info():
    # TODO 01: Добавьте сервер в описание.
    return {"client": "React", "api": "HTTP/JSON"}


# TODO 02: Зарегистрируйте ping как GET /ping.
def ping():
    # TODO 02: Верните {"status": "ok"}.
    return {"message": "pong"}


@router.get("/headers")
def headers(response: Response):
    # TODO 05: Установите заголовок Cache-Control: no-store.
    return {"revision": 1}


@router.get("/db")
def database(session: Db):
    # TODO 07: Добавьте имя текущей базы, полученное запросом к PostgreSQL.
    return {"version": session.scalar(text("SHOW server_version"))}


@router.get("/disks/count")
def inventory_count(session: Db):
    return {"count": count_disks(session)}


@router.get("/session")
def session_status():
    # TODO 09: Получите сессию через Depends и проверьте SELECT 1.
    return {"ready": False}


@router.post("/disks", status_code=201, response_model=DiskOutput)
def create_disk(data: DiskInput, session: Db):
    disk = LabDisk(**data.model_dump())
    session.add(disk)
    session.commit()
    session.refresh(disk)
    return disk


@router.get("/disks", response_model=list[DiskOutput])
def list_disks(session: Db):
    return session.scalars(select(LabDisk).order_by(LabDisk.id)).all()


def disk_or_404(session: Session, disk_id: int) -> LabDisk:
    disk = get_disk(session, disk_id)
    if disk is None:
        raise HTTPException(404, "Диск не найден")
    return disk


@router.get("/disks/{disk_id}", response_model=DiskOutput)
def read_disk(disk_id: int, session: Db):
    return disk_or_404(session, disk_id)


@router.put("/disks/{disk_id}", response_model=DiskOutput)
def replace_disk(disk_id: int, data: DiskInput, session: Db):
    # TODO 10: Найдите диск, обновите его поля, сохраните и верните.
    raise HTTPException(501, "Обновление ещё не реализовано")


@router.delete("/disks/{disk_id}", status_code=204)
def delete_disk(disk_id: int, session: Db):
    session.delete(disk_or_404(session, disk_id))
    session.commit()


@router.get("/quote/{disk_id}")
def quote(disk_id: int, session: Db, quantity: Annotated[int, Query(ge=1, le=5)] = 1):
    try:
        return {"total_rub": quote_order(session, disk_id, quantity)}
    except DiskMissing as error:
        raise HTTPException(404, "Диск не найден") from error


def get_settings(request: Request) -> Settings:
    return request.app.state.lab_settings


ShopSettings = Annotated[Settings, Depends(get_settings)]


@router.get("/settings")
def public_settings(settings: ShopSettings):
    # TODO 14: Используйте поле settings.shop_label.
    return {"shop_label": "Дисковая"}


@router.post("/register", status_code=201, response_model=UserOutput)
def register(data: Credentials, session: Db):
    user = LabUser(username=data.username, password_hash=hash_password(data.password))
    session.add(user)
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        # TODO 16: Верните статус конфликта при повторной регистрации.
        raise HTTPException(422, "Имя пользователя занято") from error
    session.refresh(user)
    return user


@router.post("/login", response_model=TokenOutput)
def login(data: Credentials, session: Db, settings: ShopSettings):
    user = find_user(session, data.username)
    stored = user.password_hash if user else DUMMY_HASH
    if not verify_password(data.password, stored) or user is None:
        raise HTTPException(401, "Неверные учётные данные")
    return TokenOutput(access_token=issue_token(user.id, settings))


def auth_error() -> HTTPException:
    # TODO 18: Добавьте WWW-Authenticate: Bearer.
    return HTTPException(401, "Нужен действительный токен")


def current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    session: Db,
    settings: ShopSettings,
) -> LabUser:
    if credentials is None:
        raise auth_error()
    try:
        user_id = read_subject(credentials.credentials, settings)
    except (jwt.InvalidTokenError, ValueError) as error:
        raise auth_error() from error
    user = session.get(LabUser, user_id)
    if user is None:
        raise auth_error()
    return user


@router.get("/me", response_model=UserOutput)
def me():
    # TODO 18: Подключите current_user через Depends и верните публичный профиль.
    raise HTTPException(503, "Профиль появится после настройки авторизации")


# TODO 12: Подключите APIRouter из shop.lab.about с помощью include_router().

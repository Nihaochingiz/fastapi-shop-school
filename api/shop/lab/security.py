from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from .settings import Settings

ALGORITHM = "HS256"


def hash_password(password: str, rounds: int = 12) -> str:
    # TODO 15: Передайте запрошенное число раундов, сохранив безопасное значение по умолчанию.
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("ascii")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("ascii"))


# An unknown username takes the same bcrypt verification path as an existing one.
DUMMY_HASH = hash_password("unused dummy password")


def issue_token(user_id: int, settings: Settings, now: datetime | None = None) -> str:
    issued = now if now is not None else datetime.now(timezone.utc)
    # TODO 17: Возьмите срок в минутах из settings.
    expires = issued + timedelta(minutes=15)
    claims = {"sub": str(user_id), "iat": issued, "exp": expires}
    return jwt.encode(claims, settings.jwt_secret.get_secret_value(), algorithm=ALGORITHM)


def read_subject(token: str, settings: Settings) -> int:
    claims = jwt.decode(
        token, settings.jwt_secret.get_secret_value(), algorithms=[ALGORITHM],
        options={"require": ["sub", "iat", "exp"]},
    )
    return int(claims["sub"])

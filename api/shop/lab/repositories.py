from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import LabDisk, LabUser


def get_disk(session: Session, disk_id: int) -> LabDisk | None:
    return session.get(LabDisk, disk_id)


def count_disks(session: Session) -> int:
    # TODO 08: Получите COUNT(*) из таблицы модели LabDisk.
    return 0


def find_user(session: Session, username: str) -> LabUser | None:
    return session.scalar(select(LabUser).where(LabUser.username == username))

from sqlalchemy.orm import Session

from .repositories import get_disk


class DiskMissing(Exception):
    pass


def quote_order(session: Session, disk_id: int, quantity: int) -> int:
    disk = get_disk(session, disk_id)
    if disk is None:
        raise DiskMissing
    # TODO 13: Рассчитайте сумму за quantity экземпляров.
    return disk.price_rub

from sqlalchemy import CheckConstraint, Index, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class LabDisk(Base):
    __tablename__ = "lab_disks"
    __table_args__ = (
        Index("ix_lab_disks_title", "title"),
        CheckConstraint("price_rub > 0", name="ck_lab_disks_positive_price"),
        CheckConstraint("stock >= 0", name="ck_lab_disks_nonnegative_stock"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    price_rub: Mapped[int]
    stock: Mapped[int]


class LabUser(Base):
    __tablename__ = "lab_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(32), unique=True)
    password_hash: Mapped[str] = mapped_column(String(60))

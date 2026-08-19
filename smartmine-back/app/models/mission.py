from sqlalchemy import Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import MissionStatus
from app.models.base import Base, TimestampMixin


class Shovel(Base):
    __tablename__ = "shovels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    shovel_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="active")
    queue_count: Mapped[int] = mapped_column(Integer, default=0)
    latitude: Mapped[float] = mapped_column(Float, default=35.25)
    longitude: Mapped[float] = mapped_column(Float, default=58.99)


class Crusher(Base):
    __tablename__ = "crushers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    crusher_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="active")
    latitude: Mapped[float] = mapped_column(Float, default=35.29)
    longitude: Mapped[float] = mapped_column(Float, default=59.01)


class Mission(Base, TimestampMixin):
    __tablename__ = "missions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    truck_id: Mapped[int] = mapped_column(ForeignKey("trucks.id"), index=True)
    driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True)
    shovel_id: Mapped[int] = mapped_column(ForeignKey("shovels.id"))
    crusher_id: Mapped[int] = mapped_column(ForeignKey("crushers.id"))
    distance_km: Mapped[float] = mapped_column(Float)
    eta_min: Mapped[int] = mapped_column(Integer)
    cycle_time_min: Mapped[float] = mapped_column(Float)
    status: Mapped[MissionStatus] = mapped_column(Enum(MissionStatus), default=MissionStatus.READY)

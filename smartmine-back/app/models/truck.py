from sqlalchemy import Enum, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import TruckStatus
from app.models.base import Base, TimestampMixin


class Truck(Base, TimestampMixin):
    __tablename__ = "trucks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    truck_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    model: Mapped[str] = mapped_column(String(120), default="CAT 777")
    status: Mapped[TruckStatus] = mapped_column(Enum(TruckStatus), default=TruckStatus.AVAILABLE)
    driver_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    capacity_ton: Mapped[float] = mapped_column(Float, default=35.0)
    fuel_level: Mapped[float] = mapped_column(Float, default=70.0)
    speed: Mapped[float] = mapped_column(Float, default=0.0)
    latitude: Mapped[float] = mapped_column(Float, default=35.25)
    longitude: Mapped[float] = mapped_column(Float, default=58.99)
    health_score: Mapped[float] = mapped_column(Float, default=85.0)

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    truck_id: Mapped[int] = mapped_column(ForeignKey("trucks.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    rpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    engine_temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    oil_pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    fuel_level: Mapped[float | None] = mapped_column(Float, nullable=True)
    payload: Mapped[float | None] = mapped_column(Float, nullable=True)
    tire_pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    vibration: Mapped[float | None] = mapped_column(Float, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

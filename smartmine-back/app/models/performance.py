from sqlalchemy import Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import ShiftType
from app.models.base import Base, TimestampMixin


class PerformanceRecord(Base, TimestampMixin):
    __tablename__ = "performance_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), index=True)
    truck_id: Mapped[int] = mapped_column(ForeignKey("trucks.id"), index=True)
    shift: Mapped[ShiftType] = mapped_column(Enum(ShiftType))
    cycle_count: Mapped[int] = mapped_column(Integer)
    payload_ton: Mapped[float] = mapped_column(Float)
    average_cycle_time: Mapped[float] = mapped_column(Float)
    waiting_time: Mapped[float] = mapped_column(Float)
    idle_time: Mapped[float] = mapped_column(Float)
    fuel_consumption: Mapped[float] = mapped_column(Float)
    speeding_events: Mapped[int] = mapped_column(Integer)
    harsh_braking_events: Mapped[int] = mapped_column(Integer)
    safety_events: Mapped[int] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    overall_score: Mapped[float] = mapped_column(Float)
    production_score: Mapped[float] = mapped_column(Float)
    efficiency_score: Mapped[float] = mapped_column(Float)
    safety_score: Mapped[float] = mapped_column(Float)
    fuel_score: Mapped[float] = mapped_column(Float)

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import DriverStatus, ShiftType
from app.models.base import Base, TimestampMixin


class Driver(Base, TimestampMixin):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    driver_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    shift: Mapped[ShiftType] = mapped_column(Enum(ShiftType), default=ShiftType.MORNING)
    status: Mapped[DriverStatus] = mapped_column(Enum(DriverStatus), default=DriverStatus.ACTIVE)
    truck_id: Mapped[int | None] = mapped_column(ForeignKey("trucks.id"), nullable=True)

    truck = relationship("Truck", foreign_keys=[truck_id], post_update=True)

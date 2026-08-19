from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import AlertSeverity, AlertType
from app.models.base import Base, TimestampMixin


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150))
    message: Mapped[str] = mapped_column(String(500))
    type: Mapped[AlertType] = mapped_column(Enum(AlertType), index=True)
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity), index=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

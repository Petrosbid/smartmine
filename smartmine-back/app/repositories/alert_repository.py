from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import AlertSeverity, AlertType
from app.models.alert import Notification


class AlertRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(
        self,
        type_: AlertType | None = None,
        severity: AlertSeverity | None = None,
        read: bool | None = None,
    ) -> list[Notification]:
        stmt = select(Notification).order_by(Notification.created_at.desc())
        if type_ is not None:
            stmt = stmt.where(Notification.type == type_)
        if severity is not None:
            stmt = stmt.where(Notification.severity == severity)
        if read is not None:
            stmt = stmt.where(Notification.is_read == read)
        return list(self.db.scalars(stmt))

    def get_by_id(self, notification_id: int) -> Notification | None:
        return self.db.get(Notification, notification_id)

    def save(self, notification: Notification) -> Notification:
        self.db.add(notification)
        self.db.flush()
        return notification

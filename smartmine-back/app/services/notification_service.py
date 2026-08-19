from sqlalchemy.orm import Session

from app.core.enums import AlertSeverity, AlertType
from app.core.exceptions import NotFoundError
from app.repositories.alert_repository import AlertRepository
from app.schemas.notification import NotificationResponse
from app.services.serializers import to_notification_schema


class NotificationService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = AlertRepository(db)

    def list(
        self,
        type_: AlertType | None,
        severity: AlertSeverity | None,
        read: bool | None,
    ) -> list[NotificationResponse]:
        rows = self.repo.list_all(type_=type_, severity=severity, read=read)
        return [to_notification_schema(row) for row in rows]

    def mark_read(self, notification_id: int) -> NotificationResponse:
        row = self.repo.get_by_id(notification_id)
        if row is None:
            raise NotFoundError(f"Notification {notification_id} was not found")

        row.is_read = True
        self.repo.save(row)
        self.db.commit()
        return to_notification_schema(row)

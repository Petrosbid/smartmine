from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.enums import AlertSeverity, AlertType
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse], summary="List notifications")
def list_notifications(
    type_: AlertType | None = Query(default=None, alias="type"),
    severity: AlertSeverity | None = Query(default=None),
    read: bool | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[NotificationResponse]:
    return NotificationService(db).list(type_=type_, severity=severity, read=read)


@router.patch("/{notification_id}/read", response_model=NotificationResponse, summary="Mark notification as read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)) -> NotificationResponse:
    return NotificationService(db).mark_read(notification_id)

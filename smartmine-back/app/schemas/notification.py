from datetime import datetime

from pydantic import BaseModel

from app.core.enums import AlertSeverity, AlertType


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: AlertType
    severity: AlertSeverity
    read: bool
    created_at: datetime

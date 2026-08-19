from enum import StrEnum


class TruckStatus(StrEnum):
    AVAILABLE = "available"
    IN_MISSION = "in_mission"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class DriverStatus(StrEnum):
    ACTIVE = "active"
    RESTING = "resting"
    OFF_DUTY = "off_duty"


class ShiftType(StrEnum):
    MORNING = "morning"
    EVENING = "evening"
    NIGHT = "night"


class AlertSeverity(StrEnum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertType(StrEnum):
    SAFETY = "safety"
    VEHICLE = "vehicle"
    MISSION = "mission"
    SYSTEM = "system"


class MissionStatus(StrEnum):
    READY = "ready"
    IN_PROGRESS = "in_progress"
    WAITING = "waiting"
    COMPLETED = "completed"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

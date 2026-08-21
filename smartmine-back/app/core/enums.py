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
    ASSIGNED = "assigned"
    EN_ROUTE_TO_SHOVEL = "en_route_to_shovel"
    WAITING_FOR_LOADING = "waiting_for_loading"
    LOADING = "loading"
    HAULING = "hauling"
    WAITING_FOR_DUMP = "waiting_for_dump"
    DUMPING = "dumping"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

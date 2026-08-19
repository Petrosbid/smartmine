from fastapi import APIRouter

from app.api.v1 import (
    ai,
    auth,
    comparison,
    dashboard,
    dispatch,
    drivers,
    missions,
    notifications,
    performance,
    profile,
    simulation,
    telemetry,
    trucks,
    vehicle_health,
)

router = APIRouter()
router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(drivers.router)
router.include_router(trucks.router)
router.include_router(telemetry.router)
router.include_router(performance.router)
router.include_router(dispatch.router)
router.include_router(missions.router)
router.include_router(vehicle_health.router)
router.include_router(ai.router)
router.include_router(simulation.router)
router.include_router(comparison.router)
router.include_router(notifications.router)
router.include_router(profile.router)

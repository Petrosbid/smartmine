from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.driver import DriverProfileResponse
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/drivers", tags=["Drivers"])


@router.get(
    "/{driver_id}",
    response_model=DriverProfileResponse,
    summary="Get driver profile with metrics",
)
def get_driver(driver_id: str, db: Session = Depends(get_db)) -> DriverProfileResponse:
    return ProfileService(db).get_driver_profile(driver_id)

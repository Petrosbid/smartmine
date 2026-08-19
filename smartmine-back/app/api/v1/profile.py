from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.driver import DriverProfileResponse
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=DriverProfileResponse, summary="Get active driver profile")
def get_profile(driver_id: str = Query(default="D-102"), db: Session = Depends(get_db)) -> DriverProfileResponse:
    return ProfileService(db).get_driver_profile(driver_id)

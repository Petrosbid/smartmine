from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.driver import Driver


class DriverRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_code(self, driver_code: str) -> Driver | None:
        stmt = select(Driver).where(Driver.driver_code == driver_code)
        return self.db.scalar(stmt)

    def list_all(self) -> list[Driver]:
        return list(self.db.scalars(select(Driver).order_by(Driver.driver_code)))

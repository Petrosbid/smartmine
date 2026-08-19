from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.truck import Truck


class TruckRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_code(self, truck_code: str) -> Truck | None:
        stmt = select(Truck).where(Truck.truck_code == truck_code)
        return self.db.scalar(stmt)

    def list_all(self) -> list[Truck]:
        return list(self.db.scalars(select(Truck).order_by(Truck.truck_code)))

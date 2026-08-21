import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models.base import Base as ModelsBase
from app.seed.seed_data import seed

TEST_DATABASE_URL = "sqlite:///./test_smartmine.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False, expire_on_commit=False)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_test_db():
    ModelsBase.metadata.drop_all(bind=test_engine)
    ModelsBase.metadata.create_all(bind=test_engine)
    with TestSessionLocal() as db:
        seed(db)
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

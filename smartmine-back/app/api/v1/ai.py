from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.ai import AIChatRequest, AIChatResponse
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat", response_model=AIChatResponse, summary="Ask SmartMine AI assistant")
def chat(payload: AIChatRequest, db: Session = Depends(get_db)) -> AIChatResponse:
    return get_ai_service(db).chat(payload)

from pydantic import BaseModel


class AIChatRequest(BaseModel):
    message: str
    driver_id: str
    truck_id: str


class AIChatResponse(BaseModel):
    message: str
    sources: list[str]
    context: dict[str, object]

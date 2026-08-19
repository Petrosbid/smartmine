from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Meta(BaseModel):
    total: int


class DataResponse(BaseModel, Generic[T]):
    data: T


class CollectionResponse(BaseModel, Generic[T]):
    data: list[T]
    meta: Meta

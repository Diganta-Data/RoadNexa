"""Pydantic schemas for City endpoints."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CityBase(BaseModel):
    city_name: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    country: str = Field("India", max_length=100)
    latitude: float
    longitude: float
    active: bool = True


class CityCreate(CityBase):
    pass


class CityUpdate(BaseModel):
    active: bool | None = None


class CityResponse(CityBase):
    city_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

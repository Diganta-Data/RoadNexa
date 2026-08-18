"""City management routes."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from iris.api.dependencies import get_db
from iris.api.schemas.cities import CityCreate, CityResponse
from iris.services import city_service

router = APIRouter(tags=["Cities"])


@router.get("/", response_model=list[CityResponse])
async def read_cities(db: AsyncSession = Depends(get_db)):
    return await city_service.get_all_cities(db)


@router.post("/", response_model=CityResponse, status_code=status.HTTP_201_CREATED)
async def create_city(city_in: CityCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await city_service.create_city(db, city_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{city_id}", response_model=CityResponse)
async def read_city(city_id: UUID, db: AsyncSession = Depends(get_db)):
    city = await city_service.get_city_by_id(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city

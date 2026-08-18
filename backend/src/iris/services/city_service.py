"""City CRUD operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from iris.api.schemas.cities import CityCreate
from iris.models.core import City


async def get_all_cities(db: AsyncSession) -> list[City]:
    result = await db.execute(select(City).order_by(City.city_name))
    return list(result.scalars().all())


async def get_city_by_id(db: AsyncSession, city_id: UUID) -> City | None:
    result = await db.execute(select(City).where(City.city_id == city_id))
    return result.scalars().first()


async def create_city(db: AsyncSession, city_in: CityCreate) -> City:
    db_city = City(
        city_name=city_in.city_name,
        state=city_in.state,
        country=city_in.country,
        latitude=city_in.latitude,
        longitude=city_in.longitude,
        active=city_in.active,
    )
    db.add(db_city)
    try:
        await db.commit()
        await db.refresh(db_city)
        return db_city
    except IntegrityError as e:
        await db.rollback()
        raise ValueError("Duplicate city or integrity error.") from e

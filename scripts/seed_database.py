"""Seed the database with synthetic demo data (Kolkata)."""

import asyncio
import os
import random
import sys
from datetime import datetime, timedelta
from uuid import uuid4

# Ensure backend/src is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/src')))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from iris.database.session import async_session_factory
from iris.models.core import City, Road, POI
from iris.models.facts import Accident, Traffic, Pothole


async def clean_demo_data(session: AsyncSession):
    """Remove existing synthetic data."""
    print("Cleaning existing synthetic data...")
    for model in [Accident, Traffic, Pothole, POI, Road]:
        await session.execute(delete(model).where(model.is_synthetic == True))
    await session.commit()


async def generate_kolkata_demo(session: AsyncSession):
    print("Generating IRIS Synthetic Demo Dataset (Kolkata)...")
    
    # 1. Create or get Kolkata City
    result = await session.execute(select(City).where(City.city_name == "Kolkata (Demo)"))
    city = result.scalars().first()
    if not city:
        city = City(
            city_id=uuid4(),
            city_name="Kolkata (Demo)",
            state="West Bengal",
            latitude=22.5726,
            longitude=88.3639,
            active=True
        )
        session.add(city)
        await session.commit()
        await session.refresh(city)

    # 2. Generate Roads
    print("Generating roads...")
    roads = []
    road_types = ["highway", "arterial", "local", "residential"]
    surfaces = ["asphalt", "concrete", "unpaved"]
    
    for i in range(50):
        # Generate simple linestring around Kolkata
        lat_start = 22.5 + random.uniform(-0.1, 0.1)
        lon_start = 88.3 + random.uniform(-0.1, 0.1)
        lat_end = lat_start + random.uniform(-0.01, 0.01)
        lon_end = lon_start + random.uniform(-0.01, 0.01)
        geom = f"LINESTRING({lon_start} {lat_start}, {lon_end} {lat_end})"
        
        road = Road(
            road_id=uuid4(),
            city_id=city.city_id,
            road_name=f"Demo Road {i+1}",
            road_type=random.choice(road_types),
            geometry=geom,
            lanes=random.choice([2, 4, 6]),
            speed_limit=random.choice([30, 40, 60, 80]),
            surface=random.choice(surfaces),
            is_synthetic=True
        )
        roads.append(road)
    
    session.add_all(roads)
    await session.commit()

    # 3. Generate Accidents
    print("Generating accidents...")
    accidents = []
    severities = ["fatal", "severe", "minor", "damage_only"]
    weathers = ["clear", "rain", "fog"]
    
    for _ in range(200):
        road = random.choice(roads)
        lat = 22.5 + random.uniform(-0.1, 0.1)
        lon = 88.3 + random.uniform(-0.1, 0.1)
        geom = f"POINT({lon} {lat})"
        
        acc = Accident(
            accident_id=uuid4(),
            city_id=city.city_id,
            road_id=road.road_id,
            accident_date=datetime.now().date() - timedelta(days=random.randint(0, 365)),
            latitude=lat,
            longitude=lon,
            geometry=geom,
            severity=random.choices(severities, weights=[0.05, 0.15, 0.5, 0.3])[0],
            weather_condition=random.choice(weathers),
            is_synthetic=True
        )
        accidents.append(acc)
        
    session.add_all(accidents)

    # 4. Generate Potholes
    print("Generating potholes...")
    potholes = []
    
    for _ in range(100):
        road = random.choice(roads)
        lat = 22.5 + random.uniform(-0.1, 0.1)
        lon = 88.3 + random.uniform(-0.1, 0.1)
        geom = f"POINT({lon} {lat})"
        
        p = Pothole(
            pothole_id=uuid4(),
            city_id=city.city_id,
            road_id=road.road_id,
            latitude=lat,
            longitude=lon,
            geometry=geom,
            severity=random.choice(["low", "medium", "high", "critical"]),
            status=random.choice(["reported", "in_progress", "repaired"]),
            is_synthetic=True
        )
        potholes.append(p)

    session.add_all(potholes)
    await session.commit()
    print("Demo dataset generation complete!")


async def main():
    async with async_session_factory() as session:
        await clean_demo_data(session)
        await generate_kolkata_demo(session)


if __name__ == "__main__":
    asyncio.run(main())

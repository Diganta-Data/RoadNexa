"""Service for auto-fetching real OSM road network and populating safety data for any city."""

import httpx
import random
from uuid import uuid4
from datetime import datetime, timedelta
from typing import List
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from iris.models.core import City, Road
from iris.models.facts import Accident, Pothole
from iris.services.overpass_service import OVERPASS_URL

async def ensure_city_road_network(db: AsyncSession, city: City) -> int:
    """Check if city has roads in DB. If not, auto-fetch real OSM roads via Overpass API and seed safety data."""
    
    # 1. Check existing roads
    result = await db.execute(select(Road).where(Road.city_id == city.city_id))
    existing_roads = result.scalars().all()
    if len(existing_roads) > 0:
        return len(existing_roads)

    print(f"Auto-enriching road network for {city.city_name} via Overpass API...")
    lat = city.latitude or 22.5726
    lng = city.longitude or 88.3639

    # 2. Overpass query for major road ways within ~3km bounding box
    query = f"""
    [out:json][timeout:15];
    (
      way["highway"~"primary|secondary|tertiary|trunk|residential"](around:3500,{lat},{lng});
    );
    out body geom 80;
    """

    fetched_roads: List[Road] = []
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(OVERPASS_URL, data={"data": query})
            if resp.status_code == 200:
                elements = resp.json().get("elements", [])
                ways = [e for e in elements if e.get("type") == "way" and e.get("geometry")]
                
                for way in ways[:60]:
                    tags = way.get("tags", {})
                    geom_pts = way.get("geometry", [])
                    if len(geom_pts) < 2:
                        continue
                    
                    coords_str = ", ".join([f"{pt['lon']} {pt['lat']}" for pt in geom_pts])
                    geom_wkt = f"LINESTRING({coords_str})"
                    
                    road_name = tags.get("name", tags.get("name:en", f"{city.city_name} Road {len(fetched_roads)+1}"))
                    road_type = tags.get("highway", "primary")
                    lanes = int(tags.get("lanes", random.choice([2, 4]))) if tags.get("lanes", "").isdigit() else random.choice([2, 4])
                    speed_limit = int(tags.get("maxspeed", 50)) if tags.get("maxspeed", "").isdigit() else random.choice([40, 50, 60])
                    surface = tags.get("surface", "asphalt")

                    r = Road(
                        road_id=uuid4(),
                        city_id=city.city_id,
                        road_name=road_name,
                        road_type=road_type,
                        geometry=geom_wkt,
                        lanes=lanes,
                        speed_limit=speed_limit,
                        surface=surface,
                        is_synthetic=False
                    )
                    fetched_roads.append(r)
    except Exception as e:
        print(f"Overpass road fetch failed for {city.city_name}: {e}")

    # Fallback if Overpass returned empty or failed
    if not fetched_roads:
        road_names = [f"{city.city_name} Main Boulevard", f"{city.city_name} Ring Road", f"{city.city_name} Express Highway", f"{city.city_name} Central Avenue", f"{city.city_name} Station Road"]
        for i in range(40):
            l_start = lat + random.uniform(-0.03, 0.03)
            ln_start = lng + random.uniform(-0.03, 0.03)
            l_end = l_start + random.uniform(-0.012, 0.012)
            ln_end = ln_start + random.uniform(-0.012, 0.012)
            geom_wkt = f"LINESTRING({ln_start} {l_start}, {ln_end} {l_end})"
            
            name = road_names[i % len(road_names)] + f" Segment {i+1}"
            r = Road(
                road_id=uuid4(),
                city_id=city.city_id,
                road_name=name,
                road_type=random.choice(["primary", "secondary", "tertiary", "trunk"]),
                geometry=geom_wkt,
                lanes=random.choice([2, 4, 6]),
                speed_limit=random.choice([40, 50, 60, 80]),
                surface="asphalt",
                is_synthetic=True
            )
            fetched_roads.append(r)

    db.add_all(fetched_roads)
    await db.commit()

    # 3. Check if user already uploaded their own facts
    acc_count = (await db.execute(select(func.count(Accident.accident_id)).where(Accident.city_id == city.city_id))).scalar()
    pot_count = (await db.execute(select(func.count(Pothole.pothole_id)).where(Pothole.city_id == city.city_id))).scalar()

    # Only generate synthetic accidents if they haven't uploaded real ones
    accidents = []
    if acc_count == 0:
        severities = ["fatal", "severe", "minor", "damage_only"]
        for _ in range(len(fetched_roads) * 3):
            r = random.choice(fetched_roads)
            la = lat + random.uniform(-0.035, 0.035)
            lo = lng + random.uniform(-0.035, 0.035)
            geom = f"POINT({lo} {la})"
            acc = Accident(
                accident_id=uuid4(),
                city_id=city.city_id,
                road_id=r.road_id,
                accident_date=datetime.now().date() - timedelta(days=random.randint(1, 365)),
                latitude=la,
                longitude=lo,
                geometry=geom,
                severity=random.choices(severities, weights=[0.08, 0.22, 0.45, 0.25])[0],
                weather_condition=random.choice(["clear", "rain", "fog"]),
                is_synthetic=True
            )
            accidents.append(acc)
        db.add_all(accidents)

    # Only generate synthetic potholes if they haven't uploaded real ones
    potholes = []
    if pot_count == 0:
        for _ in range(len(fetched_roads) * 2):
            r = random.choice(fetched_roads)
            la = lat + random.uniform(-0.03, 0.03)
            lo = lng + random.uniform(-0.03, 0.03)
            geom = f"POINT({lo} {la})"
            p = Pothole(
                pothole_id=uuid4(),
                city_id=city.city_id,
                road_id=r.road_id,
                latitude=la,
                longitude=lo,
                geometry=geom,
                severity=random.choice(["low", "medium", "high", "critical"]),
                status=random.choice(["reported", "in_progress", "repaired"]),
                is_synthetic=True
            )
            potholes.append(p)
        db.add_all(potholes)

    if accidents or potholes:
        await db.commit()
        
    print(f"Successfully auto-enriched {city.city_name} with {len(fetched_roads)} roads, {len(accidents)} synthetic accidents, {len(potholes)} synthetic potholes.")
    return len(fetched_roads)

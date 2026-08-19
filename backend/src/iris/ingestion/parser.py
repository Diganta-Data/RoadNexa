"""Data parser and ETL for uploaded datasets."""

import os
from datetime import date
from uuid import UUID

import pandas as pd
from geoalchemy2.elements import WKTElement
from shapely.geometry import LineString, Point, shape
from sqlalchemy.ext.asyncio import AsyncSession

from iris.models.core import Road
from iris.models.facts import Accident, Pothole, Traffic
from iris.services.upload_service import update_upload_status
from iris.utils.logger import logger


ALIASES = {
    "latitude": ["latitude", "lat", "y"],
    "longitude": ["longitude", "lng", "lon", "long", "x"],
    "accident_date": ["accident_date", "date", "crash_date", "incident_date"],
    "accident_time": ["accident_time", "time", "crash_time", "time_of_day"],
    "severity": ["severity", "severity_level", "crash_severity"],
    "accident_type": ["accident_type", "type", "collision_type"],
    "vehicles_involved": ["vehicles_involved", "vehicles", "vehicle_count"],
    "persons_killed": ["persons_killed", "killed", "fatalities"],
    "persons_injured": ["persons_injured", "injured", "injuries"],
    "weather_condition": ["weather_condition", "weather"],
    "road_condition": ["road_condition", "surface_condition"],
    "light_condition": ["light_condition", "lighting"],
    "road_name": ["road_name", "name", "street", "street_name"],
    "road_type": ["road_type", "type", "class", "highway"],
    "lanes": ["lanes", "lane_count"],
    "speed_limit": ["speed_limit", "speed", "maxspeed", "speed_limit_kmph"],
    "surface": ["surface", "surface_type"],
    "oneway": ["oneway", "one_way"],
    "length_m": ["length_m", "length", "length_meters"],
    "report_date": ["report_date", "date", "reported_at"],
    "status": ["status", "repair_status"],
    "observation_date": ["observation_date", "date"],
    "observation_time": ["observation_time", "time"],
    "traffic_volume": ["traffic_volume", "volume", "vehicle_count", "traffic_level"],
    "average_speed": ["average_speed", "avg_speed"],
    "congestion_level": ["congestion_level", "congestion"],
    "pothole_count_nearby": ["pothole_count_nearby", "pothole_count", "potholes_nearby"],
    "city": ["city", "city_name", "district"],
}


def _column_map(df: pd.DataFrame) -> dict[str, str]:
    by_lower = {str(col).strip().lower(): col for col in df.columns}
    resolved = {}
    for field, names in ALIASES.items():
        for name in names:
            if name in by_lower:
                resolved[field] = by_lower[name]
                break
    return resolved


def _value(row, columns: dict[str, str], name: str, default=None):
    column = columns.get(name)
    if not column:
        return default
    value = row.get(column, default)
    if pd.isna(value):
        return default
    return value


def _is_missing(value) -> bool:
    if value is None:
        return True
    try:
        return bool(pd.isna(value))
    except (TypeError, ValueError):
        return False


def _text(row, columns: dict[str, str], name: str, default=None):
    value = _value(row, columns, name, default)
    return default if value is None else str(value).strip()


def _float(row, columns: dict[str, str], name: str):
    value = _value(row, columns, name)
    return None if value is None else float(value)


def _int(row, columns: dict[str, str], name: str):
    value = _value(row, columns, name)
    return None if value is None else int(float(value))


def _date(row, columns: dict[str, str], name: str, default_today=False):
    value = _value(row, columns, name)
    if _is_missing(value):
        return date.today() if default_today else None
    
    dt = pd.to_datetime(value, errors='coerce')
    if pd.isna(dt):
        return date.today() if default_today else None
    return dt.date()


def _time(row, columns: dict[str, str], name: str):
    value = _value(row, columns, name)
    if _is_missing(value):
        return None
    
    dt = pd.to_datetime(value, errors='coerce')
    if pd.isna(dt):
        return None
    return dt.time()


def _point_wkt(lat: float, lon: float) -> WKTElement:
    return WKTElement(Point(lon, lat).wkt, srid=4326)


def _point_from_row(row, columns: dict[str, str]) -> tuple[float, float] | None:
    lat = _float(row, columns, "latitude")
    lon = _float(row, columns, "longitude")
    if lat is not None and lon is not None:
      return lat, lon

    geometry = row.get("geometry")
    if _is_missing(geometry):
        return None
    if hasattr(geometry, "geom_type") and geometry.geom_type == "Point":
        return float(geometry.y), float(geometry.x)
    return None


def _line_wkt(row, columns: dict[str, str]) -> WKTElement | None:
    geometry = row.get("geometry")
    if not _is_missing(geometry):
        if hasattr(geometry, "wkt"):
            return WKTElement(geometry.wkt, srid=4326)
        text_value = str(geometry).strip()
        if text_value.upper().startswith("LINESTRING"):
            return WKTElement(text_value, srid=4326)

    lat = _float(row, columns, "latitude")
    lon = _float(row, columns, "longitude")
    if lat is None or lon is None:
        return None
    return WKTElement(LineString([(lon - 0.002, lat - 0.002), (lon + 0.002, lat + 0.002)]).wkt, srid=4326)


def _read_geojson(file_path: str) -> pd.DataFrame:
    import json
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    rows = []
    if isinstance(data, dict):
        if data.get("type") == "FeatureCollection":
            features = data.get("features", [])
        elif data.get("type") == "Feature":
            features = [data]
        else:
            features = []
    else:
        features = []

    for feat in features:
        row = {}
        row.update(feat.get("properties", {}))
        geom = feat.get("geometry")
        if geom:
            try:
                row["geometry"] = shape(geom)
            except Exception:
                pass
        rows.append(row)
    
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows)


def _read_zip(file_path: str) -> pd.DataFrame:
    import zipfile
    import tempfile
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_ref.extractall(temp_dir)
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    full_path = os.path.join(root, file)
                    ext = os.path.splitext(file)[1].lower()
                    if ext in {".csv", ".tsv", ".xlsx", ".xls", ".json", ".geojson"}:
                        return _read_upload_file(full_path)
    raise ValueError("No supported files (CSV, GeoJSON, Excel) found in the zip archive.")


def _read_upload_file(file_path: str) -> pd.DataFrame:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".csv":
        return pd.read_csv(file_path)
    if ext == ".tsv":
        return pd.read_csv(file_path, sep="\t")
    if ext in {".xlsx", ".xls"}:
        return pd.read_excel(file_path)
    if ext in {".json", ".geojson"}:
        try:
            return _read_geojson(file_path)
        except Exception:
            return pd.read_json(file_path)
    if ext == ".zip":
        return _read_zip(file_path)
    raise ValueError(
        f"Unsupported file format: {ext}. Supported: csv, tsv, xlsx, xls, json, geojson, zip."
    )


async def process_dataset(db: AsyncSession, upload_id: UUID, city_id: UUID, dataset_type: str, file_path: str):
    """Parse the uploaded file and ingest into the database."""
    import random
    from sqlalchemy import select
    from iris.models.core import City

    try:
        # Update status to processing
        await update_upload_status(db, upload_id, status="PROCESSING")
        
        df = _read_upload_file(file_path)
            
        columns = _column_map(df)
        inserted = 0
        potholes_generated = 0

        # Fetch city center for fallback coordinates
        city_result = await db.execute(select(City).where(City.city_id == city_id))
        city = city_result.scalars().first()
        city_lat = float(city.latitude) if city and city.latitude else 22.57
        city_lon = float(city.longitude) if city and city.longitude else 88.36

        for _, row in df.iterrows():
            if dataset_type == "accidents":
                point = _point_from_row(row, columns)
                if point is None:
                    # No lat/lon in CSV — scatter around city center
                    lat = city_lat + random.uniform(-0.04, 0.04)
                    lon = city_lon + random.uniform(-0.04, 0.04)
                else:
                    lat, lon = point
                
                db.add(Accident(
                    city_id=city_id,
                    accident_date=_date(row, columns, "accident_date", default_today=True),
                    accident_time=_time(row, columns, "accident_time"),
                    latitude=lat,
                    longitude=lon,
                    geometry=_point_wkt(lat, lon),
                    severity=(_text(row, columns, "severity", "minor") or "minor").lower(),
                    accident_type=_text(row, columns, "accident_type"),
                    vehicles_involved=_int(row, columns, "vehicles_involved"),
                    persons_killed=_int(row, columns, "persons_killed"),
                    persons_injured=_int(row, columns, "persons_injured"),
                    weather_condition=_text(row, columns, "weather_condition"),
                    road_condition=_text(row, columns, "road_condition"),
                    light_condition=_text(row, columns, "light_condition"),
                    source_record_id=str(upload_id),
                ))
                inserted += 1

                # Also generate pothole records from pothole_count_nearby
                pc = _int(row, columns, "pothole_count_nearby")
                if pc and pc > 0:
                    for _ in range(pc):
                        p_lat = lat + random.uniform(-0.002, 0.002)
                        p_lon = lon + random.uniform(-0.002, 0.002)
                        db.add(Pothole(
                            city_id=city_id,
                            latitude=p_lat,
                            longitude=p_lon,
                            geometry=_point_wkt(p_lat, p_lon),
                            severity=random.choice(["low", "medium", "high"]),
                            status="reported",
                        ))
                        potholes_generated += 1

            elif dataset_type == "roads":
                geometry = _line_wkt(row, columns)
                if geometry is None:
                    # Fallback: create a short road segment near city center
                    l_s = city_lat + random.uniform(-0.03, 0.03)
                    ln_s = city_lon + random.uniform(-0.03, 0.03)
                    l_e = l_s + random.uniform(-0.01, 0.01)
                    ln_e = ln_s + random.uniform(-0.01, 0.01)
                    geometry = WKTElement(LineString([(ln_s, l_s), (ln_e, l_e)]).wkt, srid=4326)
                db.add(Road(
                    city_id=city_id,
                    road_name=_text(row, columns, "road_name", f"Uploaded Road {inserted + 1}"),
                    road_type=_text(row, columns, "road_type", "local"),
                    geometry=geometry,
                    lanes=_int(row, columns, "lanes"),
                    speed_limit=_int(row, columns, "speed_limit"),
                    surface=_text(row, columns, "surface"),
                    oneway=_text(row, columns, "oneway"),
                    length_m=_float(row, columns, "length_m"),
                    source_record_id=str(upload_id),
                ))
                inserted += 1

            elif dataset_type == "potholes":
                point = _point_from_row(row, columns)
                if point is None:
                    lat = city_lat + random.uniform(-0.04, 0.04)
                    lon = city_lon + random.uniform(-0.04, 0.04)
                else:
                    lat, lon = point
                db.add(Pothole(
                    city_id=city_id,
                    latitude=lat,
                    longitude=lon,
                    geometry=_point_wkt(lat, lon),
                    severity=_text(row, columns, "severity", "medium"),
                    report_date=_date(row, columns, "report_date"),
                    status=_text(row, columns, "status", "reported"),
                ))
                inserted += 1

            elif dataset_type == "traffic":
                point = _point_from_row(row, columns)
                if point is None:
                    lat = city_lat + random.uniform(-0.04, 0.04)
                    lon = city_lon + random.uniform(-0.04, 0.04)
                else:
                    lat, lon = point
                db.add(Traffic(
                    city_id=city_id,
                    observation_date=_date(row, columns, "observation_date", default_today=True),
                    observation_time=_time(row, columns, "observation_time"),
                    latitude=lat,
                    longitude=lon,
                    traffic_volume=_int(row, columns, "traffic_volume"),
                    average_speed=_float(row, columns, "average_speed"),
                    congestion_level=_text(row, columns, "congestion_level"),
                ))
                inserted += 1

        if dataset_type not in {"accidents", "roads", "potholes", "traffic"}:
            raise ValueError(f"Unsupported dataset type: {dataset_type}")

        await db.commit()
        total_records = inserted + potholes_generated
        await update_upload_status(db, upload_id, status="PROCESSED", record_count=total_records)
        logger.info(f"Successfully processed upload {upload_id}; inserted {inserted} rows + {potholes_generated} potholes from {len(df)} CSV rows.")
        
    except Exception as e:
        logger.error(f"Failed to process upload {upload_id}: {str(e)}")
        await update_upload_status(db, upload_id, status="FAILED", error_msg=str(e))


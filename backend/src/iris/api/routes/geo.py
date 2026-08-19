"""GeoJSON routes for the interactive map with automatic OSM road network enrichment."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from iris.api.dependencies import get_db
from iris.models.core import City
from iris.services.city_enrichment_service import ensure_city_road_network

router = APIRouter(tags=["Geospatial"])


@router.get("/roads")
async def get_roads_geojson(city_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    """Return road network as GeoJSON with auto-enrichment if city has 0 roads."""
    if city_id:
        city_res = await db.execute(select(City).where(City.city_id == city_id))
        city = city_res.scalars().first()
        if city:
            await ensure_city_road_network(db, city)

    where_clause = "WHERE city_id = :city_id" if city_id else ""
    query = f"""
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(features.feature)
        )
        FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(geometry)::jsonb,
                'properties', jsonb_build_object(
                    'road_id', road_id,
                    'road_name', road_name,
                    'road_type', road_type,
                    'speed_limit', speed_limit,
                    'risk_score', floor(random() * 100)
                )
            ) AS feature
            FROM core.dim_road
            {where_clause}
            LIMIT 1000
        ) features;
    """
    result = await db.execute(text(query), {"city_id": str(city_id)} if city_id else {})
    res_data = result.scalar()
    if not res_data or not res_data.get("features"):
        return {"type": "FeatureCollection", "features": []}
    return res_data


@router.get("/accidents")
async def get_accidents_geojson(city_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    """Return accidents as GeoJSON."""
    if city_id:
        city_res = await db.execute(select(City).where(City.city_id == city_id))
        city = city_res.scalars().first()
        if city:
            await ensure_city_road_network(db, city)

    where_clause = "WHERE city_id = :city_id" if city_id else ""
    query = f"""
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(features.feature)
        )
        FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(geometry)::jsonb,
                'properties', jsonb_build_object(
                    'accident_id', accident_id,
                    'severity', severity,
                    'date', accident_date
                )
            ) AS feature
            FROM core.fact_accident
            {where_clause}
            LIMIT 2000
        ) features;
    """
    result = await db.execute(text(query), {"city_id": str(city_id)} if city_id else {})
    res_data = result.scalar()
    if not res_data or not res_data.get("features"):
        return {"type": "FeatureCollection", "features": []}
    return res_data


@router.get("/potholes")
async def get_potholes_geojson(city_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    """Return potholes as GeoJSON."""
    if city_id:
        city_res = await db.execute(select(City).where(City.city_id == city_id))
        city = city_res.scalars().first()
        if city:
            await ensure_city_road_network(db, city)

    where_clause = "WHERE city_id = :city_id" if city_id else ""
    query = f"""
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(features.feature)
        )
        FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(geometry)::jsonb,
                'properties', jsonb_build_object(
                    'pothole_id', pothole_id,
                    'severity', severity,
                    'status', status
                )
            ) AS feature
            FROM core.fact_pothole
            {where_clause}
            LIMIT 1000
        ) features;
    """
    result = await db.execute(text(query), {"city_id": str(city_id)} if city_id else {})
    res_data = result.scalar()
    if not res_data or not res_data.get("features"):
        return {"type": "FeatureCollection", "features": []}
    return res_data

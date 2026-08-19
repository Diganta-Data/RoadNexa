"""Dashboard analytics routes."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import case, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from iris.api.dependencies import get_db
from iris.models.core import City, Road
from iris.models.facts import Accident, Pothole, Traffic
from iris.services.city_enrichment_service import ensure_city_road_network

router = APIRouter(tags=["Analytics"])


@router.get("/dashboard/kpi")
async def get_kpis(city_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    """KPIs for the executive dashboard."""

    if city_id:
        city_res = await db.execute(select(City).where(City.city_id == city_id))
        city = city_res.scalars().first()
        if city:
            await ensure_city_road_network(db, city)

    # Roads
    road_q = select(func.count(Road.road_id))
    if city_id:
        road_q = road_q.where(Road.city_id == city_id)
    total_roads = (await db.execute(road_q)).scalar() or 0

    # Accidents
    acc_q = select(func.count(Accident.accident_id))
    if city_id:
        acc_q = acc_q.where(Accident.city_id == city_id)
    total_accidents = (await db.execute(acc_q)).scalar() or 0

    # Fatal accidents
    fatal_q = select(func.count(Accident.accident_id)).where(Accident.severity == 'fatal')
    if city_id:
        fatal_q = fatal_q.where(Accident.city_id == city_id)
    fatal_accidents = (await db.execute(fatal_q)).scalar() or 0

    # Potholes
    pot_q = select(func.count(Pothole.pothole_id))
    if city_id:
        pot_q = pot_q.where(Pothole.city_id == city_id)
    total_potholes = (await db.execute(pot_q)).scalar() or 0

    # Calculate risk score dynamically
    # Risk score = min(100, (accidents*6 + fatal*18) / max(roads, 1))
    avg_risk = 0
    if total_roads > 0:
        avg_risk = min(100.0, ((total_accidents * 6) + (fatal_accidents * 18)) / total_roads)
    elif total_accidents > 0:
        avg_risk = min(100.0, (total_accidents * 6 + fatal_accidents * 18) / (total_accidents / 2)) # rough estimate if no roads

    return {
        "total_roads": total_roads,
        "total_accidents": total_accidents,
        "fatal_accidents": fatal_accidents,
        "total_potholes": total_potholes,
        "average_risk_score": round(avg_risk, 1),
    }


@router.get("/accidents/severity")
async def get_accident_severity(city_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    query = select(Accident.severity, func.count(Accident.accident_id)).group_by(Accident.severity)
    if city_id:
        query = query.where(Accident.city_id == city_id)
    rows = (await db.execute(query)).all()
    return [{"name": severity or "unknown", "value": count} for severity, count in rows]


@router.get("/accidents/monthly")
async def get_monthly_accidents(city_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    month = func.to_char(func.date_trunc("month", Accident.accident_date), "YYYY-MM")
    query = select(month.label("month"), func.count(Accident.accident_id)).group_by("month").order_by("month")
    if city_id:
        query = query.where(Accident.city_id == city_id)
    rows = (await db.execute(query)).all()
    return [{"month": item_month, "accidents": count} for item_month, count in rows]


@router.get("/dangerous-roads")
async def get_dangerous_roads(city_id: Optional[UUID] = None, limit: int = 10, db: AsyncSession = Depends(get_db)):
    fatal_count = func.sum(case((Accident.severity == "fatal", 1), else_=0))
    severe_count = func.sum(case((Accident.severity == "severe", 1), else_=0))
    accident_count = func.count(Accident.accident_id)
    risk_score = func.least(100, accident_count * 6 + fatal_count * 18 + severe_count * 10)

    query = (
        select(
            Road.road_id,
            Road.road_name,
            Road.road_type,
            Road.speed_limit,
            accident_count.label("accidents"),
            fatal_count.label("fatal_accidents"),
            severe_count.label("severe_accidents"),
            risk_score.label("risk_score"),
        )
        .join(Accident, Accident.road_id == Road.road_id, isouter=True)
        .group_by(Road.road_id)
        .order_by(desc("risk_score"), desc("accidents"))
        .limit(limit)
    )
    if city_id:
        query = query.where(Road.city_id == city_id)

    rows = (await db.execute(query)).mappings().all()
    return [dict(row) for row in rows]


@router.get("/hotspots")
async def get_hotspots(city_id: Optional[UUID] = None, limit: int = 12, db: AsyncSession = Depends(get_db)):
    lat_bucket = (func.floor(Accident.latitude * 1000) / 1000).label("latitude")
    lon_bucket = (func.floor(Accident.longitude * 1000) / 1000).label("longitude")
    query = (
        select(
            lat_bucket,
            lon_bucket,
            func.count(Accident.accident_id).label("accidents"),
            func.sum(case((Accident.severity == "fatal", 1), else_=0)).label("fatal_accidents"),
        )
        .group_by(lat_bucket, lon_bucket)
        .order_by(desc("accidents"))
        .limit(limit)
    )
    if city_id:
        query = query.where(Accident.city_id == city_id)
    rows = (await db.execute(query)).mappings().all()
    return [dict(row) for row in rows]


@router.get("/risk/recommendations")
async def get_recommendations(city_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    roads = await get_dangerous_roads(city_id=city_id, limit=6, db=db)
    recommendations = []
    for road in roads:
        risk = road["risk_score"] or 0
        action = "Deploy enforcement and redesign conflict points"
        if risk < 70:
            action = "Add warning signage, lighting checks, and weekly inspection"
        if risk < 40:
            action = "Monitor through routine maintenance cycle"
        recommendations.append({
            "road_id": road["road_id"],
            "road_name": road["road_name"],
            "risk_score": risk,
            "priority": "Critical" if risk >= 80 else "High" if risk >= 60 else "Moderate",
            "action": action,
        })
    return recommendations


@router.get("/ml/predictions")
async def get_prediction_overview(city_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    traffic_q = select(func.avg(Traffic.traffic_volume), func.avg(Traffic.average_speed))
    if city_id:
        traffic_q = traffic_q.where(Traffic.city_id == city_id)
    avg_volume, avg_speed = (await db.execute(traffic_q)).one()
    avg_volume = float(avg_volume or 0)
    avg_speed = float(avg_speed or 0)
    predicted_severity = "severe" if avg_volume > 1200 and avg_speed > 45 else "minor"
    confidence = min(0.92, 0.55 + (avg_volume / 6000) + (avg_speed / 300))
    return {
        "model": "rule-assisted baseline",
        "predicted_severity": predicted_severity,
        "confidence": round(confidence, 2),
        "features": {
            "average_traffic_volume": round(avg_volume, 1),
            "average_speed": round(avg_speed, 1),
        },
    }


@router.post("/ai-analysis")
async def post_ai_analysis(road_data: dict):
    """Generate executive LLM AI analysis & remediation plan for a selected road."""
    from iris.services.ai_analysis_service import generate_ai_road_analysis
    question = road_data.pop("question", None)
    return await generate_ai_road_analysis(road_data, question=question)


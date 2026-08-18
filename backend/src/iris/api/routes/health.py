"""Health check endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from iris import __version__
from iris.database.session import get_db_session
from iris.utils.logger import logger

router = APIRouter(tags=["Health"])

_start_time = datetime.now(timezone.utc)


@router.get("/health")
async def health_check():
    """Basic health — returns status if server is up."""
    return {
        "status": "healthy",
        "version": __version__,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": (datetime.now(timezone.utc) - _start_time).total_seconds(),
    }


@router.get("/health/db")
async def health_check_db(db: AsyncSession = Depends(get_db_session)):
    """Deep health — checks DB + PostGIS connection."""
    db_status = "disconnected"
    db_details = None

    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        db_status = "connected"

        try:
            postgis_result = await db.execute(text("SELECT PostGIS_Version()"))
            postgis_version = postgis_result.scalar()
            db_details = {"postgis_version": postgis_version}
        except Exception:
            db_details = {"postgis_version": "not installed"}

    except Exception as exc:
        logger.error("DB health check failed", extra={"error": str(exc)})
        db_status = "error"
        db_details = {"error": str(exc)}

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": __version__,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_status,
        "database_details": db_details,
    }

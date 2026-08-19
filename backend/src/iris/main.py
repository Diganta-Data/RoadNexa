"""Main FastAPI app for RoadNexa backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from iris import __version__
from iris.api.routes import analytics, cities, geo, health, roads, uploads
from iris.config.settings import get_settings
from iris.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    settings = get_settings()
    logger.info(
        "RoadNexa backend starting",
        extra={
            "version": __version__,
            "host": settings.backend_host,
            "port": settings.backend_port,
            "database_host": settings.postgres_host,
            "log_level": settings.log_level,
        },
    )
    yield
    logger.info("RoadNexa backend shutting down")


def create_app() -> FastAPI:
    """App factory."""
    settings = get_settings()

    app = FastAPI(
        title="RoadNexa - Road Intelligence & Safety Platform",
        description="Geospatial analytics platform for multi-city road safety.",
        version=__version__,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(cities.router, prefix="/cities", tags=["Cities"])
    app.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
    app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
    app.include_router(geo.router, prefix="/geo", tags=["GeoJSON"])
    app.include_router(roads.router, prefix="/roads", tags=["Road Intelligence"])

    return app


app = create_app()

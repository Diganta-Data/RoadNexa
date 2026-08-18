"""Main FastAPI app for IRIS backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from iris import __version__
from iris.api.routes import health, cities
from iris.config.settings import get_settings
from iris.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    settings = get_settings()
    logger.info(
        "IRIS backend starting",
        extra={
            "version": __version__,
            "host": settings.backend_host,
            "port": settings.backend_port,
            "database_host": settings.postgres_host,
            "log_level": settings.log_level,
        },
    )
    yield
    logger.info("IRIS backend shutting down")


def create_app() -> FastAPI:
    """App factory."""
    settings = get_settings()

    app = FastAPI(
        title="IRIS — Indian Road Intelligence & Safety Platform",
        description="Geospatial analytics platform for multi-city road safety.",
        version=__version__,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(health.router)
    app.include_router(cities.router, prefix="/cities", tags=["Cities"])

    return app


app = create_app()

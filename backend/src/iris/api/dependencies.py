"""Shared FastAPI dependencies."""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from iris.config.settings import Settings, get_settings
from iris.database.session import get_db_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """DB session dependency."""
    async for session in get_db_session():
        yield session


def get_app_settings() -> Settings:
    return get_settings()

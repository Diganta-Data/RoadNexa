"""Async SQLAlchemy engine and session setup."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from iris.config.settings import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.log_level == "DEBUG",
    poolclass=NullPool,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncSession:
    """Yield a DB session, auto-commit on success, rollback on error."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

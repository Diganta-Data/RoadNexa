"""DB init script — creates extensions, schemas, tables, and views."""

import asyncio
import os
import sys

from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from iris.database.session import engine
from iris.models import Base


async def run_sql_file(conn, filepath):
    """Execute each statement in a SQL file individually."""
    with open(filepath, "r") as f:
        for stmt in f.read().split(";"):
            if stmt.strip():
                await conn.execute(text(stmt))


async def init_db():
    print("Connecting to database...")
    async with engine.begin() as conn:
        print("Creating extensions...")
        await run_sql_file(conn, "../sql/001_extensions.sql")

        print("Creating schemas...")
        await run_sql_file(conn, "../sql/002_schemas.sql")

        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)

        print("Creating views...")
        await run_sql_file(conn, "../sql/007_views.sql")

    print("Done.")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_db())

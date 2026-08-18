"""App settings from env vars using pydantic-settings."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # DB
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "iris_db"
    postgres_user: str = "iris_user"
    postgres_password: str = "changeme_in_production"
    database_url: str | None = None

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_reload: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    log_level: str = "INFO"
    secret_key: str = "change-this-to-a-random-secret-key"

    # Data dirs
    data_raw_dir: str = "data/raw"
    data_staging_dir: str = "data/staging"
    data_processed_dir: str = "data/processed"
    data_rejected_dir: str = "data/rejected"
    upload_dir: str = "data/uploads"

    @property
    def async_database_url(self) -> str:
        """Async DB URL for SQLAlchemy."""
        if self.database_url:
            return self.database_url
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def sync_database_url(self) -> str:
        """Sync DB URL for scripts/migrations."""
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

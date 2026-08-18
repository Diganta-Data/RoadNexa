"""Upload and data source tracking tables (raw schema)."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from iris.database.base import Base
from iris.models.core import City


class UploadRegistry(Base):
    __tablename__ = "upload_registry"
    __table_args__ = {"schema": "raw"}

    upload_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city_id: Mapped[UUID] = mapped_column(ForeignKey("core.dim_city.city_id"), nullable=False)
    dataset_type: Mapped[str] = mapped_column(String(100), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_format: Mapped[str] = mapped_column(String(50), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)

    record_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    valid_record_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    invalid_record_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duplicate_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    upload_status: Mapped[str] = mapped_column(String(50), nullable=False, default="UPLOADED")
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    city: Mapped[City] = relationship("City")


class DataSourceRegistry(Base):
    __tablename__ = "data_source_registry"
    __table_args__ = {"schema": "raw"}

    source_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city_id: Mapped[UUID] = mapped_column(ForeignKey("core.dim_city.city_id"), nullable=False)
    dataset_name: Mapped[str] = mapped_column(String(255), nullable=False)
    organization: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    license: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    collection_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    update_frequency: Mapped[str | None] = mapped_column(String(100), nullable=True)
    limitations: Mapped[str | None] = mapped_column(Text, nullable=True)

    city: Mapped[City] = relationship("City")

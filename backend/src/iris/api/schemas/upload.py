"""Schemas for data uploads."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    upload_id: UUID
    city_id: UUID
    dataset_type: str
    original_filename: str
    file_format: str
    upload_status: str
    record_count: int | None = None
    uploaded_at: datetime
    processed_at: datetime | None = None
    error_message: str | None = None

    class Config:
        from_attributes = True


class UploadSummary(BaseModel):
    total_uploads: int
    successful_uploads: int
    failed_uploads: int
    recent_uploads: list[UploadResponse]

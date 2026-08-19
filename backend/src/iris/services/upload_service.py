"""Service for managing file uploads and metadata."""

import os
from datetime import datetime
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from iris.config.settings import get_settings
from iris.models.management import UploadRegistry

settings = get_settings()


async def get_all_uploads(db: AsyncSession) -> list[UploadRegistry]:
    result = await db.execute(select(UploadRegistry).order_by(UploadRegistry.uploaded_at.desc()))
    return list(result.scalars().all())


async def get_upload_by_id(db: AsyncSession, upload_id: UUID) -> UploadRegistry | None:
    return await db.get(UploadRegistry, upload_id)


async def save_upload_file(file: UploadFile, city_id: UUID, dataset_type: str) -> str:
    """Save the uploaded file to the local filesystem and return the path."""
    os.makedirs(settings.upload_dir, exist_ok=True)
    
    safe_filename = f"{city_id}_{dataset_type}_{file.filename}"
    file_path = os.path.join(settings.upload_dir, safe_filename)
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    return file_path


async def create_upload_record(
    db: AsyncSession,
    city_id: UUID,
    dataset_type: str,
    filename: str,
    file_path: str,
) -> UploadRegistry:
    """Create a registry entry for the uploaded file."""
    file_ext = os.path.splitext(filename)[1].lower().strip(".")
    
    upload = UploadRegistry(
        city_id=city_id,
        dataset_type=dataset_type,
        original_filename=filename,
        file_format=file_ext or "unknown",
        storage_path=file_path,
        upload_status="UPLOADED"
    )
    
    db.add(upload)
    await db.commit()
    await db.refresh(upload)
    return upload


async def update_upload_status(
    db: AsyncSession,
    upload_id: UUID,
    status: str,
    record_count: int | None = None,
    error_msg: str | None = None
) -> UploadRegistry | None:
    upload = await db.get(UploadRegistry, upload_id)
    if not upload:
        return None
        
    upload.upload_status = status
    if record_count is not None:
        upload.record_count = record_count
    if error_msg:
        upload.error_message = error_msg
    if status in {"PROCESSED", "FAILED"}:
        upload.processed_at = datetime.utcnow()
        
    await db.commit()
    await db.refresh(upload)
    return upload

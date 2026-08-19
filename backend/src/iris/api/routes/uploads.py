"""Routes for data uploads."""

from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from iris.api.dependencies import get_db
from iris.api.schemas.upload import UploadResponse
from iris.ingestion.parser import process_dataset
from iris.services import upload_service
from iris.utils.logger import logger

router = APIRouter(tags=["Uploads"])


@router.post("/", response_model=UploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_dataset(
    city_id: UUID = Form(...),
    dataset_type: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new dataset file (CSV/GeoJSON)."""
    
    # 1. Save file to disk
    try:
        file_path = await upload_service.save_upload_file(file, city_id, dataset_type)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file.")

    # 2. Create registry record
    try:
        upload = await upload_service.create_upload_record(
            db=db,
            city_id=city_id,
            dataset_type=dataset_type,
            filename=file.filename or "unknown",
            file_path=file_path
        )
    except Exception as e:
        logger.error(f"Failed to create upload record: {e}")
        raise HTTPException(status_code=500, detail="Database error.")

    await process_dataset(
        db=db,
        upload_id=upload.upload_id,
        city_id=city_id,
        dataset_type=dataset_type,
        file_path=file_path,
    )
    refreshed = await upload_service.get_upload_by_id(db, upload.upload_id)

    return refreshed or upload


@router.get("/", response_model=list[UploadResponse])
async def list_uploads(db: AsyncSession = Depends(get_db)):
    """Get history of all uploaded datasets."""
    return await upload_service.get_all_uploads(db)

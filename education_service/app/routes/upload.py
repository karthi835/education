# ============================================================
# routes/upload.py - Excel/CSV Upload Routes
# Handles file upload and retrieves upload history
# Optimized for 1,00,000+ records using background processing
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.upload import Upload
from app.models.user import User
from app.schemas.upload import UploadResponse, UploadResultResponse, UploadStatusResponse
from app.dependencies.auth import get_current_user
from app.services.excel_service import process_excel_file, preview_excel_file, process_excel_file_background
from typing import List

router = APIRouter(prefix="/api", tags=["Upload"])

# Files larger than this (in bytes) are processed in the background
# ~10 MB threshold — a 1 lakh row CSV is typically 15-50 MB
BACKGROUND_THRESHOLD_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/upload-excel/preview")
async def upload_excel_preview(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Parse an Excel or CSV file containing student data and return a preview.
    Returns only the first 100 rows for large files.
    This does NOT write anything to the database.
    """
    # Validate file extension
    allowed_extensions = {".xlsx", ".xls", ".csv"}
    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file_ext}'. Allowed types: {', '.join(allowed_extensions)}",
        )

    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading file: {str(e)}",
        )

    # Process the Excel/CSV file to preview (limited to 100 rows)
    try:
        records = preview_excel_file(content, file.filename, max_preview=100)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}",
        )

    return {
        "file_name": file.filename,
        "total_records": len(records),
        "records": records,
    }


@router.post("/upload-excel", response_model=UploadResultResponse)
async def upload_excel(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload an Excel (.xlsx) or CSV (.csv) file containing student data.
    
    For large files (>5 MB), processing happens in the background:
    - Returns immediately with upload_id and status 'processing'
    - Use GET /api/uploads/{upload_id}/status to poll progress
    
    For small files, processing is done synchronously as before.
    """
    # Validate file extension
    allowed_extensions = {".xlsx", ".xls", ".csv"}
    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file_ext}'. Allowed types: {', '.join(allowed_extensions)}",
        )

    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading file: {str(e)}",
        )

    file_size = len(content)

    # ---- Large file: process in background ----
    if file_size > BACKGROUND_THRESHOLD_BYTES:
        # Create upload record immediately with 'pending' status
        upload = Upload(
            file_name=file.filename,
            total_records=0,
            status="pending",
        )
        db.add(upload)
        db.commit()
        db.refresh(upload)

        # Schedule background processing
        background_tasks.add_task(
            process_excel_file_background,
            content,
            file.filename,
            upload.id,
        )

        return UploadResultResponse(
            message="Large file received. Processing in background — check status for progress.",
            file_name=file.filename,
            total_records=0,
            upload_id=upload.id,
        )

    # ---- Small file: process synchronously ----
    try:
        upload_id, total_records = process_excel_file(content, file.filename, db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}",
        )

    return UploadResultResponse(
        message="File uploaded and processed successfully",
        file_name=file.filename,
        total_records=total_records,
        upload_id=upload_id,
    )


@router.get("/uploads/{upload_id}/status", response_model=UploadStatusResponse)
def get_upload_status(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Check the processing status of a specific upload.
    Use this to poll for progress on large background uploads.
    """
    upload = db.query(Upload).filter(Upload.id == upload_id).first()
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Upload with id {upload_id} not found.",
        )
    return UploadStatusResponse.model_validate(upload)


@router.get("/uploads", response_model=List[UploadResponse])
def get_uploads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the upload history, ordered by most recent first."""
    uploads = db.query(Upload).order_by(desc(Upload.uploaded_at)).all()
    return [UploadResponse.model_validate(u) for u in uploads]

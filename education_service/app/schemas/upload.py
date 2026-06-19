# ============================================================
# schemas/upload.py - Upload Pydantic Schemas
# Request/Response validation for file upload endpoints
# ============================================================

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class UploadResponse(BaseModel):
    """Schema for upload record in responses."""
    id: int
    file_name: str
    total_records: int
    status: Optional[str] = "completed"
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UploadResultResponse(BaseModel):
    """Schema for the result of a file upload operation."""
    message: str
    file_name: str
    total_records: int
    upload_id: int


class UploadStatusResponse(BaseModel):
    """Schema for polling upload processing status."""
    id: int
    file_name: str
    total_records: int
    status: str  # pending, processing, completed, failed
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

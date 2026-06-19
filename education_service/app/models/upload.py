# ============================================================
# models/upload.py - Upload ORM Model
# Tracks file upload history with metadata and processing status
# ============================================================

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Upload(Base):
    """Upload model to track Excel/CSV file upload history."""

    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_name = Column(String(255), nullable=False)
    total_records = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="pending")  # pending, processing, completed, failed
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

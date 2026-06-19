# ============================================================
# schemas/student.py - Student Pydantic Schemas
# Request/Response validation for student CRUD endpoints
# ============================================================

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class StudentCreate(BaseModel):
    """Schema for creating a new student."""
    student_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    city: Optional[str] = None
    photo: Optional[str] = None
    status: Optional[str] = "Active"


class StudentUpdate(BaseModel):
    """Schema for updating an existing student."""
    student_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    city: Optional[str] = None
    photo: Optional[str] = None
    status: Optional[str] = None


class StudentResponse(BaseModel):
    """Schema for student data in responses."""
    id: int
    student_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    city: Optional[str] = None
    photo: Optional[str] = None
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudentListResponse(BaseModel):
    """Schema for paginated student list responses."""
    students: List[StudentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class StudentBulkImport(BaseModel):
    """Schema for bulk student importing."""
    file_name: str
    students: List[StudentCreate]

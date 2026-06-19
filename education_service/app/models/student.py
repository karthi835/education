# ============================================================
# models/student.py - Student ORM Model
# Stores student records uploaded via Excel/CSV or manually added
# ============================================================

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Student(Base):
    """Student model representing student records in the system."""

    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_name = Column(String(200), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    course = Column(String(100), nullable=True, index=True)
    department = Column(String(100), nullable=True)
    year = Column(Integer, nullable=True)
    city = Column(String(100), nullable=True)
    photo = Column(String(500), nullable=True)
    status = Column(String(50), nullable=True, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

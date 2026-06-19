# ============================================================
# models/__init__.py - Models Package Initializer
# Imports all models so SQLAlchemy can discover them
# ============================================================

from app.models.user import User
from app.models.student import Student
from app.models.upload import Upload

__all__ = ["User", "Student", "Upload"]

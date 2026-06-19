# ============================================================
# utils/helpers.py - General Helper Utilities
# Common utility functions used across the application
# ============================================================

import math
from typing import List, Any


def paginate(query, page: int, per_page: int):
    """
    Apply pagination to a SQLAlchemy query.
    
    Args:
        query: SQLAlchemy query object
        page: Current page number (1-indexed)
        per_page: Number of items per page
    
    Returns:
        Tuple of (items, total_count, total_pages)
    """
    total = query.count()
    total_pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total, total_pages


def sanitize_column_name(name: str) -> str:
    """
    Sanitize a column name from Excel headers for database compatibility.
    Converts to lowercase, replaces spaces/special chars with underscores.
    """
    if not name:
        return "unnamed"
    sanitized = name.strip().lower()
    sanitized = "".join(c if c.isalnum() else "_" for c in sanitized)
    sanitized = sanitized.strip("_")
    return sanitized or "unnamed"

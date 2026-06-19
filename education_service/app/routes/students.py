# ============================================================
# routes/students.py - Student CRUD Routes
# Full CRUD operations with search, filter, pagination, sorting
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from app.database import get_db
from app.models.student import Student
from app.models.user import User
from app.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentListResponse,
    StudentBulkImport,
)
from app.models.upload import Upload
from app.dependencies.auth import get_current_user
from app.utils.helpers import paginate

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=StudentListResponse)
def get_students(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query("", description="Search by name, email, or phone"),
    course: str = Query("", description="Filter by course"),
    status: str = Query("", description="Filter by status"),
    sort_by: str = Query("id", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all students with search, filter, sort, and pagination.
    
    - search: Filters by student_name, email, or phone (case-insensitive)
    - course: Filters by exact course name
    - status: Filters by exact status name
    - sort_by: Column to sort by (id, student_name, email, course, year, city, status, created_at)
    - sort_order: 'asc' or 'desc'
    - page/per_page: Pagination controls
    """
    query = db.query(Student)

    # Apply search filter (case-insensitive partial match)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Student.student_name.ilike(search_term))
            | (Student.email.ilike(search_term))
            | (Student.phone.ilike(search_term))
        )

    # Apply course filter
    if course:
        query = query.filter(Student.course == course)

    # Apply status filter
    if status:
        query = query.filter(Student.status == status)

    # Apply sorting
    valid_sort_fields = {
        "id": Student.id,
        "student_name": Student.student_name,
        "email": Student.email,
        "course": Student.course,
        "department": Student.department,
        "year": Student.year,
        "city": Student.city,
        "status": Student.status,
        "created_at": Student.created_at,
    }
    sort_column = valid_sort_fields.get(sort_by, Student.id)
    order_func = desc if sort_order.lower() == "desc" else asc
    query = query.order_by(order_func(sort_column))

    # Apply pagination
    students, total, total_pages = paginate(query, page, per_page)

    return StudentListResponse(
        students=[StudentResponse.model_validate(s) for s in students],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single student by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    return StudentResponse.model_validate(student)


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new student record manually."""
    new_student = Student(**student_data.model_dump())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return StudentResponse.model_validate(new_student)


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing student record."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    # Only update fields that were provided (not None)
    update_data = student_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    return StudentResponse.model_validate(student)


@router.delete("/{student_id}", status_code=status.HTTP_200_OK)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a student record by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully", "id": student_id}


@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def bulk_create_students(
    payload: StudentBulkImport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bulk create student records from verified preview."""
    try:
        students = []
        for s in payload.students:
            students.append(Student(**s.model_dump()))
        
        db.bulk_save_objects(students)
        
        # Log upload history
        upload = Upload(
            file_name=payload.file_name,
            total_records=len(students),
        )
        db.add(upload)
        db.commit()
        
        return {
            "message": f"Successfully imported {len(students)} students",
            "total_records": len(students),
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error saving records: {str(e)}",
        )

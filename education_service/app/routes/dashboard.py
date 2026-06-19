# ============================================================
# routes/dashboard.py - Dashboard & Export Routes
# Provides statistics for the dashboard and data export endpoints
# ============================================================

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case, Integer
from app.database import get_db
from app.models.student import Student
from app.models.upload import Upload
from app.models.user import User
from app.dependencies.auth import get_current_user
import pandas as pd
from io import BytesIO
from datetime import datetime, timedelta

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get dashboard statistics including:
    - Total students count
    - Total unique courses count
    - Total departments count
    - Total uploaded files count
    - Total records processed
    - New admissions
    - Active students
    - Growth percentage
    - Students grouped by course (for charts)
    - Students by department
    - Admission trend by month
    - Students by city
    - Upload activity trend
    - Recent activities
    """
    # Total students
    total_students = db.query(func.count(Student.id)).scalar() or 0

    # Total unique courses
    total_courses = (
        db.query(func.count(func.distinct(Student.course)))
        .filter(Student.course.isnot(None))
        .scalar()
        or 0
    )

    # Total unique departments
    total_departments = (
        db.query(func.count(func.distinct(Student.department)))
        .filter(Student.department.isnot(None))
        .scalar()
        or 0
    )

    # Total uploaded files
    total_files = db.query(func.count(Upload.id)).scalar() or 0

    # Total records from all uploads
    total_records = db.query(func.coalesce(func.sum(Upload.total_records), 0)).scalar()

    # Active students
    active_students = (
        db.query(func.count(Student.id))
        .filter(Student.status == "Active")
        .scalar()
        or 0
    )

    # New admissions & growth percentage
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    prev_thirty_days_ago = datetime.utcnow() - timedelta(days=60)
    
    new_admissions = (
        db.query(func.count(Student.id))
        .filter(Student.created_at >= thirty_days_ago)
        .scalar()
        or 0
    )
    
    students_prev_30 = (
        db.query(func.count(Student.id))
        .filter(Student.created_at >= prev_thirty_days_ago, Student.created_at < thirty_days_ago)
        .scalar()
        or 0
    )
    
    if students_prev_30 > 0:
        growth_percentage = round(((new_admissions - students_prev_30) / students_prev_30) * 100, 2)
    else:
        total_students_before = db.query(func.count(Student.id)).filter(Student.created_at < thirty_days_ago).scalar() or 0
        if total_students_before > 0:
            growth_percentage = round((new_admissions / total_students_before) * 100, 2)
        else:
            growth_percentage = 0.0

    # Students count by course (for chart data)
    course_stats = (
        db.query(Student.course, func.count(Student.id).label("count"))
        .filter(Student.course.isnot(None))
        .group_by(Student.course)
        .order_by(desc("count"))
        .all()
    )
    course_data = [{"course": row.course, "count": row.count} for row in course_stats]

    # Students by department
    dept_stats = (
        db.query(Student.department, func.count(Student.id).label("count"))
        .filter(Student.department.isnot(None))
        .group_by(Student.department)
        .order_by(desc("count"))
        .all()
    )
    department_data = [{"department": row.department, "count": row.count} for row in dept_stats]

    # Admission trend (month-year)
    trend_stats = (
        db.query(
            func.to_char(Student.created_at, "YYYY-MM").label("month"),
            func.count(Student.id).label("count")
        )
        .group_by(func.to_char(Student.created_at, "YYYY-MM"))
        .order_by("month")
        .all()
    )
    admission_trend = [{"month": row.month, "count": row.count} for row in trend_stats if row.month]

    # Students by city
    city_stats = (
        db.query(Student.city, func.count(Student.id).label("count"))
        .filter(Student.city.isnot(None))
        .group_by(Student.city)
        .order_by(desc("count"))
        .limit(10)
        .all()
    )
    city_data = [{"city": row.city, "count": row.count} for row in city_stats]

    # Upload activity
    upload_stats = (
        db.query(
            func.to_char(Upload.uploaded_at, "YYYY-MM-DD").label("date"),
            func.count(Upload.id).label("count")
        )
        .group_by(func.to_char(Upload.uploaded_at, "YYYY-MM-DD"))
        .order_by("date")
        .limit(15)
        .all()
    )
    upload_activity = [{"date": row.date, "count": row.count} for row in upload_stats if row.date]

    # Recent activities (combined)
    recent_uploads = db.query(Upload).order_by(desc(Upload.uploaded_at)).limit(5).all()
    recent_students = db.query(Student).order_by(desc(Student.created_at)).limit(5).all()
    
    activities = []
    for u in recent_uploads:
        activities.append({
            "type": "upload",
            "title": f"File Import: {u.file_name}",
            "description": f"Processed {u.total_records} student records",
            "time": u.uploaded_at.isoformat() if u.uploaded_at else None
        })
    for s in recent_students:
        activities.append({
            "type": "registration",
            "title": f"New Student: {s.student_name}",
            "description": f"Enrolled in {s.course or 'N/A'} ({s.department or 'N/A'})",
            "time": s.created_at.isoformat() if s.created_at else None
        })
    activities.sort(key=lambda x: x["time"] or "", reverse=True)

    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "total_departments": total_departments,
        "total_files": total_files,
        "total_records": total_records,
        "new_admissions": new_admissions,
        "active_students": active_students,
        "growth_percentage": growth_percentage,
        "course_data": course_data,
        "department_data": department_data,
        "admission_trend": admission_trend,
        "city_data": city_data,
        "upload_activity": upload_activity,
        "recent_activities": activities[:8],
    }


@router.get("/courses")
def get_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get list of unique courses aggregated from students."""
    stats = (
        db.query(
            Student.course,
            Student.department,
            func.count(Student.id).label("total_students"),
            func.sum(case((Student.status == "Active", 1), else_=0)).label("active_students"),
            func.avg(Student.year).label("avg_year")
        )
        .filter(Student.course.isnot(None))
        .group_by(Student.course, Student.department)
        .all()
    )
    
    courses = []
    for row in stats:
        courses.append({
            "course": row.course,
            "department": row.department or "General",
            "total_students": row.total_students or 0,
            "active_students": int(row.active_students) if row.active_students else 0,
            "avg_year": round(float(row.avg_year), 1) if row.avg_year else 0.0
        })
    return courses


@router.get("/departments")
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get list of unique departments aggregated from students."""
    stats = (
        db.query(
            Student.department,
            func.count(func.distinct(Student.course)).label("course_count"),
            func.count(Student.id).label("total_students"),
            func.sum(case((Student.status == "Active", 1), else_=0)).label("active_students")
        )
        .filter(Student.department.isnot(None))
        .group_by(Student.department)
        .all()
    )
    
    departments = []
    for row in stats:
        departments.append({
            "department": row.department,
            "course_count": row.course_count or 0,
            "total_students": row.total_students or 0,
            "active_students": int(row.active_students) if row.active_students else 0
        })
    return departments


@router.get("/export/excel")
def export_excel(
    type: str = Query("students", description="Report type: students, courses, departments"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if type == "courses":
        stats = (
            db.query(
                Student.course,
                Student.department,
                func.count(Student.id).label("total_students"),
                func.sum(case((Student.status == "Active", 1), else_=0)).label("active_students"),
                func.avg(Student.year).label("avg_year")
            )
            .filter(Student.course.isnot(None))
            .group_by(Student.course, Student.department)
            .all()
        )
        data = [
            {
                "Course Name": row.course,
                "Department": row.department or "General",
                "Total Enrolled": row.total_students,
                "Active Students": int(row.active_students) if row.active_students else 0,
                "Average Graduation Year": round(float(row.avg_year), 1) if row.avg_year else "",
            }
            for row in stats
        ]
        filename = "courses_report.xlsx"
        sheetname = "Courses"
    elif type == "departments":
        stats = (
            db.query(
                Student.department,
                func.count(func.distinct(Student.course)).label("course_count"),
                func.count(Student.id).label("total_students"),
                func.sum(case((Student.status == "Active", 1), else_=0)).label("active_students")
            )
            .filter(Student.department.isnot(None))
            .group_by(Student.department)
            .all()
        )
        data = [
            {
                "Department Name": row.department,
                "Unique Courses Offered": row.course_count,
                "Total Students": row.total_students,
                "Active Students": int(row.active_students) if row.active_students else 0,
            }
            for row in stats
        ]
        filename = "departments_report.xlsx"
        sheetname = "Departments"
    else:
        students = db.query(Student).order_by(Student.id).all()
        data = [
            {
                "ID": s.id,
                "Student Name": s.student_name,
                "Email": s.email or "",
                "Phone": s.phone or "",
                "Course": s.course or "",
                "Department": s.department or "",
                "Year": s.year or "",
                "City": s.city or "",
                "Status": s.status or "Active",
                "Created At": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
            }
            for s in students
        ]
        filename = "students_report.xlsx"
        sheetname = "Students"

    df = pd.DataFrame(data)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name=sheetname)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/export/csv")
def export_csv(
    type: str = Query("students", description="Report type: students, courses, departments"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if type == "courses":
        stats = (
            db.query(
                Student.course,
                Student.department,
                func.count(Student.id).label("total_students"),
                func.sum(case((Student.status == "Active", 1), else_=0)).label("active_students"),
                func.avg(Student.year).label("avg_year")
            )
            .filter(Student.course.isnot(None))
            .group_by(Student.course, Student.department)
            .all()
        )
        data = [
            {
                "Course Name": row.course,
                "Department": row.department or "General",
                "Total Enrolled": row.total_students,
                "Active Students": int(row.active_students) if row.active_students else 0,
                "Average Graduation Year": round(float(row.avg_year), 1) if row.avg_year else "",
            }
            for row in stats
        ]
        filename = "courses_report.csv"
    elif type == "departments":
        stats = (
            db.query(
                Student.department,
                func.count(func.distinct(Student.course)).label("course_count"),
                func.count(Student.id).label("total_students"),
                func.sum(case((Student.status == "Active", 1), else_=0)).label("active_students")
            )
            .filter(Student.department.isnot(None))
            .group_by(Student.department)
            .all()
        )
        data = [
            {
                "Department Name": row.department,
                "Unique Courses Offered": row.course_count,
                "Total Students": row.total_students,
                "Active Students": int(row.active_students) if row.active_students else 0,
            }
            for row in stats
        ]
        filename = "departments_report.csv"
    else:
        students = db.query(Student).order_by(Student.id).all()
        data = [
            {
                "ID": s.id,
                "Student Name": s.student_name,
                "Email": s.email or "",
                "Phone": s.phone or "",
                "Course": s.course or "",
                "Department": s.department or "",
                "Year": s.year or "",
                "City": s.city or "",
                "Status": s.status or "Active",
                "Created At": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
            }
            for s in students
        ]
        filename = "students_report.csv"

    df = pd.DataFrame(data)
    buffer = BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

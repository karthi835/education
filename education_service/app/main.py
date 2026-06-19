# ============================================================
# main.py - FastAPI Application Entry Point
# Configures the app, middleware, and registers all routers
# ============================================================

from fastapi import FastAPI
from app.database import engine, Base
from app.middlewares.cors import add_cors_middleware
from app.routes import auth, students, upload, dashboard, users

# Import all models so they are registered with SQLAlchemy Base
from app.models import User, Student, Upload  # noqa: F401

# Create the FastAPI application
app = FastAPI(
    title="Education Management System API",
    description="API for managing students, uploading Excel/CSV data, and dashboard analytics",
    version="1.0.0",
)

# Add CORS middleware for React frontend
add_cors_middleware(app)

# Register all API routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(upload.router)
app.include_router(dashboard.router)
app.include_router(users.router)


from sqlalchemy import text

@app.on_event("startup")
def on_startup():
    """Create all database tables on application startup."""
    Base.metadata.create_all(bind=engine)
    # Safely alter table to add columns if they do not exist
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS photo VARCHAR(500);"))
            conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';"))
            conn.execute(text("ALTER TABLE uploads ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed';"))
    except Exception as e:
        print("Startup database migration error:", e)


@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {
        "message": "Education Management System API",
        "status": "running",
        "docs": "/docs",
    }

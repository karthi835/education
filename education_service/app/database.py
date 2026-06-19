# ============================================================
# database.py - Database Connection Setup
# Configures SQLAlchemy engine, session, and Base model
# ============================================================

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create the SQLAlchemy engine connected to PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# Create a configured session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session.
    Ensures the session is closed after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

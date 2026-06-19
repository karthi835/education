# ============================================================
# config.py - Application Configuration
# Loads environment variables using pydantic-settings
# ============================================================

from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load .env file from the parent directory (education_service/)
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/education_db"
    SECRET_KEY: str = "your-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    class Config:
        env_file = ".env"


# Global settings instance
settings = Settings()

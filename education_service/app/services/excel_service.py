# ============================================================
# services/excel_service.py - Excel/CSV Processing Service
# Handles parsing Excel/CSV files with Pandas and bulk inserting
# student records into PostgreSQL
# Optimized for 1,00,000+ records using chunked batch inserts
# ============================================================

import pandas as pd
from io import BytesIO
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.student import Student
from app.models.upload import Upload
from app.database import SessionLocal
from typing import Tuple
import logging
import traceback

logger = logging.getLogger(__name__)

# Batch size for chunked inserts — 5000 rows per commit
BATCH_SIZE = 5000


# Column mapping: maps common Excel header variations to our DB columns
COLUMN_MAPPING = {
    # student_name variations
    "student_name": "student_name",
    "student name": "student_name",
    "name": "student_name",
    "full_name": "student_name",
    "full name": "student_name",
    "student": "student_name",
    # email variations
    "email": "email",
    "email_address": "email",
    "email address": "email",
    "e-mail": "email",
    "mail": "email",
    # phone variations
    "phone": "phone",
    "phone_number": "phone",
    "phone number": "phone",
    "mobile": "phone",
    "contact": "phone",
    "mobile_number": "phone",
    "mobile number": "phone",
    # course variations
    "course": "course",
    "course_name": "course",
    "course name": "course",
    "program": "course",
    # department variations
    "department": "department",
    "dept": "department",
    "department_name": "department",
    "department name": "department",
    # year variations
    "year": "year",
    "academic_year": "year",
    "academic year": "year",
    "study_year": "year",
    "study year": "year",
    # city variations
    "city": "city",
    "location": "city",
    "address": "city",
    "hometown": "city",
    # photo variations
    "photo": "photo",
    "photo_url": "photo",
    "photo url": "photo",
    "image": "photo",
    "avatar": "photo",
    # status variations
    "status": "status",
    "student_status": "status",
    "student status": "status",
    "active": "status",
}

# Required DB columns for Student model
VALID_COLUMNS = {"student_name", "email", "phone", "course", "department", "year", "city", "photo", "status"}


def _prepare_dataframe(file_content: bytes, file_name: str) -> Tuple[pd.DataFrame, list]:
    """
    Common logic to read and prepare a DataFrame from Excel/CSV content.
    Returns the cleaned DataFrame and the list of valid column names.
    """
    # Read file into pandas DataFrame based on extension
    file_lower = file_name.lower()
    if file_lower.endswith(".xlsx") or file_lower.endswith(".xls"):
        df = pd.read_excel(BytesIO(file_content), engine="openpyxl")
    elif file_lower.endswith(".csv"):
        # Use low_memory=False for large CSVs to avoid mixed type warnings
        df = pd.read_csv(BytesIO(file_content), low_memory=False)
    else:
        raise ValueError("Unsupported file format. Please upload .xlsx, .xls, or .csv files.")

    if df.empty:
        raise ValueError("The uploaded file contains no data.")

    # Normalize column names: lowercase + strip whitespace
    df.columns = [str(col).strip().lower() for col in df.columns]

    # Map columns to our standard schema
    mapped_columns = {}
    for col in df.columns:
        if col in COLUMN_MAPPING:
            mapped_columns[col] = COLUMN_MAPPING[col]

    if not mapped_columns:
        raise ValueError(
            f"No matching columns found. Expected columns like: "
            f"student_name/name, email, phone, course, department, year, city. "
            f"Found: {list(df.columns)}"
        )

    # Rename columns to match our DB schema
    df = df.rename(columns=mapped_columns)

    # Keep only valid columns that exist in our schema
    valid_cols = [col for col in df.columns if col in VALID_COLUMNS]
    df = df[valid_cols]

    # Drop rows where all values are NaN
    df = df.dropna(how="all")

    # Ensure student_name exists (it's required)
    if "student_name" not in df.columns:
        raise ValueError(
            "The file must contain a 'student_name' or 'name' column."
        )

    # Drop rows where student_name is missing
    df = df.dropna(subset=["student_name"])

    # Convert year to integer if present, handling NaN
    if "year" in df.columns:
        df["year"] = pd.to_numeric(df["year"], errors="coerce")

    # Convert phone to string if present
    if "phone" in df.columns:
        df["phone"] = df["phone"].astype(str).replace("nan", None)
        df["phone"] = df["phone"].replace("None", None)

    # Set default status for missing values
    if "status" in df.columns:
        df["status"] = df["status"].fillna("Active")
    else:
        df["status"] = "Active"
        valid_cols.append("status")

    # Replace NaN with None for proper NULL insertion
    df = df.where(pd.notnull(df), None)

    return df, valid_cols


def process_excel_file(
    file_content: bytes,
    file_name: str,
    db: Session,
) -> Tuple[int, int]:
    """
    Process an uploaded Excel or CSV file and bulk insert student records.
    Optimized for 1,00,000+ records using chunked raw SQL inserts.

    Args:
        file_content: Raw bytes of the uploaded file
        file_name: Original filename (used to detect format)
        db: SQLAlchemy database session

    Returns:
        Tuple of (upload_id, total_records_inserted)

    Raises:
        ValueError: If file format is unsupported or no valid data found
    """
    df, valid_cols = _prepare_dataframe(file_content, file_name)

    total_rows = len(df)
    if total_rows == 0:
        raise ValueError("No valid student records found in the file after cleaning.")

    logger.info(f"Processing {total_rows} records from '{file_name}' in batches of {BATCH_SIZE}")

    # Create upload record first with status 'processing'
    upload = Upload(
        file_name=file_name,
        total_records=0,
        status="processing",
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    upload_id = upload.id

    # ---- Chunked Bulk Insert using raw SQL for maximum speed ----
    # This avoids ORM overhead entirely and commits in batches
    # to prevent long-running transactions and memory issues.

    # Build the column list for the INSERT statement
    insert_cols = [c for c in valid_cols if c in VALID_COLUMNS]

    total_inserted = 0
    try:
        for start in range(0, total_rows, BATCH_SIZE):
            chunk = df.iloc[start : start + BATCH_SIZE]

            # Convert DataFrame chunk to list of dicts for executemany
            records = []
            for _, row in chunk.iterrows():
                record = {}
                for col in insert_cols:
                    val = row.get(col)
                    if col == "year" and val is not None:
                        try:
                            record[col] = int(float(val))
                        except (ValueError, TypeError):
                            record[col] = None
                    else:
                        record[col] = val if val is not None else None
                records.append(record)

            # Use SQLAlchemy Core bulk insert for speed (bypasses ORM)
            if records:
                db.execute(
                    Student.__table__.insert(),
                    records,
                )
                db.commit()
                total_inserted += len(records)
                logger.info(
                    f"  Inserted batch {start // BATCH_SIZE + 1}: "
                    f"{total_inserted}/{total_rows} records"
                )

        # Update upload record with final count and status
        db.query(Upload).filter(Upload.id == upload_id).update({
            "total_records": total_inserted,
            "status": "completed",
        })
        db.commit()

    except Exception as e:
        # Mark upload as failed
        logger.error(f"Bulk insert failed at row ~{total_inserted}: {traceback.format_exc()}")
        try:
            db.rollback()
            db.query(Upload).filter(Upload.id == upload_id).update({
                "total_records": total_inserted,
                "status": "failed",
            })
            db.commit()
        except Exception:
            db.rollback()
        raise

    logger.info(f"Upload #{upload_id} completed: {total_inserted} records inserted.")
    return upload_id, total_inserted


def process_excel_file_background(
    file_content: bytes,
    file_name: str,
    upload_id: int,
):
    """
    Background task version: processes the file using its own DB session.
    Called from the FastAPI BackgroundTasks runner.
    """
    db = SessionLocal()
    try:
        df, valid_cols = _prepare_dataframe(file_content, file_name)

        total_rows = len(df)
        insert_cols = [c for c in valid_cols if c in VALID_COLUMNS]

        # Mark as processing
        db.query(Upload).filter(Upload.id == upload_id).update({
            "status": "processing",
            "total_records": total_rows,
        })
        db.commit()

        total_inserted = 0
        for start in range(0, total_rows, BATCH_SIZE):
            chunk = df.iloc[start : start + BATCH_SIZE]

            records = []
            for _, row in chunk.iterrows():
                record = {}
                for col in insert_cols:
                    val = row.get(col)
                    if col == "year" and val is not None:
                        try:
                            record[col] = int(float(val))
                        except (ValueError, TypeError):
                            record[col] = None
                    else:
                        record[col] = val if val is not None else None
                records.append(record)

            if records:
                db.execute(
                    Student.__table__.insert(),
                    records,
                )
                db.commit()
                total_inserted += len(records)

                # Update progress
                db.query(Upload).filter(Upload.id == upload_id).update({
                    "total_records": total_inserted,
                    "status": "processing",
                })
                db.commit()

                logger.info(
                    f"  [BG] Upload #{upload_id}: {total_inserted}/{total_rows} inserted"
                )

        # Done
        db.query(Upload).filter(Upload.id == upload_id).update({
            "total_records": total_inserted,
            "status": "completed",
        })
        db.commit()
        logger.info(f"[BG] Upload #{upload_id} completed: {total_inserted} records.")

    except Exception as e:
        logger.error(f"[BG] Upload #{upload_id} failed: {traceback.format_exc()}")
        try:
            db.rollback()
            db.query(Upload).filter(Upload.id == upload_id).update({
                "status": "failed",
            })
            db.commit()
        except Exception:
            db.rollback()
    finally:
        db.close()


def preview_excel_file(
    file_content: bytes,
    file_name: str,
    max_preview: int = 100,
) -> list:
    """
    Parse uploaded Excel/CSV file and return a preview of the records.
    For large files, returns only the first `max_preview` rows.
    """
    df, valid_cols = _prepare_dataframe(file_content, file_name)

    # Limit preview to first N rows for performance
    if len(df) > max_preview:
        df = df.head(max_preview)

    # Build list of dicts using vectorized to_dict instead of iterrows
    records = df[valid_cols].to_dict(orient="records")

    # Enforce defaults and clean up types
    for rec in records:
        if "year" in rec and rec["year"] is not None:
            try:
                rec["year"] = int(float(rec["year"]))
            except (ValueError, TypeError):
                rec["year"] = None
        if "status" not in rec or rec["status"] is None:
            rec["status"] = "Active"
        if "photo" not in rec:
            rec["photo"] = None

    return records

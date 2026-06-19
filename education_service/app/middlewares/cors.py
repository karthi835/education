# ============================================================
# middlewares/cors.py - CORS Middleware Configuration
# Configures Cross-Origin Resource Sharing for the frontend
# ============================================================

from fastapi.middleware.cors import CORSMiddleware


def add_cors_middleware(app):
    """
    Add CORS middleware to the FastAPI application.
    Allows the React frontend (localhost:5173) to communicate with the API.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",   # Vite dev server
            "http://localhost:3000",   # Alternate dev port
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

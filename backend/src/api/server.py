from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Garmin Sync API")

# Add CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Electron app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes after app creation to avoid circular imports
from .routes import router
app.include_router(router)
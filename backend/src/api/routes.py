from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date
from typing import Optional, List
import asyncio
from pathlib import Path

from src.garmin_client import GarminClient
from src.file_output import FileOutput

router = APIRouter()

class SyncRequest(BaseModel):
    email: str
    password: str
    start_date: date
    end_date: date
    output_dir: str

class SyncResponse(BaseModel):
    csv_path: str
    xlsx_path: Optional[str] = None
    message: str

@router.post("/sync", response_model=SyncResponse)
async def sync_data(request: SyncRequest):
    try:
        # Initialize clients
        garmin_client = GarminClient(request.email, request.password)
        file_output = FileOutput(Path(request.output_dir))
        
        # Authenticate
        await garmin_client.authenticate()
        
        # Get metrics for each day
        metrics = []
        current_date = request.start_date
        while current_date <= request.end_date:
            daily_metrics = await garmin_client.get_metrics(current_date)
            metrics.append(daily_metrics)
            current_date = current_date.replace(day=current_date.day + 1)
        
        # Save files
        response = SyncResponse(csv_path="", xlsx_path=None, message="")
        
        try:
            csv_path = file_output.save_csv(metrics, request.start_date, request.end_date)
            xlsx_path = file_output.save_xlsx(metrics, request.start_date, request.end_date)
            response.csv_path = str(csv_path)
            response.xlsx_path = str(xlsx_path)
            response.message = "Data exported successfully!"
            
        except ImportError:
            # XLSX not available, save CSV only
            csv_path = file_output.save_csv(metrics, request.start_date, request.end_date)
            response.csv_path = str(csv_path)
            response.message = "Data exported successfully (CSV only)!"
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy"}
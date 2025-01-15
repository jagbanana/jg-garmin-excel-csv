import uvicorn
import typer
from datetime import datetime, date
from typing import Optional
import os
from dotenv import load_dotenv
import logging
from pathlib import Path

from src.garmin_client import GarminClient
from src.file_output import FileOutput
from src.api.server import app

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

cli = typer.Typer()

@cli.command()
def sync_cli(
    start_date: datetime = typer.Option(..., help="Start date (YYYY-MM-DD)"),
    end_date: datetime = typer.Option(..., help="End date (YYYY-MM-DD)"),
    email: Optional[str] = typer.Option(None, help="Garmin Connect email"),
    password: Optional[str] = typer.Option(None, help="Garmin Connect password"),
    output_dir: Optional[str] = typer.Option(None, help="Output directory path")
):
    """
    CLI command to sync Garmin Connect data and save to files
    """
    # Load environment variables
    load_dotenv()
    
    # Get credentials from env vars if not provided as arguments
    email = email or os.getenv("GARMIN_EMAIL")
    password = password or os.getenv("GARMIN_PASSWORD")
    output_dir = output_dir or os.getenv("OUTPUT_DIR") or str(Path.home() / "Documents")

    if not all([email, password]):
        raise typer.BadParameter(
            "Missing required credentials. Provide them as arguments or environment variables."
        )

    import asyncio
    asyncio.run(sync_data(start_date, end_date, email, password, output_dir))

async def sync_data(start_date: datetime, end_date: datetime, email: str, password: str, output_dir: str):
    """
    Core sync functionality used by both CLI and API
    """
    try:
        # Initialize clients
        garmin_client = GarminClient(email, password)
        file_output = FileOutput(Path(output_dir))
        
        logger.info("Authenticating with Garmin...")
        await garmin_client.authenticate()
        
        # Get metrics for each day
        metrics = []
        current_date = start_date.date() if isinstance(start_date, datetime) else start_date
        end = end_date.date() if isinstance(end_date, datetime) else end_date
        
        while current_date <= end:
            logger.info(f"Fetching metrics for {current_date}")
            daily_metrics = await garmin_client.get_metrics(current_date)
            metrics.append(daily_metrics)
            current_date = current_date.replace(day=current_date.day + 1)
        
        # Save files
        logger.info("Saving data...")
        try:
            csv_path = file_output.save_csv(metrics, current_date, end)
            xlsx_path = file_output.save_xlsx(metrics, current_date, end)
            logger.info(f"Data exported to CSV: {csv_path}")
            logger.info(f"Data exported to XLSX: {xlsx_path}")
            
        except ImportError:
            # XLSX not available, save CSV only
            csv_path = file_output.save_csv(metrics, current_date, end)
            logger.info(f"Data exported to CSV: {csv_path}")

        logger.info("Sync completed successfully!")

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise

def main():
    """
    Main entry point that can run either the CLI or API server
    """
    # Check if running in API mode
    if os.getenv("RUN_API", "").lower() in ("1", "true", "yes"):
        # Run the FastAPI server
        uvicorn.run(
            "src.api.server:app",
            host="127.0.0.1",
            port=8000,
            reload=True  # Enable auto-reload during development
        )
    else:
        # Run the CLI
        cli()

if __name__ == "__main__":
    main()
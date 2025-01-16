# Use Python 3.9+ base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code - modified to copy backend/src directly to /app/src
COPY backend/src/ /app/src/

# Set environment variable for API mode
ENV RUN_API=true
ENV PYTHONPATH=/app

# Expose port for API
EXPOSE 8000

# Run the application - modified path
CMD ["python", "-m", "src.main"]
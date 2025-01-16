# Use Python 3.9+ base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the source code
COPY backend/src /app/src

# Set environment variables
ENV PYTHONPATH=/app
ENV RUN_API=true

# Expose port for API
EXPOSE 8000

# Run the application
CMD ["python", "src/main.py"]
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY .env .
COPY credentials/ ./credentials/

# Expose the API port
EXPOSE 8000

# Run the FastAPI server
CMD ["python", "-m", "src.main"]
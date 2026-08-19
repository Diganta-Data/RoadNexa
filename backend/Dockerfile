# ==========================================
# RoadNexa Backend — Production Dockerfile
# ==========================================
FROM python:3.12-slim

# Install system dependencies for GeoPandas/GDAL/Fiona
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL env vars
ENV GDAL_CONFIG=/usr/bin/gdal-config

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY src/ ./src/

# Create upload directory
RUN mkdir -p /tmp/roadnexa/uploads

# Expose port (Render injects $PORT)
EXPOSE 8000

# Start command
CMD ["sh", "-c", "uvicorn iris.main:app --app-dir src --host 0.0.0.0 --port ${PORT:-8000}"]

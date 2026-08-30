FROM python:3.11.9-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      build-essential \
      gdal-bin \
      libgdal-dev \
      libgeos-dev \
      libproj-dev \
      proj-data \
      proj-bin \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt

COPY . .

EXPOSE 10000

CMD ["sh", "-c", "uvicorn iris.main:app --app-dir src --host 0.0.0.0 --port ${PORT:-10000}"]

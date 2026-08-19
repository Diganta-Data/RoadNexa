# RoadNexa

RoadNexa is a full-stack geospatial road intelligence and safety platform for city road networks, accident analytics, data uploads, risk scoring, maps, and recommendations.

## Stack

- Frontend: React, Vite, Tailwind CSS, GSAP, Motion, Three.js, Leaflet, Recharts
- Backend: FastAPI, SQLAlchemy, Pydantic, Pandas, GeoPandas
- Database: PostgreSQL with PostGIS
- Deployment: Vercel frontend, Render backend

## Project Structure

```text
RoadNexa/
  backend/        FastAPI API, services, models, tests
  frontend/       Vite React app
  config/         City, dataset, and risk configuration
  data/           Local data folders, ignored except .gitkeep files
  models/         ML model storage
  scripts/        Local utility scripts
  sql/            SQL extensions, schemas, and views
  render.yaml     Render backend blueprint
  DEPLOYMENT.md   Vercel and Render deployment guide
```

## Local Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn iris.main:app --app-dir src --reload
```

Backend runs at `http://localhost:8000`.

## Local Frontend

```bash
cd frontend
npm ci
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`
- `CORS_ORIGINS`
- `SECRET_KEY`
- `VITE_API_BASE_URL`

Production deploy instructions are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Verification

```bash
cd frontend
npm run lint
npm run build

cd ../backend
$env:PYTHONPATH='src'
.venv\Scripts\python.exe -m pytest tests
```

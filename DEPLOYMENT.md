# RoadNexa Deployment Guide

RoadNexa deploys as two services:

- Frontend: Vercel, root directory `frontend`
- Backend: Render Web Service, root directory `backend`, runtime `Docker`
- Database: Supabase PostgreSQL with PostGIS enabled

## Frontend

Vercel URL:

```text
https://road-nexa.vercel.app
```

Set this Vercel environment variable after Render backend is live:

```env
VITE_API_BASE_URL=https://YOUR_RENDER_BACKEND_URL.onrender.com
```

## Backend On Render

Use Docker runtime because the backend supports GIS files and needs GDAL/GEOS/PROJ libraries for GeoPandas.

Render service settings:

```text
Name: roadnexa-backend
Root Directory: backend
Runtime: Docker
Dockerfile Path: ./Dockerfile
Health Check Path: /health
```

If your existing Render service is set to Python runtime, create a new Web Service with Runtime `Docker`, or change the runtime if Render allows it for your service.

## Render Environment Variables

```env
DATABASE_URL=<your Supabase asyncpg database URL>
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_RELOAD=false
LOG_LEVEL=INFO
SECRET_KEY=<your long production secret>
UPLOAD_DIR=/tmp/roadnexa/uploads
CORS_ORIGINS=https://road-nexa.vercel.app,http://localhost:5173,http://127.0.0.1:5173
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GROQ_API_KEY=
```

## Database Init

Run once after the backend has the production `DATABASE_URL`:

```bash
cd backend
python init_db.py
```

You can run this from local terminal with the same Supabase URL, or from Render Shell.

## Verify

Backend health:

```text
https://YOUR_RENDER_BACKEND_URL.onrender.com/health
```

API docs:

```text
https://YOUR_RENDER_BACKEND_URL.onrender.com/docs
```

Then update Vercel `VITE_API_BASE_URL` and redeploy frontend.

# RoadNexa Deployment Guide

RoadNexa is a two-service app:

- `frontend/` deploys to Vercel as a Vite React app.
- `backend/` deploys to Render as a FastAPI web service.
- PostgreSQL with PostGIS is required for production data.

## 1. Push To GitHub

```bash
git add .
git commit -m "Prepare RoadNexa for Vercel and Render deployment"
git push origin main
```

If your branch is not `main`, push your active branch and choose that branch in Vercel/Render.

## 2. Deploy Frontend On Vercel

1. Go to Vercel and choose **Add New Project**.
2. Import `Diganta-Data/RoadNexa`.
3. Set **Root Directory** to `frontend`.
4. Vercel should detect Vite automatically. Confirm:
   - Framework Preset: `Vite`
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add this Environment Variable:
   - `VITE_API_BASE_URL` = your Render backend URL
   - Example: `https://roadnexa-backend.onrender.com`
6. Click **Deploy**.

For the first deployment, you can temporarily set:

```text
VITE_API_BASE_URL=https://roadnexa-backend.onrender.com
```

Then update it after Render gives you the exact backend URL.

## 3. Deploy Backend On Render

1. Go to Render and choose **New Web Service**.
2. Connect the same GitHub repository.
3. Use these settings:
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn iris.main:app --app-dir src --host 0.0.0.0 --port $PORT`
   - Health Check Path: `/health`
4. Add Environment Variables:
   - `DATABASE_URL`
   - `CORS_ORIGINS`
   - `SECRET_KEY`
   - `BACKEND_RELOAD=false`
   - `UPLOAD_DIR=/tmp/roadnexa/uploads`
5. Deploy the service.

Set `CORS_ORIGINS` to your deployed frontend domains:

```text
https://your-roadnexa-app.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

The backend also allows Vercel preview URLs with `*.vercel.app`.

## 4. Database Setup

Use PostgreSQL with PostGIS enabled. Options:

- Render PostgreSQL plus PostGIS if available on your plan.
- Supabase PostgreSQL with PostGIS extension enabled.
- Neon/Postgres with PostGIS support.

After setting `DATABASE_URL`, initialize tables:

```bash
cd backend
python init_db.py
```

For hosted deployment, run this once from your local machine using the production `DATABASE_URL`, or run it from a Render shell.

## 5. Production URLs To Update

After both services deploy:

1. In Vercel, set `VITE_API_BASE_URL` to the Render backend URL.
2. In Render, set `CORS_ORIGINS` to include the Vercel frontend URL.
3. Redeploy both services.

## Notes

- Frontend routes are handled by `frontend/vercel.json`, so direct links like `/map` and `/ml-predictions` work after refresh.
- Uploaded files on Render free instances should be treated as temporary unless persistent storage is configured. The database records remain, but files in `/tmp` may be cleared.
- Optional API keys: `GEMINI_API_KEY` and `GROQ_API_KEY` only matter if you enable AI analysis features.

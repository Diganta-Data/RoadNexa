# 🚀 RoadNexa Deployment Guide

## Architecture
```
Frontend (Vercel) ──── API calls ────► Backend (Render / Python)
                                            │
                                      Supabase PostgreSQL DB
```

---

## Step 1: Deploy Backend on Render (Standard Python Runtime)

We have removed the heavy GDAL/GeoPandas binary dependencies. The backend is now a standard, lightweight Python application that installs and runs directly on Render without Docker.

### Setup Instructions

1. **Go to [Render Dashboard](https://dashboard.render.com)**

2. **Create New → Web Service**

3. **Connect your GitHub repo** (`RoadNexa`)

4. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `roadnexa-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn iris.main:app --app-dir src --host 0.0.0.0 --port $PORT` |
   | **Plan** | Free |

5. **Set Environment Variables** (in Render dashboard → Environment tab):

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql+asyncpg://postgres:e%21c2%26yt%3D%23Ys24LB@db.wtykkdujrpczkpmejldl.supabase.co:5432/postgres` |
   | `GEMINI_API_KEY` | Your Gemini API key |
   | `CORS_ORIGINS` | `https://your-vercel-app.vercel.app,http://localhost:5173` |
   | `BACKEND_HOST` | `0.0.0.0` |
   | `BACKEND_RELOAD` | `false` |
   | `LOG_LEVEL` | `INFO` |
   | `UPLOAD_DIR` | `/tmp/roadnexa/uploads` |
   | `PYTHON_VERSION` | `3.12.4` |

6. **Click "Create Web Service"** — Render will build and deploy.

7. **Copy your Render URL** (e.g., `https://roadnexa-backend.onrender.com`)

---

## Step 2: Deploy Frontend on Vercel

### Setup Instructions

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import your GitHub repo** (`RoadNexa`)

3. **Configure:**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. **Set Environment Variable:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://roadnexa-backend.onrender.com` ← Your Render backend URL |

5. **Deploy**

---

## Step 3: Update CORS on Render

After Vercel gives you a URL (e.g., `https://roadnexa.vercel.app`), go back to **Render → Environment** and update:

```
CORS_ORIGINS=https://roadnexa.vercel.app,https://your-custom-domain.com
```

# 🚀 RoadNexa Deployment Guide

## Architecture
```
Frontend (Vercel) ──── API calls ────► Backend (Render / Docker)
                                            │
                                      Supabase PostgreSQL DB
```

---

## Step 1: Deploy Backend on Render (Docker)

### Why Docker?
Render's native Python runtime doesn't include GDAL/GEOS system libraries needed by GeoPandas. Using Docker solves this.

### Setup Instructions

1. **Go to [Render Dashboard](https://dashboard.render.com)**

2. **Create New → Web Service**

3. **Connect your GitHub repo** (`RoadNexa`)

4. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `roadnexa-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Docker` |
   | **Dockerfile Path** | `./Dockerfile` |
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

6. **Click "Create Web Service"** — Render will build the Docker image and deploy.

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

---

## Common Issues & Fixes

### Build fails with "cargo install" error
✅ **Fixed**: We now use Docker with `python:3.12-slim` + GDAL system packages.

### 500 errors / DB connection fails
✅ Check that `DATABASE_URL` starts with `postgresql+asyncpg://` (not `postgres://`).

### CORS errors in browser
✅ Make sure `CORS_ORIGINS` on Render includes your exact Vercel URL (with `https://`).

### Render free tier cold starts
⚠️ Free tier spins down after 15min of inactivity. First request after idle takes ~30s.

---

## Vercel Rewrites (Optional)

If you want to avoid CORS entirely, add this to `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://roadnexa-backend.onrender.com/:path*" }
  ]
}
```

Then change `VITE_API_BASE_URL` to `/api` and update all API paths accordingly.

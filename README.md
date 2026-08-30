# 🗺️ RoadNexa — Road Safety Intelligence & AI Analytics

<div align="center">
  <img src="https://raw.githubusercontent.com/Diganta-Data/RoadNexa/main/frontend/public/logo-placeholder.png" alt="RoadNexa Logo" width="120" style="border-radius: 20%;" onerror="this.src='https://img.icons8.com/nolan/256/map.png'"/>
  
  <h3>AI-Powered Geospatial Platform for Multi-City Road Safety & Predictive Maintenance</h3>

  [![GitHub License](https://img.shields.io/github/license/Diganta-Data/RoadNexa?color=blue&style=flat-square)](LICENSE)
  [![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-success?logo=vercel&style=flat-square)](https://road-nexa.vercel.app/)
  [![Render Deployment](https://img.shields.io/badge/Backend-Render-darkviolet?logo=render&style=flat-square)](https://roadnexa-backend.onrender.com/health)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white&style=flat-square)](https://fastapi.tiangolo.com)
  [![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&style=flat-square)](https://react.dev)
  [![Postgres](https://img.shields.io/badge/Database-PostgreSQL_PostGIS-336791?logo=postgresql&style=flat-square)](https://postgis.net)
</div>

---

## 🌟 Introduction
**RoadNexa** is an advanced geospatial safety intelligence and predictive maintenance platform designed to address critical road infrastructure and safety concerns. By integrating real-time geographic data, historical accident reports, road quality parameters, and AI-driven predictive modeling, RoadNexa equips municipal authorities, transport planners, and developers with actionable intelligence to prioritize road repairs, forecast high-risk corridors, and deploy target calming measures.

---

## 🚀 Key Features

### 1. Interactive Safety Map & Multi-Provider Layering
- Centered on India with real-time fly-to flyovers and pulse animations for city transitions.
- Dynamically toggle overlays: **Road Geometries**, **Historical Crash Markers**, and **Potholes/Surface Defects**.
- Swap map layers on the fly: **OpenStreetMap India (Default)**, **Carto Dark**, **Esri Satellite**, and custom ISRO Bhuvan/MapmyIndia tiles.

### 2. Live Reverse Geocoding & City Auto-Enrichment
- Click anywhere on the map to resolve coordinates to physical road segments and landmark addresses using OpenStreetMap Nominatim.
- Selecting any city automatically triggers backend enrichment via the **OSM Overpass API** to map out its road network structure without manual data entry.

### 3. AI Safety Diagnosis & Interactive Q&A Chat
- **✨ Google Gemini 3.6 Flash AI Engine**: Run on-demand diagnostic assessments for any road segment. Analyzes collision histories, pothole density, lane layouts, and speed limits.
- **Interactive Location Q&A**: Ask custom questions directly about the selected location (e.g. *"What causes the high accident rate here?"* or *"What speed limit is recommended?"*) and receive immediate, expert highway-engineering feedback.

### 4. Dynamic Data Management Portal
- Drag-and-drop ingestion supporting **CSV, TSV, Excel, JSON, GeoJSON, and ZIP files** (containing shapefiles/tabular data).
- Robust parser handles datasets **without coordinates** by dynamically scattering coordinates near city centroids to ensure 100% record ingestion.
- Built-in verification screen with instant **"Open Map"** and **"Analytics"** shortcuts for processed datasets.

---

## 📐 Platform Architecture

```mermaid
graph TD
    %% Frontend (User Space)
    subgraph Frontend [React SPA - Vercel]
        UI[Glassmorphism UI Dashboard]
        Map[Leaflet Interactive Map]
        ThreeJS[Hero 3D Scene - Three.js/GSAP]
        Chat[Gemini AI Location Q&A Chat]
        Upload[Drag & Drop Uploader]
    end

    %% Routing / Proxy
    subgraph Routing [API Gateway / Proxy]
        Proxy[Vite Dev Proxy / CORS Middleware]
    end

    %% Backend (Application Space)
    subgraph Backend [FastAPI - Render]
        Main[FastAPI Web Engine]
        Parser[Pure Python ETL & Data Parser]
        CityService[OSM Overpass Enrichment Service]
        AIService[Gemini 3.6 LLM Integration Service]
    end

    %% Third Party API APIs
    subgraph External [External APIs]
        GeminiAPI[Google Gemini API]
        OverpassAPI[OSM Overpass API]
        Nominatim[OSM Nominatim Geocoding]
    end

    %% Database (Storage Space)
    subgraph Storage [Supabase Cloud]
        DB[(PostgreSQL DB)]
        GIS[PostGIS Extensions]
    end

    %% Connections
    UI --> Proxy
    Map --> Proxy
    Chat --> Proxy
    Upload --> Proxy
    
    Proxy --> Main
    Main --> Parser
    Main --> CityService
    Main --> AIService

    CityService --> OverpassAPI
    AIService --> GeminiAPI
    Map -.-> Nominatim

    Parser --> DB
    Main --> DB
    DB --> GIS
```

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Responsive Single Page App (SPA) built with modern state management. |
| **Mapping** | Leaflet, React-Leaflet | Lightweight spatial mapping and marker clustering. |
| **Visualization**| Three.js, Recharts, GSAP | 3D hero page visuals, charts, and fluid user experience transitions. |
| **Backend** | FastAPI, Uvicorn | High-performance asynchronous REST API. |
| **Ingestion** | Python standard library, Pandas | Safe data ingestion of tabular & GIS datasets without binary compile dependencies. |
| **Database** | PostgreSQL, PostGIS | Spatial queries (`ST_AsGeoJSON`, `ST_Distance`) for geographical analytics. |
| **LLM Engine** | Google Gemini 3.6 Flash | Custom location analysis prompts and natural language chat interfaces. |

---

## 💻 Local Setup & Installation

### Prerequisite Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres.your-ref:encoded-password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
GEMINI_API_KEY=your-gemini-api-key
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
SECRET_KEY=generate-a-secure-random-key
```

### 1. Running the Backend
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install pure python requirements
pip install -r requirements.txt

# Start FastAPI dev server
uvicorn iris.main:app --app-dir src --reload
```
The API docs will be available at `http://localhost:8000/docs`.

### 2. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The React portal will spin up at `http://localhost:5173/`.

---

## 🚀 Production Deployment Guidelines

Deploying RoadNexa involves running the frontend on **Vercel** and the backend on **Render** (via standard Python runtime).

### 💡 Crucial Connection Notes
- **IPv4 Connection Pooler (Supabase)**: Because Render's Free tier does not route IPv6 outbound, you must use the Supabase **connection pooler** host (`aws-0-[region].pooler.supabase.com`) on port `5432` rather than the direct Supabase DB link.
- **CORS Handling**: Make sure the `CORS_ORIGINS` environment variable on Render includes the Vercel production URL (e.g. `https://road-nexa.vercel.app`).
- **URL-Encoded Password**: If your Supabase password contains special characters (`#`, `&`, `!`), make sure they are URL-encoded in the `DATABASE_URL` connection string.

For complete, step-by-step production deployment steps, refer to [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🔒 License
RoadNexa is distributed under the MIT License. See [LICENSE](LICENSE) for more information.

# IRIS — Indian Road Intelligence & Safety Platform

A Full-Stack Geospatial Data Analytics and Machine Learning Platform for Multi-City Road Safety Intelligence.

## Features
- **Public Analytics:** Interactive dashboard, GIS map, accident trends.
- **Data Management:** Upload datasets, validate columns, process ETL pipeline.
- **Geospatial Processing:** Point-to-road matching, hotspot clustering.
- **Risk Intelligence:** Configurable Road Risk Score.
- **Machine Learning:** Accident severity prediction.

## Technology Stack
- **Frontend:** React, Vite, JavaScript, CSS3
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, Pydantic
- **Database:** PostgreSQL, PostGIS
- **Deployments:** Vercel (Frontend), Render (Backend)

## Quick Start (Local Development)

### 1. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Modify `.env` to connect to your local or cloud PostgreSQL instance. Make sure the database has the `postgis` extension enabled.

### 2. Run Backend (FastAPI)
Open a terminal in the `backend` directory:
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
# Run the FastAPI server (using --app-dir to include the src folder)
uvicorn iris.main:app --app-dir src --reload
```
The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
The Health check endpoint is at [http://localhost:8000/health](http://localhost:8000/health).

### 3. Run Frontend (React/Vite)
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at [http://localhost:5173](http://localhost:5173).

## Deployment

The project is structured to deploy smoothly to cloud platforms:
- **Frontend (Vercel):** Connect the GitHub repository and select Vite framework. Use `VITE_API_BASE_URL` to point to the backend URL.
- **Backend (Render):** Connect the GitHub repository, select Python environment, set root directory to `backend`, use `pip install -r requirements.txt` as build command, and `uvicorn iris.main:app --host 0.0.0.0 --port $PORT` as the run command.
- **Database:** Provision a PostgreSQL instance with PostGIS support (e.g., Aiven, Render, AWS RDS) and provide the `DATABASE_URL` to the backend.

## Project Structure
- `backend/`: FastAPI application, API routes, database models, services
- `frontend/`: React application, UI components, pages
- `config/`: System configuration (cities, dataset schemas, risk weights)
- `data/`: Local storage for raw, staging, processed, and uploaded files
- `docs/`: Technical documentation
- `models/`: Machine learning models
- `notebooks/`: Jupyter notebooks for data exploration
- `powerbi/`: Power BI integration docs
- `sql/`: SQL migrations and views

## License
MIT

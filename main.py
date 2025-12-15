from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import Base
from database import engine
from routers import employees, overtime

app = FastAPI()

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve the index.html file for the root path /
@app.get("/", response_class=FileResponse)
async def serve_static_index():
    return "static/index.html"  # Path to your index.html, relative to main.py


# Create database tables at startup
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Health check endpoint
@app.get("/health")
async def database_health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute("SELECT 1")
        return {"status": "success", "message": "Database connected successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Include your routers
app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(overtime.router, prefix="/overtime", tags=["Overtime"])

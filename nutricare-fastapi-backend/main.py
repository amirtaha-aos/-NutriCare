from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from config.settings import settings
from database.db import connect_to_mongo, close_mongo_connection

# API Routes
from api import auth, ai, meals, health, exercise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    print("🚀 Starting NutriCare FastAPI Backend...")
    await connect_to_mongo()

    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("generated_pdfs", exist_ok=True)

    yield

    # Shutdown
    print("👋 Shutting down NutriCare Backend...")
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title="NutriCare API",
    description="AI-Powered Nutrition Assistant Backend",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for PDF downloads
app.mount("/static", StaticFiles(directory="generated_pdfs"), name="static")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NutriCare FastAPI Backend",
        "version": "2.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
    }


# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Services"])
app.include_router(meals.router, prefix="/api/meals", tags=["Meals"])
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(exercise.router, prefix="/api/exercise", tags=["Exercise"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )

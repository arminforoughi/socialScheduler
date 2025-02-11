from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from routers import calendar_router, caption_router, image_router, video_router
from database import engine, Base

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(calendar_router.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(caption_router.router, prefix="/api/captions", tags=["captions"])
app.include_router(image_router.router, prefix="/api/images", tags=["images"])
app.include_router(video_router.router, prefix="/api/videos", tags=["videos"]) 



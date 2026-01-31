from fastapi import FastAPI
from pydantic import BaseModel
import os
import pathlib
from contextlib import asynccontextmanager
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from profilingAgent import ProfilingAgent
from user_repository import UserProfileRepository

# Load environment variables at module import time
# Use parent directory since .env is in fit-server/, not fit-server/src/
env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Get env vars at module level
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Global variables
supabase: Client = None
user_repository: Optional[UserProfileRepository] = None
profiling_agent: Optional[ProfilingAgent] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    global supabase, user_repository, profiling_agent
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"✅ Connected to Supabase")
    
    # Initialize Repository and Agent
    user_repository = UserProfileRepository(supabase)
    profiling_agent = ProfilingAgent(user_repository)
    print("✅ Repository and Agents initialized successfully")
    
    yield
    print("👋 Shutting down...")

app = FastAPI(
    title="FitAI Profiling Service",
    description="User profiling service for FitAI",
    version="1.0.0",
    lifespan=lifespan
)


class ProfilingRequest(BaseModel):
    user_id: str
    profile_data: str

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/profiling/{user_id}")
async def get_user_profile(user_id: str):
    """Get a user profile by ID"""
    profile = profiling_agent.get_profile(user_id)
    if "error" in profile:
        raise HTTPException(status_code=404, detail=profile["error"])
    return profile

@app.get("/profiles")
async def get_all_profiles():
    """Get all user profiles"""
    print("[DEBUG] GET /profiles endpoint hit")
    result = profiling_agent.get_all_profiles()
    print(f"[DEBUG] GET /profiles result count: {len(result)}")
    return result

@app.post("/profiling")
async def create_profiling(request: ProfilingRequest):
    return profiling_agent.post_profile(request.model_dump())

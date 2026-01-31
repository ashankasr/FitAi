"""
Health check endpoints for monitoring and load balancers.
"""
from fastapi import APIRouter, Depends
from datetime import datetime

from ..config import Settings, get_settings
from ..models import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns the health status of the API service.",
)
async def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """
    Perform a health check.
    
    Returns:
        HealthResponse with status, timestamp, and version.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.app_version,
    )


@router.get(
    "/ready",
    summary="Readiness Check",
    description="Check if the service is ready to accept traffic.",
)
async def readiness_check() -> dict:
    """
    Check service readiness (database connections, dependencies, etc.)
    """
    # Add database/dependency checks here
    return {"ready": True}


@router.get(
    "/live",
    summary="Liveness Check", 
    description="Check if the service is alive.",
)
async def liveness_check() -> dict:
    """
    Simple liveness probe.
    """
    return {"alive": True}

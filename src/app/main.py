"""
FitAI API - Fast Python API built with FastAPI.

This is the main application entry point that configures
the FastAPI app with all middleware, routers, and settings.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import health_router, users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler for startup/shutdown events.
    """
    # Startup: Initialize resources
    print("🚀 Starting FitAI API...")
    # Add database connection, cache initialization, etc.
    
    yield
    
    # Shutdown: Cleanup resources  
    print("👋 Shutting down FitAI API...")
    # Close database connections, etc.


def create_app() -> FastAPI:
    """
    Application factory that creates and configures the FastAPI app.
    """
    settings = get_settings()
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="""
## FitAI API 🏋️

A fast, modern Python API built with FastAPI.

### Features
- ⚡ **High Performance** - Async Python with Uvicorn
- 📝 **Auto Documentation** - OpenAPI/Swagger UI
- ✅ **Validation** - Pydantic data validation
- 🔒 **Type Safe** - Full type hints support
        """,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(health_router, prefix=settings.api_prefix)
    app.include_router(users_router, prefix=settings.api_prefix)
    
    # Root endpoint
    @app.get("/", tags=["Root"])
    async def root():
        """Root endpoint with API information."""
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": f"{settings.api_prefix}/health",
        }
    
    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )

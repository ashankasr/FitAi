"""
Development server runner.
Run this file directly to start the API server.
"""
import uvicorn
from app.config import get_settings


def main():
    """Start the development server."""
    settings = get_settings()
    
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║                      🏋️ FitAI API                            ║
╠══════════════════════════════════════════════════════════════╣
║  Server:     http://{settings.host}:{settings.port}                          ║
║  API Docs:   http://localhost:{settings.port}/docs                       ║
║  ReDoc:      http://localhost:{settings.port}/redoc                      ║
║  Health:     http://localhost:{settings.port}{settings.api_prefix}/health            ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )


if __name__ == "__main__":
    main()

from pathlib import Path

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.database import engine, Base
from app.routers.auth import router as auth_router, require_auth
from app.routers.products import router as products_router
from app.routers.customers import router as customers_router
from app.routers.orders import router as orders_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes — public
app.include_router(auth_router)

# API routes — protected
app.include_router(products_router, dependencies=[Depends(require_auth)])
app.include_router(customers_router, dependencies=[Depends(require_auth)])
app.include_router(orders_router, dependencies=[Depends(require_auth)])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


# ── Serve frontend static files ──
# In the combined Docker image, the built frontend lives at /app/static
# In development, the separate frontend server handles this.
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        """Catch-all: serve index.html for any non-API route (SPA support)."""
        file_path = STATIC_DIR / "index.html"
        if file_path.exists():
            return FileResponse(str(file_path))
        return {"error": "Frontend not built"}

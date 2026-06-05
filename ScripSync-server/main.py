from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from core.ai_client import close_ai_client
from core.config import get_settings
from core.exception_handler import register_exception_handlers


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await close_ai_client()


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(api_router)


@app.get("/", tags=["system"])
async def root():
    return {
        "message": "ScriptSync-AI server is running",
        "version": settings.app_version,
    }

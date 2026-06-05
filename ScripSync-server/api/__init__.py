from fastapi import APIRouter

from api.ai_doc_api import router as ai_doc_router
from api.script_api import router as script_router
from api.yaml_api import router as yaml_router

api_router = APIRouter(prefix="/api")
api_router.include_router(script_router)
api_router.include_router(yaml_router)
api_router.include_router(ai_doc_router)
